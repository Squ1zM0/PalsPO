#!/bin/bash

# PenPal Platform - Quick Start Script
# This script helps you get started with local development

set -e

echo "🎯 PenPal Platform - Quick Start Setup"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version is too old. Please upgrade to v16 or higher."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL is not installed locally."
    echo "   For local development, you can:"
    echo "   1. Install PostgreSQL: https://www.postgresql.org/download/"
    echo "   2. Use a cloud database (Neon, Supabase, Railway)"
    echo ""
    read -p "Continue without local PostgreSQL? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ PostgreSQL detected"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found."
    echo ""
    read -p "Create .env file from template? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        echo "✅ Created .env file. Please edit it with your configuration."
        echo ""
        echo "Required configurations:"
        echo "  - DATABASE_URL: Your PostgreSQL connection string"
        echo "  - JWT_SECRET: Run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
        echo "  - ADDRESS_ENCRYPTION_KEY: Run: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
        echo "  - AWS S3 credentials (for file uploads)"
        echo ""
        read -p "Press Enter to continue after configuring .env..."
    fi
else
    echo "✅ .env file found"
fi

echo ""
echo "🗄️  Database Setup"
echo ""

read -p "Set up database schema? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your database name (default: penpal): " DB_NAME
    DB_NAME=${DB_NAME:-penpal}
    
    if command -v psql &> /dev/null; then
        echo "Creating database..."
        createdb "$DB_NAME" 2>/dev/null || echo "Database may already exist"
        
        echo "Running schema..."
        psql "$DB_NAME" < backend/schema.sql
        
        echo "✅ Database schema created!"
        echo ""
        
        read -p "Seed database with test users? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            cd backend
            node seed.js
            cd ..
            echo ""
            echo "✅ Test users created:"
            echo "   - Admin: admin@penpal.com / admin123"
            echo "   - Alice: alice@test.com / password123"
            echo "   - Bob: bob@test.com / password123"
            echo "   - Carol: carol@test.com / password123"
            echo "   - Dave: dave@test.com / password123"
        fi
    else
        echo "⚠️  PostgreSQL not available. Run schema manually:"
        echo "   psql YOUR_DATABASE_URL < backend/schema.sql"
    fi
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🚀 To start the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  npm run dev"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
echo "📚 For Vercel deployment, see: VERCEL_DEPLOYMENT.md"
echo ""
