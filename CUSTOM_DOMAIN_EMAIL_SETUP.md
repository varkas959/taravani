# Custom Domain Email Setup (sender@taravani.com)

To use `sender@taravani.com` instead of Gmail, you need to use an email service that supports custom domains. Here are the best options:

## Option 1: SendGrid (Recommended - Easy Setup)

SendGrid offers a free tier (100 emails/day) and supports custom domains.

### Step 1: Sign Up for SendGrid

1. Go to https://sendgrid.com
2. Sign up for a free account
3. Verify your email address

### Step 2: Verify Your Domain

1. In SendGrid dashboard, go to **Settings** > **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Select your DNS provider (or choose "Other")
4. Follow the instructions to add DNS records:
   - **CNAME records** for domain authentication
   - **SPF record** (TXT)
   - **DKIM records** (CNAME)
   - **DMARC record** (TXT) - optional but recommended

5. Add these records to your domain's DNS settings (wherever you manage taravani.com)

### Step 3: Create API Key

1. Go to **Settings** > **API Keys**
2. Click **Create API Key**
3. Name it "Taravani Production"
4. Select **Full Access** or **Mail Send** permissions
5. Copy the API key (you'll only see it once!)

### Step 4: Configure Environment Variables

Add to your `.env` file:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key-here
SMTP_FROM=sender@taravani.com
```

**Important:** 
- `SMTP_USER` must be exactly `apikey` (not your SendGrid username)
- `SMTP_PASSWORD` is your API key
- `SMTP_FROM` is `sender@taravani.com`

### Step 5: Test

1. Restart your dev server
2. Log in to admin panel
3. Send a test email
4. Check the recipient's inbox

---

## Option 2: Mailgun (Good Alternative)

Mailgun offers 5,000 emails/month free for 3 months, then paid.

### Step 1: Sign Up

1. Go to https://www.mailgun.com
2. Sign up and verify your account
3. Add and verify your domain `taravani.com`

### Step 2: Add DNS Records

Mailgun will provide DNS records to add:
- TXT records for verification
- CNAME records for tracking
- MX records (if needed)

Add these to your domain's DNS.

### Step 3: Get SMTP Credentials

1. Go to **Sending** > **Domain Settings**
2. Click on your verified domain
3. Go to **SMTP credentials** tab
4. Create SMTP user or use default
5. Copy SMTP password

### Step 4: Configure Environment Variables

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@taravani.com
SMTP_PASSWORD=your-mailgun-smtp-password
SMTP_FROM=sender@taravani.com
```

---

## Option 3: AWS SES (Best for High Volume)

AWS SES is very affordable ($0.10 per 1,000 emails) and reliable.

### Step 1: Set Up AWS SES

1. Sign in to AWS Console
2. Go to **Amazon SES**
3. Verify your domain `taravani.com`
4. Add the provided DNS records to your domain

### Step 2: Verify Email Address (Optional)

1. In SES, go to **Verified identities**
2. Click **Create identity**
3. Enter `sender@taravani.com`
4. Verify via email or DNS

### Step 3: Get SMTP Credentials

1. Go to **SMTP settings** in SES
2. Click **Create SMTP credentials**
3. Save the username and password

### Step 4: Configure Environment Variables

```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
SMTP_FROM=sender@taravani.com
```

**Note:** Replace `us-east-1` with your AWS region (e.g., `us-west-2`, `eu-west-1`)

---

## Option 4: Zoho Mail (Free Email Hosting)

If you want actual email hosting (not just sending), Zoho offers free email for custom domains.

### Step 1: Sign Up

1. Go to https://www.zoho.com/mail/
2. Sign up for free plan
3. Add your domain `taravani.com`

### Step 2: Configure DNS

Add MX records and other DNS records provided by Zoho.

### Step 3: Create Email Account

1. Create `sender@taravani.com` email account in Zoho
2. Set a password for this account

### Step 4: Configure Environment Variables

```env
SMTP_HOST=smtp.zoho.com
SMTP_PORT=587
SMTP_USER=sender@taravani.com
SMTP_PASSWORD=your-zoho-email-password
SMTP_FROM=sender@taravani.com
```

---

## DNS Records You'll Need to Add

Regardless of which service you choose, you'll typically need to add these DNS records to your domain:

### SPF Record (TXT)
```
v=spf1 include:sendgrid.net ~all
```
(Replace `sendgrid.net` with your provider's SPF)

### DKIM Records (CNAME)
Your email provider will give you specific CNAME records to add.

### DMARC Record (TXT) - Optional but Recommended
```
v=DMARC1; p=none; rua=mailto:admin@taravani.com
```

## Where to Add DNS Records

1. **Go to your domain registrar** (where you bought taravani.com)
   - Examples: GoDaddy, Namecheap, Google Domains, Cloudflare
2. **Find DNS Management** or **DNS Settings**
3. **Add the records** provided by your email service
4. **Wait for propagation** (can take up to 48 hours, usually 1-2 hours)

## Testing Your Setup

### 1. Verify Domain (in your email service dashboard)
- Most services show "Verified" status once DNS records are correct

### 2. Test Email Sending
```bash
# Test locally
npm run dev
# Then send a test email from admin panel
```

### 3. Check Email Deliverability
- Send a test email to yourself
- Check spam folder
- Use tools like https://www.mail-tester.com to check your score

## Recommended Setup for Taravani

**For Start:** Use **SendGrid** (free tier, easy setup)
**For Scale:** Use **AWS SES** (very affordable, reliable)

## Quick Start with SendGrid

1. Sign up: https://sendgrid.com
2. Verify domain: Settings → Sender Authentication
3. Create API key: Settings → API Keys
4. Add to `.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.your-api-key-here
   SMTP_FROM=sender@taravani.com
   ```
5. Update DNS records (provided by SendGrid)
6. Wait for verification (usually 1-2 hours)
7. Test!

## Troubleshooting

### "Domain not verified"
- Check DNS records are added correctly
- Wait for DNS propagation (up to 48 hours)
- Use DNS checker: https://dnschecker.org

### "Authentication failed"
- Verify SMTP credentials are correct
- For SendGrid: Make sure `SMTP_USER` is exactly `apikey`
- Check API key has correct permissions

### Emails going to spam
- Ensure SPF, DKIM, and DMARC records are set
- Use a reputable email service (SendGrid, Mailgun, AWS SES)
- Avoid sending too many emails too quickly
- Include unsubscribe link in emails

### "Relay access denied"
- Your domain might not be fully verified
- Check email service dashboard for verification status
- Ensure DNS records are correct

