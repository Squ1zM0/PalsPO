# Vercel Deployment Guide

This guide explains how to deploy the PenPal Platform to Vercel.

## Overview

The PenPal Platform is a full-stack application with:
- **Frontend**: React + Vite (static site)
- **Backend**: Node.js + Express (serverless functions)
- **Database**: PostgreSQL (requires external hosting)

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. A PostgreSQL database (we recommend [Neon](https://neon.tech/), [Supabase](https://supabase.com/), or [Railway](https://railway.app/))
3. An AWS S3 bucket for file storage
4. (Optional) SendGrid account for email notifications
5. (Optional) Firebase account for push notifications

## Step 1: Set Up the Database

### Option A: Using Neon (Recommended)

1. Create a free account at [neon.tech](https://neon.tech/)
2. Create a new project
3. Copy your connection string (it looks like: `postgresql://user:password@host/database`)
4. Run the database schema:
   ```bash
   psql "YOUR_DATABASE_URL" < backend/schema.sql
   ```

### Option B: Using Supabase

1. Create a free account at [supabase.com](https://supabase.com/)
2. Create a new project
3. Go to Settings > Database and copy the connection string
4. Run the database schema:
   ```bash
   psql "YOUR_DATABASE_URL" < backend/schema.sql
   ```

### Seed Test Data (Optional)

To create test users for development:
```bash
# Set up environment variables first (see step 3)
cd backend
node seed.js
```

This creates:
- Admin: `admin@penpal.com` / `admin123`
- Test users: `alice@test.com`, `bob@test.com`, `carol@test.com`, `dave@test.com` / `password123`

## Step 2: Set Up AWS S3

1. Create an AWS account if you don't have one
2. Create an S3 bucket:
   - Go to AWS S3 Console
   - Click "Create bucket"
   - Choose a unique name (e.g., `penpal-scans-prod`)
   - Select your preferred region
   - Keep default settings (block public access)
3. Create IAM credentials:
   - Go to IAM Console
   - Create a new user with programmatic access
   - Attach the `AmazonS3FullAccess` policy (or create a more restrictive policy)
   - Save the Access Key ID and Secret Access Key

## Step 3: Configure Environment Variables

Before deploying, you need to set up environment variables in Vercel.

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `JWT_SECRET` | Secret key for JWT tokens | Random 32+ character string |
| `ADDRESS_ENCRYPTION_KEY` | 64-character hex key for address encryption | Use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `AWS_ACCESS_KEY_ID` | AWS access key | From IAM user |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | From IAM user |
| `AWS_REGION` | AWS region | `us-east-1` |
| `S3_BUCKET` | S3 bucket name | `penpal-scans-prod` |
| `PORT` | Server port (Vercel auto-assigns) | `3000` |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email |
| `SENDGRID_API_KEY` | SendGrid API key for emails |
| `ADMIN_EMAIL` | Admin email address |

### Generating Required Keys

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Generate Address Encryption Key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd /path/to/PalsPO
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? (Select your account)
   - Link to existing project? **N**
   - What's your project's name? `penpal-platform`
   - In which directory is your code located? `./`
   - Want to modify settings? **N**

5. Add environment variables:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add ADDRESS_ENCRYPTION_KEY
   vercel env add AWS_ACCESS_KEY_ID
   vercel env add AWS_SECRET_ACCESS_KEY
   vercel env add AWS_REGION
   vercel env add S3_BUCKET
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Web Dashboard

1. Go to [vercel.com](https://vercel.com/) and sign in
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: Leave empty (configured in vercel.json)
   - **Output Directory**: Leave empty (configured in vercel.json)
5. Add environment variables (see table above)
6. Click "Deploy"

## Step 5: Post-Deployment Steps

### 1. Verify Deployment

Visit your Vercel URL (e.g., `https://penpal-platform.vercel.app`)

You should see:
- ✅ Frontend loads (login page)
- ✅ Can register a new account
- ✅ Can log in
- ✅ Can view dashboard

### 2. Set Up Database Tables

If you haven't already, run the schema:
```bash
psql "YOUR_DATABASE_URL" < backend/schema.sql
```

### 3. Create Admin Account

Either:
- Run the seed script: `node backend/seed.js`
- Or register through the UI and manually update the database:
  ```sql
  UPDATE users SET is_admin = true WHERE email = 'your@email.com';
  ```

### 4. Test Core Features

Test the complete user flow:
1. Register a new account
2. Complete your profile
3. Add your address
4. Browse discovery feed
5. Send a connection request
6. Test chat functionality

## Step 6: Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

## Troubleshooting

### Frontend loads but API calls fail

- Check that environment variables are set correctly
- Verify DATABASE_URL is accessible from Vercel
- Check Vercel function logs in dashboard

### Database connection errors

- Ensure your database allows connections from Vercel's IP ranges
- Check if your database is on a free tier with connection limits
- Verify DATABASE_URL format is correct

### File upload not working

- Verify AWS credentials are correct
- Check S3 bucket permissions
- Ensure bucket name and region match

### Build fails

- Check that all dependencies are in package.json
- Verify Node.js version compatibility
- Review build logs in Vercel dashboard

### Environment variables not working

- Ensure you've added them in Vercel dashboard
- Redeploy after adding new environment variables
- Check for typos in variable names

## Production Checklist

Before going live:

- [ ] Database schema is up to date
- [ ] All environment variables are set
- [ ] SSL/HTTPS is enabled (automatic with Vercel)
- [ ] Rate limiting is configured
- [ ] Admin account is created
- [ ] S3 bucket CORS is configured
- [ ] Test user registration
- [ ] Test chat functionality
- [ ] Test address reveal flow
- [ ] Test file uploads
- [ ] Monitor Vercel function logs
- [ ] Set up error monitoring (optional)
- [ ] Configure custom domain (optional)

## Monitoring and Maintenance

### View Logs

```bash
vercel logs [deployment-url]
```

Or view in Vercel dashboard under "Logs"

### Update Deployment

```bash
git push origin main  # If connected to Git
# or
vercel --prod  # Manual deployment
```

### Roll Back

In Vercel dashboard:
1. Go to "Deployments"
2. Find a previous working deployment
3. Click "⋯" → "Promote to Production"

## Cost Considerations

### Vercel
- Free tier: 100GB bandwidth, 100GB-hours compute
- Hobby tier: $20/month for more usage
- Pro tier: $20/user/month for teams

### Database (Neon/Supabase)
- Free tier: 0.5GB storage, limited connections
- Paid tier: ~$10-20/month for production usage

### AWS S3
- Pay per GB stored and transferred
- Estimate: ~$1-5/month for small scale

## Security Recommendations

1. **Rotate secrets regularly**: Update JWT_SECRET and ADDRESS_ENCRYPTION_KEY periodically
2. **Use strong passwords**: For database and admin accounts
3. **Enable 2FA**: On Vercel and AWS accounts
4. **Monitor logs**: Check for suspicious activity
5. **Keep dependencies updated**: Run `npm audit` regularly
6. **Backup database**: Set up automated backups

## Support

For deployment issues:
- Check [Vercel documentation](https://vercel.com/docs)
- Review [GitHub issues](https://github.com/Squ1zM0/PalsPO/issues)
- Contact support@vercel.com for Vercel-specific problems

## Next Steps

After successful deployment:
1. Add Terms of Service and Privacy Policy (Phase 8)
2. Set up monitoring and analytics (Phase 9)
3. Run a beta program (Phase 10)
4. Implement additional safety features (Phase 7)

---

**Last Updated**: January 2026
