# Email Configuration Guide

## Where to Configure Email

Email configuration is done through **environment variables** in your `.env` file (for local development) or in your hosting platform's environment variables settings (for production).

## Using Custom Domain Email (sender@taravani.com)

**📧 See `CUSTOM_DOMAIN_EMAIL_SETUP.md` for detailed instructions on setting up `sender@taravani.com`**

To use a custom domain email instead of Gmail, you'll need to:
1. Use an email service that supports custom domains (SendGrid, Mailgun, AWS SES, Brevo)
2. Verify your domain with DNS records
3. Configure SMTP settings accordingly

## Step 1: Choose Your Email Provider

### Option A: Brevo (Recommended - Easy Setup)

Brevo (formerly Sendinblue) offers a free tier with 300 emails/day and is very easy to set up.

1. **Sign up:** https://www.brevo.com (free account available)
2. **Get your SMTP key:**
   - Go to **Settings** → **SMTP & API**
   - Click on **SMTP** tab
   - Copy your **SMTP Key** (this is your API key)

3. **Add to `.env` file:**
   ```env
   BREVO_API_KEY=your_smtp_key_here
   BREVO_EMAIL=your-email@example.com
   BREVO_FROM=sender@taravani.com
   ```

   **Note:** 
   - `BREVO_EMAIL` is your Brevo account email
   - `BREVO_FROM` is the sender email (can be your verified email or custom domain)
   - If you want to use `sender@taravani.com`, verify your domain in Brevo first

4. **Verify your sender email/domain:**
   - Go to **Senders** in Brevo dashboard
   - Add and verify your email address or domain
   - Once verified, you can use it in `BREVO_FROM`

**That's it!** Brevo is now configured. The app will automatically use Brevo for sending emails.

### Option B: Gmail (Quick Start)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Create an App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Taravani" as the name
   - Copy the 16-character password generated

3. **Add to `.env` file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-character-app-password
   SMTP_FROM=your-email@gmail.com
   ```

### Option C: SendGrid (For Production)

1. **Sign up:** https://sendgrid.com
2. **Create API Key:**
   - Go to Settings > API Keys
   - Create new API key with "Mail Send" permissions
   - Copy the API key

3. **Add to `.env` file:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-sendgrid-api-key
   SMTP_FROM=your-verified-sender@yourdomain.com
   ```

### Option D: AWS SES (For High Volume)

1. **Set up AWS SES** in your AWS account
2. **Verify your email/domain**
3. **Get SMTP credentials** from AWS SES console
4. **Add to `.env` file:**
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-ses-smtp-username
   SMTP_PASSWORD=your-ses-smtp-password
   SMTP_FROM=your-verified-email@yourdomain.com
   ```

### Option E: Other SMTP Providers

Any SMTP provider will work. Common options:
- **Mailgun:** `smtp.mailgun.org:587`
- **Postmark:** `smtp.postmarkapp.com:587`
- **Zoho:** `smtp.zoho.com:587`
- **Outlook:** `smtp-mail.outlook.com:587`

## Step 2: Configure Environment Variables

### For Local Development

Create a `.env` file in the root directory:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

### For Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Add each variable:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`

### For Production (Railway)

1. Go to your Railway project
2. Click on your service
3. Go to **Variables** tab
4. Add each environment variable

### For Production (Other Platforms)

Add environment variables through your hosting platform's dashboard or CLI.

## Step 3: Test Email Sending

1. Start your development server: `npm run dev`
2. Log in to admin panel
3. Create or edit a reading
4. Click "Save & Send Email"
5. Check the customer's email inbox

## Troubleshooting

### Email Not Sending

1. **Check environment variables are set:**
   ```bash
   # In your terminal
   echo $SMTP_USER
   ```

2. **Check server logs** for error messages

3. **Verify SMTP credentials** are correct

4. **Check spam folder** - emails might be going to spam

5. **For Gmail:** Make sure you're using an App Password, not your regular password

### Common Errors

- **"Invalid login"** - Wrong SMTP credentials
- **"Connection timeout"** - Wrong SMTP host or port
- **"Authentication failed"** - Need to use App Password for Gmail

## Email Template Location

The email template is in: `app/api/admin/send-email/route.ts`

You can customize the HTML and text versions of the email there.

