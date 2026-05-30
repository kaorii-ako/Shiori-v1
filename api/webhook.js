import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Service role key bypasses RLS — only for server-side use
const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

export const config = { api: { bodyParser: false } }

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

async function setProStatus(userId, email, isPro, expiresAt = null) {
  if (!supabaseAdmin) {
    console.warn('[webhook] Supabase admin not configured — skipping pro status update')
    return
  }
  const update = { is_pro: isPro, pro_expires_at: expiresAt }
  // Try by user_id first, fall back to email match
  if (userId) {
    await supabaseAdmin.from('profiles').update(update).eq('id', userId)
  } else if (email) {
    const { data: users } = await supabaseAdmin.auth.admin.listUsers()
    const match = users?.users?.find(u => u.email === email)
    if (match) {
      await supabaseAdmin.from('profiles').update(update).eq('id', match.id)
    }
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  let event

  try {
    const buf = await buffer(req)
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.supabase_user_id
      const email = session.customer_email
      console.log('[webhook] New Pro subscription:', email)
      // Set pro = true, expires in 1 year (or subscription handles it)
      await setProStatus(userId, email, true, null)
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object
      const isPro = sub.status === 'active' || sub.status === 'trialing'
      const userId = sub.metadata?.supabase_user_id
      const cusId = sub.customer
      // Lookup email from customer if no userId
      let email = null
      if (!userId) {
        try {
          const customer = await stripe.customers.retrieve(cusId)
          email = customer.email
        } catch {}
      }
      await setProStatus(userId, email, isPro, null)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object
      const userId = sub.metadata?.supabase_user_id
      let email = null
      if (!userId) {
        try {
          const customer = await stripe.customers.retrieve(sub.customer)
          email = customer.email
        } catch {}
      }
      console.log('[webhook] Subscription cancelled:', email || sub.customer)
      await setProStatus(userId, email, false, null)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object
      console.log('[webhook] Payment failed:', invoice.customer_email)
      break
    }

    default:
      console.log(`[webhook] Unhandled: ${event.type}`)
  }

  res.status(200).json({ received: true })
}
