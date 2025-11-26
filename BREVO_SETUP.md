# Brevo Email Setup Guide

Brevo (formerly Sendinblue) is now configured and ready to use! This guide will help you set it up quickly.

## Quick Setup Steps

### 1. Get Your Brevo API Key

1. Log in to your [Brevo account](https://app.brevo.com/)
2. Go to **Settings** → **SMTP & API**
3. Click on the **SMTP** tab
4. Copy your **SMTP Key** (this is your API key)

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Brevo Configuration
BREVO_API_KEY=your_smtp_key_here
BREVO_EMAIL=your-email@example.com
BREVO_FROM=sender@taravani.com
```

**What each variable means:**
- `BREVO_API_KEY`: Your SMTP key from Brevo dashboard
- `BREVO_EMAIL`: Your Brevo account email (the email you used to sign up)
- `BREVO_FROM`: The sender email address (can be your verified email or custom domain)

### 3. Verify Your Sender Email

To send emails from `sender@taravani.com`:

1. Go to **Senders** in your Brevo dashboard
2. Click **Add a sender**
3. Enter your email address (e.g., `sender@taravani.com`)
4. Verify the email by clicking the verification link sent to your inbox
5. If using a custom domain, add DNS records as instructed by Brevo

### 4. Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Test by submitting the form or sending a report from admin panel
3. Check the recipient's inbox (and spam folder)

## Brevo Free Tier Limits

- **300 emails/day** (free tier)
- **Unlimited contacts**
- **No credit card required**

## Using Custom Domain (sender@taravani.com)

1. **Add Domain in Brevo:**
   - Go to **Senders** → **Domains**
   - Click **Add a domain**
   - Enter `taravani.com`

2. **Add DNS Records:**
   - Brevo will provide DNS records to add
   - Add them to your domain's DNS settings
   - Wait for verification (usually a few minutes)

3. **Set BREVO_FROM:**
   ```env
   BREVO_FROM=sender@taravani.com
   ```

## Troubleshooting

### Emails Not Sending

1. **Check API Key:**
   - Make sure `BREVO_API_KEY` is correct
   - Copy the full key (no spaces)

2. **Check Sender Verification:**
   - Go to **Senders** in Brevo dashboard
   - Ensure your sender email is verified (green checkmark)

3. **Check Daily Limit:**
   - Free tier: 300 emails/day
   - Check your usage in Brevo dashboard

4. **Check Server Logs:**
   - Look for error messages in your terminal
   - Common errors:
     - "Invalid API key" → Check `BREVO_API_KEY`
     - "Sender not verified" → Verify sender in Brevo dashboard
     - "Daily limit exceeded" → Wait or upgrade plan

### Email Going to Spam

1. **Verify Sender:**
   - Use a verified sender email
   - For custom domain, complete domain verification

2. **Add SPF/DKIM Records:**
   - Brevo provides these in domain settings
   - Add them to your DNS

3. **Warm Up Your Domain:**
   - Start with small volumes
   - Gradually increase sending volume

## Environment Variables Summary

**For Brevo:**
```env
BREVO_API_KEY=your_smtp_key
BREVO_EMAIL=your-email@example.com
BREVO_FROM=sender@taravani.com
```

**For SMTP (alternative):**
```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your_smtp_key
SMTP_FROM=sender@taravani.com
```

**Note:** The app automatically detects `BREVO_API_KEY` and uses Brevo. If you prefer SMTP method, use the SMTP variables instead.

## Production Deployment

When deploying to production (Vercel, Railway, etc.):

1. Add the same environment variables to your hosting platform
2. Go to your project settings → Environment Variables
3. Add:
   - `BREVO_API_KEY`
   - `BREVO_EMAIL`
   - `BREVO_FROM`

## Support

- **Brevo Documentation:** https://help.brevo.com/
- **Brevo Support:** support@brevo.com
- **Brevo Dashboard:** https://app.brevo.com/

