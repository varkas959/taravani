# Database Setup Guide

## Option 1: Install PostgreSQL Locally (Windows)

### Step 1: Download PostgreSQL

1. Go to https://www.postgresql.org/download/windows/
2. Download the installer from EnterpriseDB
3. Run the installer

### Step 2: Installation Settings

- **Port**: Keep default `5432`
- **Superuser password**: Remember this password!
- **Database**: Default `postgres` is fine

### Step 3: Verify Installation

Open Command Prompt or PowerShell:

```bash
# Check if PostgreSQL is installed
psql --version

# If not in PATH, add it:
# C:\Program Files\PostgreSQL\XX\bin
```

### Step 4: Start PostgreSQL Service

**Method 1: Services GUI**
1. Press `Win + R`, type `services.msc`
2. Find "postgresql-x64-XX" service
3. Right-click → Start

**Method 2: Command Line (as Administrator)**
```powershell
# Find service name first
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Start service (replace SERVICE_NAME with actual name)
Start-Service postgresql-x64-XX
```

### Step 5: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Enter your password when prompted
# Then create database:
CREATE DATABASE human_astrology;

# Exit
\q
```

### Step 6: Update .env File

Create or update `.env` in project root:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/human_astrology?schema=public"
```

Replace `YOUR_PASSWORD` with the password you set during installation.

### Step 7: Test Connection

```bash
npm run db:push
```

---

## Option 2: Use Docker (Easiest)

If you have Docker installed:

### Step 1: Run PostgreSQL Container

```bash
docker run --name taravani-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=taravani -p 5432:5432 -d postgres
```

### Step 2: Update .env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/human_astrology?schema=public"
```

### Step 3: Test Connection

```bash
npm run db:push
```

### Useful Docker Commands

```bash
# Stop container
docker stop taravani-db

# Start container
docker start taravani-db

# Remove container
docker rm taravani-db

# View logs
docker logs taravani-db
```

---

## Option 3: Use Cloud Database (No Local Setup)

### Supabase (Recommended - Free)

1. Go to https://supabase.com
2. Sign up for free account
3. Create new project
4. Go to Settings → Database
5. Copy the connection string
6. Update `.env`:

```env
DATABASE_URL="postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### Neon (Free Tier)

1. Go to https://neon.tech
2. Sign up and create project
3. Copy connection string
4. Update `.env`

---

## Option 4: Use SQLite (Quick Testing Only)

**Note**: SQLite has limitations but works for basic testing.

### Step 1: Update Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### Step 2: Update Models

SQLite doesn't support all PostgreSQL types. You may need to adjust field types.

### Step 3: Push Schema

```bash
npm run db:push
```

---

## Quick Test Without Database

If you just want to test the frontend without database:

1. Comment out database calls in API routes
2. Use mock data
3. Test UI/UX flow

---

## Verification Steps

After setup, verify everything works:

```bash
# 1. Generate Prisma Client
npm run db:generate

# 2. Push schema
npm run db:push

# 3. Seed admin user
npm run db:seed

# 4. Start dev server
npm run dev
```

If all steps succeed, you're ready to test!

