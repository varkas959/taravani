# Taravani

A full-stack web application for personalized birth chart readings. Customers can submit their birth details through a 3-step form, and admins can write and send personalized reports via email.

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Email**: Nodemailer
- **Authentication**: bcryptjs (admin login)

## Features

### Customer Features
- Beautiful, minimal home page with hero section, testimonials, FAQ
- 3-step multi-page form:
  1. Contact information (name, email)
  2. Birth details (date, time, place)
  3. Reading preferences and consent
- Confirmation page after submission
- Static pages: About, Privacy Policy, Terms & Disclaimer

### Admin Features
- Admin login page
- Dashboard to view all readings with filtering by status
- Detailed reading view with birth chart information
- Rich text editor to write personalized reports
- Send reports via email directly from the admin panel
- Automated cleanup of old readings (30 days)

## Database Schema

### Reading Model
- `id`: Unique identifier
- `name`: Customer full name
- `email`: Customer email
- `dob`: Date of birth
- `timeOfBirth`: Time of birth (string)
- `placeOfBirth`: Place of birth
- `focusArea`: Focus area (Career, Relationships, Health, Money, General)
- `status`: Status ("NEW", "IN_PROGRESS", "SENT", "FAILED")
- `reportText`: Report content (nullable)
- `reportSentAt`: When report was sent (nullable)
- `createdAt`: When reading was created
- `deleteAt`: When reading should be deleted (createdAt + 30 days)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

Create a PostgreSQL database and update the `.env` file with your database URL:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/human_astrology?schema=public"
```

### 3. Configure Email

**📧 See `BREVO_SETUP.md` for Brevo setup (Recommended - Easy!)**
**📧 See `EMAIL_SETUP.md` for detailed email configuration instructions.**
**📧 See `CUSTOM_DOMAIN_EMAIL_SETUP.md` for setting up `sender@taravani.com`**

For email functionality, add your email credentials to `.env`:

**Option A: Brevo (Recommended - Free 300 emails/day)**
```env
BREVO_API_KEY=your_smtp_key_here
BREVO_EMAIL=your-email@example.com
BREVO_FROM=sender@taravani.com
```

**Quick Brevo Setup:**
1. Sign up at https://www.brevo.com (free account)
2. Go to Settings → SMTP & API → SMTP tab
3. Copy your SMTP Key
4. Add to `.env` as `BREVO_API_KEY`
5. Verify sender email in Brevo dashboard

**Option B: Gmail (Quick Start)**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com
```

**Option C: Custom Domain with SendGrid**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_FROM=sender@taravani.com
```

Note: If email is not configured, the app will still work but emails won't be sent (details will be logged to console).

### 4. Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Seed Admin User

```bash
npm run db:seed
```

This creates a default admin user:
- **Email**: admin@taravani.com
- **Password**: admin123

**⚠️ Important**: Change this password after first login!

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scheduled Cleanup Job

**⏰ See `CRON_SETUP.md` for detailed cron job setup instructions.**

The app includes an automated cleanup endpoint that deletes readings older than 30 days.

### Quick Setup

1. **Generate CRON_SECRET:**
   ```bash
   openssl rand -hex 32
   ```

2. **Add to `.env`:**
   ```env
   CRON_SECRET=your-generated-secret-key
   ```

3. **Set up cron job based on your platform:**
   - **Vercel:** Create `vercel.json` (see CRON_SETUP.md)
   - **Other platforms:** Use external cron service or server cron

### Manual Testing

```bash
curl -X POST http://localhost:3000/api/admin/cleanup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## API Routes

- `POST /api/submissions` - Create new reading
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/submissions` - Get all readings (with optional status filter)
- `GET /api/admin/submissions/[id]` - Get reading details
- `PATCH /api/admin/submissions/[id]` - Update reading and send email
- `POST /api/admin/send-email` - Send report email
- `POST /api/admin/cleanup` - Delete old readings (30+ days)

## Email Template

When a report is sent, the email includes:
- Subject: "Your birth chart reading, [Name]"
- Body: The report text rendered inline
- Note: "We store your details for 30 days so we can resend this if needed, then they are permanently deleted."

## Production Deployment

1. Set up a PostgreSQL database (e.g., on Vercel Postgres, Supabase, or Railway)
2. Update `DATABASE_URL` in your production environment
3. Configure SMTP credentials for email sending
4. Set `CRON_SECRET` for the cleanup endpoint
5. Run database migrations: `npm run db:push`
6. Seed admin user: `npm run db:seed`
7. Set up cron job for daily cleanup (see above)
8. Build the application: `npm run build`
9. Deploy to Vercel, Railway, or your preferred hosting platform

## Security Notes

- The current admin authentication uses localStorage (client-side). For production, implement proper session management with NextAuth.js or similar.
- Always use environment variables for sensitive data
- Change the default admin password immediately
- Consider adding rate limiting for API routes
- Implement CSRF protection for forms
- Protect the cleanup endpoint with `CRON_SECRET`

## Key Constraints

- ✅ No public signup/login for users
- ✅ No public report download link
- ✅ Delivery only through email
- ✅ Temporary storage rule enforced with automated deletion after 30 days

## License

This project is private and proprietary.
