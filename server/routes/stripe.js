import express from 'express'

const router = express.Router()

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

    const { plan = 'monthly', successUrl, cancelUrl } = req.body

    const priceId = plan === 'annual'
      ? process.env.STRIPE_PRICE_ANNUAL
      : process.env.STRIPE_PRICE_MONTHLY

    if (!priceId) {
      return res.status(503).json({
        error: `Stripe price ID not configured for "${plan}" plan. Add STRIPE_PRICE_${plan.toUpperCase()} to environment.`,
        configured: false,
      })
    }

    const origin = req.get('origin') || req.headers.referer?.replace(/\/$/, '') || 'https://shiori-v1.vercel.app'

    const session = await stripe.checkout.sessions.create({
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
    })

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

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('New Pro subscription:', event.data.object.customer_email)
        break
      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object.customer)
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook error:', err.message)
    res.status(400).send(`Webhook Error: ${err.message}`)
  }
})

export default router
