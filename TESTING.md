# Testing Guide for Taravani

This guide will walk you through testing all features of the application.

## Prerequisites

1. PostgreSQL database running locally or remotely
2. Node.js installed
3. All dependencies installed (`npm install`)

## Step 1: Database Setup

### 1.1 Create Database

If using local PostgreSQL:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE human_astrology;

# Exit
\q
```

### 1.2 Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/human_astrology?schema=public"
```

### 1.3 Initialize Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed admin user
npm run db:seed
```

You should see:
```
Admin user created: admin@taravani.com
Default password: admin123
```

## Step 2: Start Development Server

```bash
npm run dev
```

The server should start at `http://localhost:3000`

## Step 3: Test Customer Flow

### 3.1 Test Home Page

1. Open `http://localhost:3000` in your browser
2. Verify:
   - Hero section displays correctly
   - Navigation links work
   - All sections are visible (How it works, What you get, etc.)
   - "Get My Reading" button works

### 3.2 Test Form Submission (Step 1)

1. Click "Get My Reading" or navigate to `/form/step1`
2. Fill in:
   - Full Name: `John Doe`
   - Email: `john@example.com`
3. Click "Continue"
4. Verify: Redirects to Step 2

### 3.3 Test Form Submission (Step 2)

1. Fill in:
   - Date of Birth: Select a date (e.g., `1990-01-15`)
   - Time of Birth: `14:30` or check "I don't know the exact time" and select approximate
   - Place of Birth: `New York, USA`
2. Click "Next"
3. Verify: Redirects to Step 3

### 3.4 Test Form Submission (Step 3)

1. Select Focus Area: `Career` (or any option)
2. Check both consent checkboxes
3. Click "Request My Reading"
4. Verify:
   - Redirects to confirmation page
   - Confirmation page shows the email address
   - Success message displays

### 3.5 Verify Database Entry

You can verify the reading was created in the database:

```bash
# Using psql
psql -U postgres -d human_astrology

# Query readings
SELECT id, name, email, status, "deleteAt" FROM "Reading";

# Exit
\q
```

Or use Prisma Studio:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can view and edit data.

## Step 4: Test Admin Flow

### 4.1 Test Admin Login

1. Navigate to `http://localhost:3000/admin/login`
2. Enter credentials:
   - Email: `admin@taravani.com`
   - Password: `admin123`
3. Click "Login"
4. Verify: Redirects to `/admin/dashboard`

### 4.2 Test Admin Dashboard

1. Verify dashboard displays:
   - Table of readings
   - Status filters (All, New, In Progress, Sent, Failed)
   - Reading details (name, email, focus area, status, date)
2. Test filters:
   - Click "New" - should show only NEW readings
   - Click "All" - should show all readings
3. Click "View/Edit" on a reading
4. Verify: Redirects to reading detail page

### 4.3 Test Reading Detail Page

1. Verify customer details display:
   - Name, email, DOB, time, place, focus area
   - Current status
   - Delete date (30 days from creation)
2. Test status dropdown:
   - Change status to "IN_PROGRESS"
   - Click "Save Report"
   - Verify status updates
3. Test report writing:
   - Enter some text in the textarea (e.g., "This is a test report...")
   - Click "Save Report"
   - Verify success message

### 4.4 Test Email Sending

**Option A: With Email Configured**

1. Add email credentials to `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=your-email@gmail.com
   ```
2. In the reading detail page:
   - Ensure report text is filled in
   - Click "Save & Send Email"
   - Verify:
     - Status changes to "SENT"
     - `reportSentAt` timestamp is set
     - Success message appears
     - Check email inbox for the report

**Option B: Without Email Configured (Development)**

1. Without email credentials, click "Save & Send Email"
2. Check browser console - should see:
   ```
   Email not configured. Would send to: john@example.com
   Report text: [first 100 chars]...
   ```
3. Verify status still updates to "SENT" (for testing)

## Step 5: Test Cleanup Job

### 5.1 Manual Testing

1. Create a test reading with old `deleteAt` date:

```bash
# Using psql
psql -U postgres -d human_astrology

UPDATE "Reading" 
SET "deleteAt" = NOW() - INTERVAL '1 day'
WHERE email = 'john@example.com';

\q
```

2. Call cleanup endpoint:

```bash
# Using curl
curl http://localhost:3000/api/admin/cleanup

# Or in browser
http://localhost:3000/api/admin/cleanup
```

3. Verify:
   - Response shows `deletedCount: 1` (or number of deleted rows)
   - Reading is deleted from database

### 5.2 Verify with Prisma Studio

```bash
npx prisma studio
```

Check that readings with `deleteAt <= now()` are removed.

## Step 6: Test Edge Cases

### 6.1 Form Validation

1. Try submitting Step 1 without name/email - should show errors
2. Try submitting Step 2 without required fields - should show errors
3. Try submitting Step 3 without checkboxes - should show errors
4. Try invalid email format - should show validation error

### 6.2 Admin Authentication

1. Try accessing `/admin/dashboard` without login - should redirect to login
2. Try accessing `/admin/submissions/[id]` without login - should redirect to login
3. Logout and verify you can't access admin pages

### 6.3 Status Transitions

1. Test changing status from NEW → IN_PROGRESS → SENT
2. Test sending email when status is already SENT
3. Test FAILED status (can be set manually or when email fails)

## Step 7: Test Static Pages

1. Navigate to `/about` - verify content displays
2. Navigate to `/privacy` - verify privacy policy
3. Navigate to `/terms` - verify terms and disclaimer
4. Test navigation links in footer

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql -U postgres -d human_astrology -c "SELECT 1;"

# Check DATABASE_URL format
echo $DATABASE_URL
```

### Prisma Issues

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or just push schema again
npm run db:push
```

### Email Not Sending

1. Check SMTP credentials in `.env`
2. For Gmail, use App Password (not regular password)
3. Check console logs for error messages
4. Verify SMTP settings match your email provider

### Port Already in Use

```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

## Quick Test Checklist

- [ ] Home page loads
- [ ] Form submission works (all 3 steps)
- [ ] Confirmation page shows
- [ ] Reading appears in database
- [ ] Admin login works
- [ ] Admin dashboard shows readings
- [ ] Can view reading details
- [ ] Can write report text
- [ ] Can update status
- [ ] Email sending works (or logs correctly)
- [ ] Cleanup job deletes old readings
- [ ] Static pages load
- [ ] Navigation works

## Next Steps

Once testing is complete:

1. Set up production database
2. Configure production email
3. Set up cron job for cleanup
4. Deploy application
5. Change default admin password

