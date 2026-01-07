#!/bin/bash

# Environment Variable Generator for PenPal Platform
# This script helps generate secure secrets for your Vercel deployment

echo "========================================="
echo "PenPal Platform - Environment Setup"
echo "========================================="
echo ""

# Function to generate a random hex string
generate_secret() {
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
}

echo "Generating secure secrets for your deployment..."
echo ""

# Generate JWT Secret
JWT_SECRET=$(generate_secret)
echo "✅ JWT_SECRET (for authentication tokens):"
echo "$JWT_SECRET"
echo ""

# Generate Address Encryption Key
ADDRESS_KEY=$(generate_secret)
echo "✅ ADDRESS_ENCRYPTION_KEY (for encrypting user addresses):"
echo "$ADDRESS_KEY"
echo ""

echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "1. Copy the secrets above"
echo ""
echo "2. Add them to Vercel:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select your project: pals-po"
echo "   - Go to: Settings → Environment Variables"
echo "   - Add each variable with its value"
echo ""
echo "3. Add your DATABASE_URL:"
echo "   - Get it from your database provider (Neon, Supabase, etc.)"
echo "   - Format: postgresql://user:pass@host:port/database"
echo ""
echo "4. Redeploy your application:"
echo "   - Go to: Deployments"
echo "   - Click on latest deployment"
echo "   - Click 'Redeploy'"
echo ""
echo "5. Verify deployment:"
echo "   - Visit: https://pals-po.vercel.app/api/health"
echo "   - Should show all checks passing"
echo ""
echo "========================================="
echo "Optional Variables (for full features):"
echo "========================================="
echo ""
echo "AWS S3 (for file uploads):"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo "  - AWS_REGION (e.g., us-east-1)"
echo "  - S3_BUCKET"
echo ""
echo "SendGrid (for emails):"
echo "  - SENDGRID_API_KEY"
echo ""
echo "Firebase (for push notifications):"
echo "  - FIREBASE_PROJECT_ID"
echo "  - FIREBASE_PRIVATE_KEY"
echo "  - FIREBASE_CLIENT_EMAIL"
echo ""
echo "========================================="
