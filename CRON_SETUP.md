# Cron Job Setup Guide

The cleanup endpoint (`/api/admin/cleanup`) deletes readings older than 30 days. You need to set up a cron job to call this endpoint daily.

## Step 1: Set CRON_SECRET

First, generate a secure secret key:

```bash
# Generate a random secret (32 characters)
openssl rand -hex 32
```

Or use an online generator: https://randomkeygen.com/

### Add to Environment Variables

**Local `.env` file:**
```env
CRON_SECRET=your-generated-secret-key-here
```

**Production:** Add `CRON_SECRET` to your hosting platform's environment variables.

## Step 2: Choose Your Hosting Platform

### Option A: Vercel (Recommended - Easiest)

Vercel has built-in cron job support.

1. **Create `vercel.json` in your project root:**

```json
{
  "crons": [
    {
      "path": "/api/admin/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

2. **Add CRON_SECRET to Vercel environment variables:**
   - Go to your project > Settings > Environment Variables
   - Add `CRON_SECRET` with your secret value

3. **Deploy your project:**
   ```bash
   vercel --prod
   ```

4. **Verify cron job:**
   - Go to your Vercel project dashboard
   - Navigate to **Settings** > **Crons**
   - You should see your cron job listed

**Schedule format:** `0 2 * * *` means "run daily at 2:00 AM UTC"

### Option B: Railway

Railway doesn't have built-in cron, but you can use:

1. **External Cron Service (Recommended):**
   - Use **cron-job.org** (free): https://cron-job.org
   - Use **EasyCron**: https://www.easycron.com
   - Use **Cronitor**: https://cronitor.io

2. **Setup with cron-job.org:**
   - Sign up at https://cron-job.org
   - Create new cron job
   - URL: `https://your-app.railway.app/api/admin/cleanup`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: Daily at 2:00 AM

### Option C: Other Platforms (DigitalOcean, AWS, etc.)

#### Using External Cron Service

1. **Use cron-job.org or similar:**
   - URL: `https://your-domain.com/api/admin/cleanup`
   - Method: POST
   - Headers: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: `0 2 * * *` (daily at 2 AM)

#### Using Server Cron (If you have SSH access)

1. **SSH into your server**

2. **Edit crontab:**
   ```bash
   crontab -e
   ```

3. **Add this line:**
   ```bash
   # Run cleanup daily at 2:00 AM
   0 2 * * * curl -X POST https://your-domain.com/api/admin/cleanup -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```

4. **Save and exit**

### Option D: GitHub Actions (Free Alternative)

If you're using GitHub, you can set up a GitHub Action:

1. **Create `.github/workflows/cleanup.yml`:**

```yaml
name: Daily Cleanup

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2:00 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Call Cleanup Endpoint
        run: |
          curl -X POST https://your-domain.com/api/admin/cleanup \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

2. **Add CRON_SECRET to GitHub Secrets:**
   - Go to your repository > Settings > Secrets and variables > Actions
   - Add new secret: `CRON_SECRET`

## Step 3: Test the Cleanup Endpoint

### Manual Test (Local)

```bash
# Test without secret (development)
curl http://localhost:3000/api/admin/cleanup

# Test with secret (production-like)
curl -X POST http://localhost:3000/api/admin/cleanup \
  -H "Authorization: Bearer your-cron-secret"
```

### Manual Test (Production)

```bash
curl -X POST https://your-domain.com/api/admin/cleanup \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Expected response:
```json
{
  "success": true,
  "deletedCount": 0,
  "deletedAt": "2025-01-23T02:00:00.000Z"
}
```

## Step 4: Verify It's Working

1. **Check your database** after the cron runs:
   ```sql
   SELECT COUNT(*) FROM "Reading" WHERE "deleteAt" <= NOW();
   ```

2. **Check server logs** for cleanup activity

3. **Monitor cron service** (if using external service) for execution history

## Schedule Options

Common cron schedules:

- `0 2 * * *` - Daily at 2:00 AM UTC
- `0 3 * * *` - Daily at 3:00 AM UTC
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight

## Security Notes

- **Never commit CRON_SECRET to git**
- **Use a strong, random secret** (at least 32 characters)
- **The cleanup endpoint is protected** - it requires the CRON_SECRET in the Authorization header
- **If CRON_SECRET is not set**, the endpoint will still work (for development), but it's recommended to set it in production

## Troubleshooting

### Cron Job Not Running

1. **Check cron service logs** (if using external service)
2. **Verify CRON_SECRET** matches in both places
3. **Check server logs** for errors
4. **Test manually** with curl to verify endpoint works

### Getting 401 Unauthorized

- Verify `CRON_SECRET` in environment variables matches the one in your cron job
- Check the Authorization header format: `Bearer YOUR_SECRET`

### Cleanup Not Deleting Records

- Verify `deleteAt` dates are in the past
- Check database connection
- Review server logs for errors

