# Razorpay Payment Integration Setup

This guide will help you set up Razorpay payment integration for Taravani.

## Prerequisites

1. A Razorpay account (sign up at https://razorpay.com)
2. Your Razorpay API keys (Key ID and Key Secret)

## Step 1: Get Your Razorpay API Keys

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. If you don't have keys yet, click **Generate API Key**
4. Copy your **Key ID** and **Key Secret**
   - **Important**: Keep your Key Secret secure and never share it publicly

### Test vs Live Mode

- **Test Mode**: Use test keys for development. Test cards are available in the Razorpay dashboard.
- **Live Mode**: Use live keys for production. Switch to live mode in your dashboard.

## Step 2: Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

**For production**, add these to your hosting platform's environment variables:
- Vercel: Project Settings → Environment Variables
- Other platforms: Check their documentation for environment variable setup

## Step 3: Update Database Schema

Run the database migration to add payment fields:

```bash
npm run db:push
```

Or if using migrations:

```bash
npm run db:migrate
```

## Step 4: Test the Integration

### Test Mode Testing

1. Use Razorpay test cards from the [Razorpay Test Cards page](https://razorpay.com/docs/payments/test-cards/)
2. Common test cards:
   - **Success**: `4111 1111 1111 1111` (any future expiry, any CVV)
   - **Failure**: `4000 0000 0000 0002` (any future expiry, any CVV)

### Testing Flow

1. Fill out the form (Steps 1-3)
2. On the payment page, click "Pay ₹499 & Complete Order"
3. Use a test card to complete payment
4. Verify that:
   - Payment is processed successfully
   - Reading is created in the database with `paymentStatus: "PAID"`
   - Confirmation email is sent
   - User is redirected to confirmation page

## Step 5: Webhook Setup (Optional but Recommended)

For production, set up webhooks to handle payment status updates:

1. Go to **Settings** → **Webhooks** in Razorpay Dashboard
2. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret

Add to `.env.local`:
```env
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

## Payment Flow

1. **User fills form** (Steps 1-3)
2. **Step 3 redirects to payment page** (`/form/payment`)
3. **Payment page creates Razorpay order** via `/api/payments/create-order`
   - Creates a reading record with `paymentStatus: "PENDING"`
   - Creates Razorpay order
   - Returns order details to frontend
4. **User completes payment** via Razorpay checkout
5. **Payment verification** via `/api/payments/verify`
   - Verifies payment signature
   - Updates reading with `paymentStatus: "PAID"` and payment ID
   - Sends confirmation email
6. **User redirected to confirmation page** with success message

## Database Fields

The `Reading` model now includes:
- `razorpayOrderId`: Razorpay order ID
- `razorpayPaymentId`: Razorpay payment ID (set after successful payment)
- `paymentStatus`: `PENDING`, `PAID`, or `FAILED`
- `amount`: Amount in paise (₹499 = 49900 paise)

## Troubleshooting

### Payment Gateway Not Loading
- Check that Razorpay script is loading: `https://checkout.razorpay.com/v1/checkout.js`
- Check browser console for errors
- Verify `RAZORPAY_KEY_ID` is set correctly

### Payment Verification Fails
- Check that `RAZORPAY_KEY_SECRET` matches your Key Secret
- Verify signature generation matches Razorpay's algorithm
- Check server logs for detailed error messages

### Order Creation Fails
- Verify both `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set
- Check that database connection is working
- Verify the reading record is being created

### Test Cards Not Working
- Ensure you're using test mode keys (not live keys)
- Check that test cards haven't expired
- Try different test cards from Razorpay documentation

## Security Notes

1. **Never commit API keys to version control**
   - Always use environment variables
   - Add `.env.local` to `.gitignore`

2. **Use HTTPS in production**
   - Razorpay requires HTTPS for live payments
   - Most hosting platforms provide HTTPS by default

3. **Verify payments server-side**
   - Never trust client-side payment data
   - Always verify payment signature on the server

4. **Handle failed payments**
   - Update `paymentStatus` to `FAILED` if payment fails
   - Allow users to retry payment

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- Test Cards: https://razorpay.com/docs/payments/test-cards/

