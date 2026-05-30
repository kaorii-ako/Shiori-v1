import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICES = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  annual: process.env.STRIPE_PRICE_ANNUAL,
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://shiori-v1.vercel.app'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({
      error: 'Payment system not configured. Add STRIPE_SECRET_KEY to Vercel environment variables.',
      configured: false,
    })
  }

  const { billing = 'monthly', email, supabaseUserId } = req.body || {}

  const priceId = PRICES[billing]
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid billing period. Use "monthly" or "annual".' })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${APP_URL}/pro/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${APP_URL}/pro`,
      ...(email && { customer_email: email }),
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          plan: 'shiori_pro',
          billing,
          supabase_user_id: supabaseUserId || '',
        },
      },
      metadata: {
        billing,
        supabase_user_id: supabaseUserId || '',
      },
    })

    res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Stripe error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
