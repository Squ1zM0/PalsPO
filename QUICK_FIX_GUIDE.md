# Quick Fix Guide for Production Auth Issues

This is a step-by-step guide to fix the authentication issues currently affecting production.

## 🎯 Goal

Get authentication working in production so users can log in and register successfully.

## ⏱️ Estimated Time

**5-10 minutes** if you have database already set up  
**15-20 minutes** if you need to set up database

## 📋 Prerequisites

- [ ] Access to Vercel dashboard for pals-po project
- [ ] PostgreSQL database (Neon, Supabase, or other)
- [ ] Terminal access to run commands

## 🔧 Step-by-Step Fix

### Step 1: Generate Required Secrets (2 minutes)

1. **Run the secret generator:**
   ```bash
   ./generate-secrets.sh
   ```
   
   Or manually generate:
   ```bash
   # Generate JWT_SECRET
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Generate ADDRESS_ENCRYPTION_KEY
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Copy both secrets** - you'll need them in the next step

### Step 2: Set Up Database (5 minutes)

**Option A: Using Neon (Recommended)**

1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy your connection string (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/database?sslmode=require`)
5. In Neon SQL Editor, paste and run the contents of `backend/schema.sql`

**Option B: Using Supabase**

1. Go to [supabase.com](https://supabase.com)
2. Create a free account
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string (use "Connection pooling" → "Transaction" mode)
6. In Supabase SQL Editor, paste and run the contents of `backend/schema.sql`

**Option C: Using Existing Database**

1. Make sure you have your `DATABASE_URL`
2. Run the schema:
   ```bash
   psql "YOUR_DATABASE_URL" < backend/schema.sql
   ```

### Step 3: Add Environment Variables to Vercel (3 minutes)

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select project: `pals-po`

2. **Navigate to Settings:**
   - Click "Settings" tab
   - Click "Environment Variables" in sidebar

3. **Add Required Variables:**

   Click "Add New" for each:

   | Key | Value | Environment |
   |-----|-------|-------------|
   | `DATABASE_URL` | Your PostgreSQL connection string from Step 2 | Production, Preview, Development |
   | `JWT_SECRET` | The secret you generated in Step 1 | Production, Preview, Development |
   | `ADDRESS_ENCRYPTION_KEY` | The second secret from Step 1 | Production, Preview, Development |

   **Important:** Select all three environments (Production, Preview, Development) for each variable.

4. **Optional Variables** (can be added later for full functionality):

   | Key | Description | When Needed |
   |-----|-------------|-------------|
   | `AWS_ACCESS_KEY_ID` | AWS access key | For file uploads |
   | `AWS_SECRET_ACCESS_KEY` | AWS secret key | For file uploads |
   | `AWS_REGION` | AWS region (e.g., us-east-1) | For file uploads |
   | `S3_BUCKET` | S3 bucket name | For file uploads |

### Step 4: Redeploy Application (2 minutes)

1. **Trigger Redeployment:**
   - In Vercel dashboard, go to "Deployments" tab
   - Find the latest deployment
   - Click the three dots (⋯) menu
   - Click "Redeploy"
   - Confirm by clicking "Redeploy" again

2. **Wait for deployment** (usually 1-2 minutes)
   - Watch the deployment progress
   - Wait for "Ready" status

### Step 5: Verify the Fix (2 minutes)

1. **Check Health Endpoint:**
   
   Visit: https://pals-po.vercel.app/api/health
   
   **Expected Response:**
   ```json
   {
     "status": "ok",
     "timestamp": "2026-01-07T...",
     "environment": {
       "nodeEnv": "production",
       "hasDatabase": true,    ← Should be true
       "hasJwtSecret": true,   ← Should be true
       "hasAwsConfig": false   ← OK if you haven't added AWS
     },
     "database": "connected"   ← Should be "connected"
   }
   ```

   ✅ **If all values are correct, continue to next step**  
   ❌ **If any value is wrong, go back to Step 3 and verify environment variables**

2. **Test Registration:**
   - Visit: https://pals-po.vercel.app/register
   - Enter a test email: `test@example.com`
   - Enter a pen name: `TestUser`
   - Enter a password: `testpass123`
   - Click "Create Account"
   
   ✅ **Success:** Should redirect to profile page  
   ❌ **Error:** Open browser console (F12), look for error details, check Vercel logs

3. **Test Login:**
   - Visit: https://pals-po.vercel.app/login
   - Enter the email and password from previous step
   - Click "Login"
   
   ✅ **Success:** Should redirect to dashboard  
   ❌ **Error:** Open browser console (F12), look for error details

## 🎉 Success Checklist

After completing all steps, you should be able to:

- [x] Visit `/api/health` and see `"status": "ok"`
- [x] Create a new account on `/register`
- [x] Log in with credentials on `/login`
- [x] See the dashboard after login (not a blank page or error)
- [x] Navigate to other pages like `/profile`, `/discovery`

## 🐛 Troubleshooting

### Issue: Health endpoint shows `"hasDatabase": false`

**Fix:** DATABASE_URL not set correctly in Vercel
1. Go back to Step 3
2. Verify DATABASE_URL is set
3. Make sure it's set for "Production" environment
4. Redeploy (Step 4)

### Issue: Health endpoint shows `"hasJwtSecret": false`

**Fix:** JWT_SECRET not set correctly in Vercel
1. Go back to Step 3
2. Verify JWT_SECRET is set
3. Make sure it's set for "Production" environment
4. Redeploy (Step 4)

### Issue: Health endpoint shows `"database": "error"`

**Fix:** Database connection problem
1. Check the error details in the health response
2. Common issues:
   - Wrong connection string format
   - Database not accepting connections
   - Database requires SSL: add `?sslmode=require` to connection string
3. Test connection locally:
   ```bash
   psql "YOUR_DATABASE_URL" -c "SELECT 1"
   ```

### Issue: "relation 'users' does not exist"

**Fix:** Database tables not created
1. Go back to Step 2
2. Make sure you ran the schema.sql
3. Verify tables exist:
   ```bash
   psql "YOUR_DATABASE_URL" -c "\dt"
   ```
   Should show tables: users, profiles, matches, messages, etc.

### Issue: Registration works but login fails

**Fix:** Check JWT_SECRET
1. Make sure JWT_SECRET is the same value in all environments
2. Redeploy after confirming

### Issue: Still seeing "Something went wrong"

**Fix:** Check detailed error
1. Open browser developer tools (F12)
2. Click on error modal
3. Click "Error Details" dropdown
4. Read the error message
5. Check Vercel logs:
   - Vercel Dashboard → Logs
   - Look for red error messages
   - Share error details for further help

## 📞 Getting More Help

If you're still stuck:

1. **Check Vercel Logs:**
   - Dashboard → Logs
   - Look for errors with timestamps matching your test

2. **Check Browser Console:**
   - Press F12
   - Look in Console tab for red errors
   - Look in Network tab for failed API calls

3. **Review Full Guide:**
   - See [PRODUCTION_TROUBLESHOOTING.md](PRODUCTION_TROUBLESHOOTING.md)

4. **Common Error Messages:**
   - "Unable to connect to server" → Check `/api/health`
   - "Invalid credentials" → User exists, wrong password
   - "User already exists" → Use different email
   - "Internal server error" → Check Vercel logs

## 📚 Additional Resources

- [Full Deployment Guide](VERCEL_DEPLOYMENT.md)
- [Production Troubleshooting](PRODUCTION_TROUBLESHOOTING.md)
- [Quick Start](QUICKSTART.md)

---

**Last Updated:** January 7, 2026  
**Estimated Fix Time:** 5-20 minutes  
**Success Rate:** High (if all steps followed)
