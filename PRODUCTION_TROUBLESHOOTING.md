# Production Troubleshooting Guide

This guide helps diagnose and fix common production deployment issues for the PenPal Platform on Vercel.

## Quick Diagnosis

### Step 1: Check the Health Endpoint

Visit: `https://pals-po.vercel.app/api/health`

This endpoint will show you:
- Database connection status
- Environment variable configuration
- System health

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-07T12:00:00.000Z",
  "environment": {
    "nodeEnv": "production",
    "hasDatabase": true,
    "hasJwtSecret": true,
    "hasAwsConfig": true
  },
  "database": "connected"
}
```

**If you see `"hasDatabase": false` or `"hasJwtSecret": false`**, you need to add environment variables in Vercel.

**If you see `"database": "error"`**, check the database connection string and ensure the database is accessible.

## Common Issues and Fixes

### Issue 1: "Something went wrong" on Login/Register

**Symptoms:**
- Error modal appears when trying to log in or register
- Console shows error details

**Likely Causes:**
1. Missing `DATABASE_URL` environment variable
2. Missing `JWT_SECRET` environment variable
3. Database connection error
4. Database tables not created

**Fixes:**

#### Fix 1: Verify Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (pals-po)
3. Go to Settings → Environment Variables
4. Ensure these variables are set:

**Required Variables:**

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DATABASE_URL` | PostgreSQL connection string | From your database provider (Neon, Supabase, etc.) |
| `JWT_SECRET` | Secret for JWT tokens | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADDRESS_ENCRYPTION_KEY` | Key for encrypting addresses | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

**Optional Variables (for full functionality):**

| Variable | Description |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key for S3 |
| `AWS_REGION` | AWS region (e.g., us-east-1) |
| `S3_BUCKET` | S3 bucket name |
| `SENDGRID_API_KEY` | SendGrid API key for emails |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | Firebase private key |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email |

5. After adding/updating variables, **redeploy** your app:
   - Go to Deployments
   - Click on the latest deployment
   - Click "Redeploy" button

#### Fix 2: Create Database Schema

If database connection is working but auth still fails, you may need to create the database tables.

1. Get your `DATABASE_URL` from Vercel environment variables
2. Run the schema:
   ```bash
   psql "YOUR_DATABASE_URL" < backend/schema.sql
   ```

Or if you're using Neon/Supabase dashboard:
1. Open the SQL editor
2. Copy the contents of `backend/schema.sql`
3. Execute the SQL

#### Fix 3: Check Database Connection String Format

Ensure your `DATABASE_URL` is in the correct format:
```
postgresql://username:password@host:port/database
```

For Neon, it should look like:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/database?sslmode=require
```

For Supabase, it should look like:
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### Issue 2: Vercel Logs Show Error Details

**To View Logs:**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Logs" or "Runtime Logs"
4. Look for errors during API calls

**Common Log Errors:**

**"connect ECONNREFUSED"** or **"connection refused"**
- Database is not accessible from Vercel
- Check if your database allows connections from anywhere or Vercel's IP ranges

**"no pg_hba.conf entry"**
- Database authentication issue
- Check your database connection string username/password
- Ensure SSL mode is correct (usually `?sslmode=require`)

**"JWT_SECRET is not configured"**
- Missing JWT_SECRET environment variable
- Add it in Vercel settings and redeploy

**"relation 'users' does not exist"**
- Database tables not created
- Run the schema SQL (see Fix 2 above)

### Issue 3: CORS or Network Errors

**Symptoms:**
- "Failed to fetch" errors in browser console
- Network errors when calling API

**Fix:**

The Vercel deployment is configured to route all `/api/*` requests to the backend serverless function. This should work automatically, but if you see CORS errors:

1. Check that your API calls use `/api` prefix (not full URL)
2. Verify `vercel.json` has the correct rewrites (should already be configured)

### Issue 4: Error Modal Shows in Production but Not Development

**Why:**
- The ErrorBoundary now shows error details in both development and production
- This helps diagnose production issues

**To see error details:**
1. When error modal appears, click "Error Details" dropdown
2. Read the error message and stack trace
3. Look for specific error messages like:
   - "Server configuration error" → Missing environment variables
   - "Internal server error" → Check Vercel logs for details
   - "Unable to connect to server" → Network or routing issue

## Verification Checklist

After fixing issues, verify:

- [ ] `/api/health` endpoint returns `"status": "ok"`
- [ ] `/api/health` shows `"hasDatabase": true`
- [ ] `/api/health` shows `"hasJwtSecret": true`
- [ ] `/api/health` shows `"database": "connected"`
- [ ] Login page loads
- [ ] Register page loads
- [ ] Can create new account
- [ ] Can log in with credentials
- [ ] After login, redirected to dashboard
- [ ] Dashboard page loads (not blank screen or error)

## Getting Help

If issues persist:

1. **Check Vercel Logs:**
   - Look for specific error messages
   - Share relevant error logs when asking for help

2. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Look for failed requests in Network tab

3. **Verify Environment:**
   - Visit `/api/health` and share the response
   - Confirm all required environment variables are set

4. **Test Database Connection:**
   ```bash
   psql "YOUR_DATABASE_URL" -c "SELECT 1"
   ```
   Should return `1` if connection works

## Step-by-Step Fix for Current Issue

Based on the issue description, here's the most likely fix:

1. **Add Environment Variables:**
   ```bash
   # Generate JWT secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Copy the output
   
   # Go to Vercel Dashboard → Settings → Environment Variables
   # Add:
   # - DATABASE_URL: your database connection string
   # - JWT_SECRET: the generated secret above
   ```

2. **Redeploy:**
   - Go to Deployments → Click latest → Redeploy

3. **Create Database Tables** (if not already done):
   ```bash
   psql "YOUR_DATABASE_URL" < backend/schema.sql
   ```

4. **Test:**
   - Visit: `https://pals-po.vercel.app/api/health`
   - Verify all checks pass
   - Try registering a new account
   - Try logging in

## Monitoring in Production

To prevent future issues:

1. **Check logs regularly:**
   - Set up log monitoring in Vercel
   - Look for error patterns

2. **Monitor health endpoint:**
   - Periodically check `/api/health`
   - Set up uptime monitoring (e.g., UptimeRobot)

3. **Test after each deployment:**
   - Run through login/register flow
   - Verify core features work

---

**Last Updated:** January 7, 2026
