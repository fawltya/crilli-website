# Stripe Checkout Testing Guide

## Testing Flow Overview

1. **User completes checkout** → Creates order in Payload (status: `null`)
2. **User pays via Stripe** → Stripe processes payment
3. **Stripe sends webhook** → Your webhook endpoint receives `checkout.session.completed`
4. **Webhook creates Inkthreadable order** → Order sent to Inkthreadable API
5. **Order status updated** → Payload order status set to `'processing'`

## Step 1: Use Stripe Test Cards

On the Stripe Checkout page, use these test card numbers:

### Successful Payment
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP**: Any 5 digits (e.g., `12345`)

### Other Test Cards
- **Declined Card**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Insufficient Funds**: `4000 0000 0000 9995`

## Step 2: Set Up Webhook Testing (Local Development)

For local testing, you need to forward Stripe webhooks to your local server using Stripe CLI.

### Install Stripe CLI

**macOS (Homebrew):**
```bash
brew install stripe/stripe-cli/stripe
```

**Other platforms:**
See https://stripe.com/docs/stripe-cli

### Login to Stripe CLI
```bash
stripe login
```

### Forward Webhooks to Local Server

In a separate terminal, run:
```bash
stripe listen --forward-to localhost:3000/api/stripe-webhook
```

This will:
- Start listening for webhook events
- Forward them to your local server
- Display a webhook signing secret (starts with `whsec_`)

### Set the Webhook Secret

Copy the webhook signing secret from the Stripe CLI output and add it to your `.env` file:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Important**: The webhook secret changes each time you restart `stripe listen`. Make sure to update your `.env` file if you restart it.

## Step 3: Test the Complete Flow

1. **Add items to cart** on your site
2. **Go to checkout** (`/checkout`)
3. **Fill in shipping address**
4. **Click "Proceed to Payment"**
5. **On Stripe Checkout page**:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
   - Any ZIP code
6. **Complete payment**

## Step 4: Monitor the Flow

### Check Your Terminal/Console

You should see logs in this order:

1. **Order Created** (from `/api/stripe/create-checkout`):
   ```
   Order created in Payload with ID: X
   ```

2. **Webhook Received** (from `/api/stripe-webhook`):
   ```
   Webhook received: checkout.session.completed
   Order found: X
   ```

3. **Inkthreadable Order Created** (if successful):
   ```
   Order created at Inkthreadable: { id: '...', ... }
   ```

4. **Order Updated**:
   ```
   Order status updated to 'processing'
   ```

### Check Payload Admin

1. Go to `/admin/collections/orders`
2. Find your test order
3. Verify:
   - Status is `processing` (after payment)
   - `inkthreadableOrderId` is set (if Inkthreadable API call succeeded)
   - Shipping address is correct
   - Items match your cart

### Check Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/payments
2. Find your test payment
3. Verify it shows as "Succeeded"

## Troubleshooting

### Webhook Not Received

**Problem**: Payment completes but webhook doesn't fire

**Solutions**:
- Make sure `stripe listen` is running
- Check that `STRIPE_WEBHOOK_SECRET` matches the secret from `stripe listen`
- Verify your webhook endpoint is accessible: `http://localhost:3000/api/stripe-webhook`
- Check terminal for webhook signature verification errors

### Inkthreadable API Fails

**Problem**: Webhook received but Inkthreadable order creation fails

**Check**:
- `INKTHREADABLE_APP_ID` is set in `.env`
- `INKTHREADABLE_SECRET_KEY` is set in `.env`
- `INKTHREADABLE_BRAND_NAME` is set (optional, defaults to 'Crilli')
- Variants have `inkthreadable.productNumber` set
- Variants have print file URLs if required
- Check server logs for detailed error messages

### Order Status Not Updating

**Problem**: Payment succeeds but order status stays `null`

**Check**:
- Webhook is being received (check `stripe listen` output)
- Webhook signature verification is passing
- Order ID in metadata matches the created order
- Check server logs for errors

## Environment Variables Needed

Make sure these are set in your `.env` file:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx  # From `stripe listen`

# Inkthreadable
# ⚠️  IMPORTANT: Inkthreadable has NO test mode - all orders are REAL!
# Set INKTHREADABLE_ENABLED=false during testing to prevent accidental orders
INKTHREADABLE_ENABLED=false  # Set to 'true' ONLY when ready to create real orders
INKTHREADABLE_API_URL=https://api.inkthreadable.co.uk
INKTHREADABLE_APP_ID=your_app_id  # Only needed if INKTHREADABLE_ENABLED=true
INKTHREADABLE_SECRET_KEY=your_secret_key  # Only needed if INKTHREADABLE_ENABLED=true
INKTHREADABLE_BRAND_NAME=Crilli  # Optional

# Site URL (for Stripe redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Testing Production Webhooks

When deploying to production:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe-webhook`
3. Select event: `checkout.session.completed`
4. Copy the webhook signing secret
5. Set `STRIPE_WEBHOOK_SECRET` in your production environment

## Next Steps After Testing

Once testing is successful:
1. Verify orders appear in Inkthreadable dashboard
2. Test with different product variants
3. Test with different shipping addresses
4. Test error scenarios (declined cards, etc.)

