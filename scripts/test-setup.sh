#!/bin/bash

# Quick setup script for testing
# Usage: bash scripts/test-setup.sh

echo "🚀 Taravani - Quick Test Setup"
echo "======================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating .env.example template..."
    echo ""
    echo "Please create a .env file with:"
    echo "DATABASE_URL=\"postgresql://user:password@localhost:5432/human_astrology?schema=public\""
    echo ""
    read -p "Press enter to continue after creating .env file..."
fi

echo "📦 Step 1: Generating Prisma Client..."
npm run db:generate

echo ""
echo "🗄️  Step 2: Pushing database schema..."
npm run db:push

echo ""
echo "🌱 Step 3: Seeding admin user..."
npm run db:seed

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start the dev server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Test the form submission"
echo "4. Login to admin: http://localhost:3000/admin/login"
echo "   Email: admin@taravani.com"
echo "   Password: admin123"
echo ""
echo "For detailed testing guide, see TESTING.md"

