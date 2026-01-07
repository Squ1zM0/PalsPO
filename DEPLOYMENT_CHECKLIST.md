# Vercel Deployment Checklist

Use this checklist when deploying to Vercel for the first time.

## Pre-Deployment Setup

### 1. Database Setup
- [ ] Create Neon account at https://neon.tech (or Supabase/Railway)
- [ ] Create new database project
- [ ] Copy connection string (format: `postgresql://user:pass@host/database`)
- [ ] Run schema:
  ```bash
  psql "YOUR_DATABASE_URL" < backend/schema.sql
  ```
- [ ] Verify tables created successfully

### 2. AWS S3 Setup
- [ ] Create AWS account (if needed)
- [ ] Create new S3 bucket
  - Bucket name: ____________________
  - Region: ____________________
- [ ] Create IAM user with S3 access
- [ ] Save Access Key ID: ____________________
- [ ] Save Secret Access Key: ____________________

### 3. Generate Secrets
Run these commands and save the output:

```bash
# JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] JWT_SECRET: ____________________

```bash
# Address Encryption Key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
- [ ] ADDRESS_ENCRYPTION_KEY: ____________________

## Vercel Deployment

### 4. Install Vercel CLI
```bash
npm install -g vercel
```
- [ ] Vercel CLI installed

### 5. Login to Vercel
```bash
vercel login
```
- [ ] Logged into Vercel account

### 6. Initial Deployment
```bash
cd /path/to/PalsPO
vercel
```

Answer prompts:
- [ ] Set up and deploy? → **Yes**
- [ ] Which scope? → Select your account
- [ ] Link to existing project? → **No**
- [ ] Project name? → `penpal-platform` (or your choice)
- [ ] Directory? → `./`
- [ ] Want to modify settings? → **No**

### 7. Add Environment Variables

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add each variable for **Production**, **Preview**, and **Development**:

- [ ] `DATABASE_URL` = (from step 1)
- [ ] `JWT_SECRET` = (from step 3)
- [ ] `ADDRESS_ENCRYPTION_KEY` = (from step 3)
- [ ] `AWS_ACCESS_KEY_ID` = (from step 2)
- [ ] `AWS_SECRET_ACCESS_KEY` = (from step 2)
- [ ] `AWS_REGION` = (from step 2)
- [ ] `S3_BUCKET` = (from step 2)
- [ ] `PORT` = `3000`

Optional variables:
- [ ] `FIREBASE_PROJECT_ID` (if using Firebase)
- [ ] `FIREBASE_PRIVATE_KEY` (if using Firebase)
- [ ] `FIREBASE_CLIENT_EMAIL` (if using Firebase)
- [ ] `SENDGRID_API_KEY` (if using SendGrid)
- [ ] `ADMIN_EMAIL` = (your admin email)

### 8. Deploy to Production
```bash
vercel --prod
```
- [ ] Production deployment successful
- [ ] Note deployment URL: ____________________

## Post-Deployment Verification

### 9. Test Deployment
Visit your deployment URL:

- [ ] Frontend loads (login page appears)
- [ ] No console errors in browser DevTools
- [ ] Page styling looks correct

### 10. Seed Database (Optional)
If you want test users:

```bash
cd backend
node seed.js
```
- [ ] Database seeded with test users

### 11. Test User Registration
- [ ] Can register a new account
- [ ] Can log in with new account
- [ ] Can view dashboard

### 12. Test Core Features
- [ ] Profile page loads
- [ ] Can edit profile
- [ ] Can add address
- [ ] Discovery page loads
- [ ] Can send connection request
- [ ] Chat functionality works

### 13. Monitor Deployment
In Vercel Dashboard:
- [ ] Check "Logs" tab for errors
- [ ] Verify "Deployments" shows success
- [ ] Check "Analytics" (if available)

## Common Issues & Solutions

### ❌ "502 Bad Gateway" or API errors
- Check environment variables are set correctly
- Verify DATABASE_URL is accessible from Vercel
- Check Vercel function logs

### ❌ Frontend loads but blank page
- Check browser console for errors
- Verify all environment variables are set
- Redeploy after adding variables

### ❌ Database connection fails
- Ensure database allows connections from Vercel IP ranges
- Verify connection string format
- Check database is running

### ❌ File upload fails
- Verify AWS credentials are correct
- Check S3 bucket permissions
- Ensure bucket name and region match

## Production Checklist

Before announcing to users:

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic with Vercel)
- [ ] Admin account created
- [ ] Test all user flows
- [ ] Error monitoring set up (optional)
- [ ] Backup strategy configured
- [ ] Terms of Service added (future)
- [ ] Privacy Policy added (future)

## Maintenance

### Regular Tasks
- [ ] Monitor Vercel function usage
- [ ] Check database storage limits
- [ ] Review error logs weekly
- [ ] Update dependencies monthly
- [ ] Backup database regularly

### When to Redeploy
- After code changes: `git push` (if auto-deploy enabled) or `vercel --prod`
- After adding environment variables: `vercel --prod`
- After schema changes: Run migration, then `vercel --prod`

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Project Docs**: See VERCEL_DEPLOYMENT.md
- **Quick Start**: See QUICKSTART.md
- **GitHub Issues**: https://github.com/Squ1zM0/PalsPO/issues

---

## Deployment Information

Fill this out for reference:

- **Deployment Date**: ____________________
- **Vercel URL**: ____________________
- **Custom Domain**: ____________________
- **Database Provider**: ____________________
- **Database URL**: (keep secure!) ____________________
- **S3 Bucket**: ____________________
- **S3 Region**: ____________________
- **Admin Email**: ____________________

**Notes**:
_____________________________________________________
_____________________________________________________
_____________________________________________________
