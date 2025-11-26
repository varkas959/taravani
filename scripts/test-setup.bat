@echo off
REM Quick setup script for testing (Windows)
REM Usage: scripts\test-setup.bat

echo.
echo 🚀 Taravani - Quick Test Setup
echo ======================================
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo Creating .env.example template...
    echo.
    echo Please create a .env file with:
    echo DATABASE_URL="postgresql://user:password@localhost:5432/human_astrology?schema=public"
    echo.
    pause
)

echo 📦 Step 1: Generating Prisma Client...
call npm run db:generate

echo.
echo 🗄️  Step 2: Pushing database schema...
call npm run db:push

echo.
echo 🌱 Step 3: Seeding admin user...
call npm run db:seed

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Start the dev server: npm run dev
echo 2. Open http://localhost:3000
echo 3. Test the form submission
echo 4. Login to admin: http://localhost:3000/admin/login
echo    Email: admin@taravani.com
echo    Password: admin123
echo.
echo For detailed testing guide, see TESTING.md
echo.
pause

