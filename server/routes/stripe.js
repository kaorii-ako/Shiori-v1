import express from 'express'
import { createClient } from '@supabase/supabase-js'

const router = express.Router()

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey)
}

async function upsertSubscription(supabase, data) {
  if (!supabase) return
  const { error } = await supabase
    .from('subscriptions')
    .upsert(data, { onConflict: 'user_id' })
  if (error) console.error('[Stripe webhook] Supabase upsert error:', error.message)
}

async function getUserIdByEmail(supabase, email) {
  if (!supabase || !email) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (error) console.warn('[Stripe webhook] profile lookup error:', error.message)
  return data?.id || null
}

// POST /api/create-checkout-session
router.post('/create-checkout-session', async (req, res) => {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    return res.status(503).json({
      error: 'Payment system not configured. Add STRIPE_SECRET_KEY to environment variables.',
      configured: false,
    })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = Stripe(secretKey)

    // Support both 'billing' (new) and 'plan' (legacy) keys
    const { billing, plan, email, supabaseUserId, successUrl, cancelUrl } = req.body
    const resolvedPlan = billing || plan || 'monthly'

    const priceId = resolvedPlan === 'annual'
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY

    if (!priceId) {
      return res.status(503).json({
        error: `Stripe price ID not configured for "${resolvedPlan}" plan. Add STRIPE_PRICE_${resolvedPlan.toUpperCase()} to environment.`,
        configured: false,
      })
    }

    const origin = req.get('origin') || req.headers.referer?.replace(/\/$/, '') || 'https://shiorii.tech'

    const sessionParams = {
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${origin}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/pro`,
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7,
        metadata: { source: 'shiori-web' },
      },
      metadata: {
        supabaseUserId: supabaseUserId || '',
      },
    }

    if (email) sessionParams.customer_email = email

    const session = await stripe.checkout.sessions.create(sessionParams)

    res.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    res.status(500).json({ error: error.message || 'Failed to create checkout session' })
  }
})

// POST /api/stripe-webhook
router.post('/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return res.status(200).json({ received: true })
  }

  try {
    const Stripe = (await import('stripe')).default
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY)
    const event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
    const supabase = getSupabaseAdmin()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerEmail = session.customer_details?.email || session.customer_email
        let userId = session.metadata?.supabaseUserId || null
        if (!userId && customerEmail) {
          userId = await getUserIdByEmail(supabase, customerEmail)
        }

        console.log('[Stripe] checkout.session.completed:', customerEmail, 'userId:', userId)

        if (userId) {
          // Fetch subscription details for period_end
          let periodEnd = null
          if (session.subscription) {
            try {
              const sub = await stripe.subscriptions.retrieve(session.subscription)
              periodEnd = sub.current_period_end
                ? new Date(sub.current_period_end * 1000).toISOString()
                : null
            } catch (e) {
              console.warn('[Stripe webhook] subscription retrieve error:', e.message)
            }
          }

          await upsertSubscription(supabase, {
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            status: 'active',
            plan: 'pro',
            current_period_end: periodEnd,
            updated_at: new Date().toISOString(),
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        console.log('[Stripe] subscription cancelled:', sub.customer)
        if (supabase) {
          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', sub.id)
          if (error) console.error('[Stripe webhook] cancel update error:', error.message)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        console.log('[Stripe] invoice.payment_failed:', invoice.customer)
        if (supabase && invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({ status: 'past_due', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', invoice.subscription)
          if (error) console.error('[Stripe webhook] past_due update error:', error.message)
        }
        break
      }

      default:
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
})

export default router
