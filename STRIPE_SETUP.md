# Activate Stripe Payments for Shiori Pro

Four steps to turn on real ฿199/month billing.

---

## 1. Create a Stripe account

Go to [dashboard.stripe.com](https://dashboard.stripe.com) → create account → complete verification.

---

## 2. Create your products

In Stripe Dashboard → **Products** → **Add product**:

**Shiori Pro — Monthly**
- Name: `Shiori Pro`
- Pricing model: Recurring
- Price: `199 THB / month`
- Copy the **Price ID** → looks like `price_1ABC...`

**Shiori Pro — Annual**
- Same product → Add another price
- Price: `1,790 THB / year` (25% off)
- Copy the **Price ID**

---

## 3. Add environment variables to Vercel

Go to [vercel.com/kaorii-kaoos-projects/shiori-v1/settings/environment-variables](https://vercel.com/kaorii-kaoos-projects/shiori-v1/settings/environment-variables) and add:

| Variable | Value |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` from Stripe API keys |
| `STRIPE_PRICE_MONTHLY` | Price ID from step 2 |
| `STRIPE_PRICE_ANNUAL` | Price ID from step 2 |
| `STRIPE_WEBHOOK_SECRET` | From step 4 below |

**Redeploy** after adding variables: `vercel --prod`

---

## 4. Register the webhook

In Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**:

- URL: `https://shiori-v1.vercel.app/api/webhook`
- Events to listen for:
  - `checkout.session.completed`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET` in Vercel.

---

## 5. Test it

Use Stripe test keys first (`sk_test_...`). Click **Start Free Trial** on `/pro` — you should be redirected to Stripe's hosted checkout page.

Test card: `4242 4242 4242 4242`, any future expiry, any CVC.

---

## Revenue math

| Users | Monthly | Annual |
|---|---|---|
| 100 | ฿19,900 | ฿238,800 |
| 500 | ฿99,500 | ฿1,194,000 |
| 4,200 | ฿835,800 | **฿10,029,600** |

At 4,200 paying Pro users sustained for 1 year = **฿10M**.
