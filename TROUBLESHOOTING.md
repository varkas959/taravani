# Troubleshooting Guide

## Database Connection Issues

### Error: "Can't reach database server at 'localhost:5432'"

This means PostgreSQL is either:
1. Not installed
2. Not running
3. Running on a different port
4. Connection string is incorrect

### Solution 1: Check if PostgreSQL is Running

**Windows:**
```bash
# Check if PostgreSQL service is running
sc query postgresql-x64-XX

# Or check in Services
# Press Win+R, type "services.msc", look for PostgreSQL service
```

**Start PostgreSQL service (Windows):**
```bash
# As Administrator
net start postgresql-x64-XX

# Or use Services GUI
```

**Mac/Linux:**
```bash
# Check if running
pg_isready

# Or check process
ps aux | grep postgres

# Start if not running
brew services start postgresql  # Mac with Homebrew
sudo systemctl start postgresql  # Linux
```

### Solution 2: Verify Connection String

Check your `.env` file:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public"
```

Common issues:
- Wrong username (default is often `postgres`)
- Wrong password
- Wrong database name
- Wrong port (default is `5432`)

**Test connection manually:**

**Windows (PowerShell):**
```powershell
# If psql is in PATH
psql -U postgres -h localhost -p 5432

# Or find psql location
& "C:\Program Files\PostgreSQL\XX\bin\psql.exe" -U postgres
```

**Mac/Linux:**
```bash
psql -U postgres -h localhost -p 5432
```

### Solution 3: Create Database

If PostgreSQL is running but database doesn't exist:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE human_astrology;

# Exit
\q
```

### Solution 4: Use Alternative Database (For Testing)

If you don't want to install PostgreSQL locally, you can use:

**Option A: Docker (Recommended)**
```bash
# Run PostgreSQL in Docker
docker run --name postgres-test -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=human_astrology -p 5432:5432 -d postgres

# Update .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/human_astrology?schema=public"
```

**Option B: Cloud Database (Free tiers available)**
- [Supabase](https://supabase.com) - Free PostgreSQL
- [Neon](https://neon.tech) - Free PostgreSQL
- [Railway](https://railway.app) - Free tier available

**Option C: SQLite (For Quick Testing)**

Change `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

Then run:
```bash
npm run db:push
```

Note: SQLite has limitations but works for testing.

### Solution 5: Check Firewall/Antivirus

Sometimes firewalls block PostgreSQL:
- Windows Firewall
- Antivirus software
- Corporate network restrictions

### Solution 6: Verify PostgreSQL Installation

**Windows:**
```bash
# Check if PostgreSQL is installed
where psql

# Or check default location
dir "C:\Program Files\PostgreSQL"
```

**Mac:**
```bash
which psql
brew list | grep postgres
```

**Linux:**
```bash
which psql
dpkg -l | grep postgres  # Debian/Ubuntu
rpm -qa | grep postgres  # RedHat/CentOS
```

### Quick Fix Checklist

1. ✅ PostgreSQL service is running
2. ✅ `.env` file exists with correct `DATABASE_URL`
3. ✅ Database `human_astrology` exists
4. ✅ Username and password are correct
5. ✅ Port 5432 is not blocked
6. ✅ Can connect manually with `psql`

### Still Having Issues?

1. **Check Prisma logs:**
   ```bash
   DEBUG="*" npm run db:push
   ```

2. **Try different connection format:**
   ```env
   # Try with explicit host
   DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/human_astrology?schema=public"
   ```

3. **Check PostgreSQL logs:**
   - Windows: `C:\Program Files\PostgreSQL\XX\data\log\`
   - Mac: `/usr/local/var/postgres/`
   - Linux: `/var/log/postgresql/`

4. **Reset and try again:**
   ```bash
   # Delete node_modules/.prisma
   rm -rf node_modules/.prisma
   npm run db:generate
   npm run db:push
   ```

