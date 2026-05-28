import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = { api: { bodyParser: false } }

async function buffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
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
      console.log('New Pro subscription:', session.customer_email, session.metadata?.billing)
      // TODO: store subscription in Appwrite / DB, send welcome email
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object
      console.log('Subscription cancelled:', sub.customer)
      // TODO: downgrade user to free tier
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object
      console.log('Payment failed:', invoice.customer_email)
      // TODO: send payment failed email
      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  res.status(200).json({ received: true })
}
