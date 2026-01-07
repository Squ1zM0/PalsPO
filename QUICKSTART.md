# Quick Start Guide - Vercel Deployment

This is a quick reference for deploying the PenPal Platform to Vercel.

## 🚀 Quick Deploy (5 minutes)

### Prerequisites
1. Vercel account (free): https://vercel.com/signup
2. Database (Neon recommended): https://neon.tech
3. AWS S3 bucket: https://aws.amazon.com/s3/

### Steps

1. **Fork/Clone this repository**

2. **Set up database** (using Neon - free tier):
   - Create account at https://neon.tech
   - Create new project
   - Copy connection string
   - Run schema:
     ```bash
     psql "YOUR_CONNECTION_STRING" < backend/schema.sql
     ```

3. **Deploy to Vercel**:
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

4. **Add environment variables** in Vercel dashboard:
   - `DATABASE_URL` - Your Neon connection string
   - `JWT_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `ADDRESS_ENCRYPTION_KEY` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - `AWS_ACCESS_KEY_ID` - Your AWS key
   - `AWS_SECRET_ACCESS_KEY` - Your AWS secret
   - `AWS_REGION` - e.g., `us-east-1`
   - `S3_BUCKET` - Your bucket name
   - `PORT` - `3000`

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

6. **Seed database** (optional):
   ```bash
   cd backend
   node seed.js
   ```
   This creates test users:
   - Admin: admin@penpal.com / admin123
   - Users: alice@test.com, bob@test.com / password123

7. **Visit your app**: https://your-project.vercel.app

## 📖 Full Documentation

See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for:
- Detailed setup instructions
- Database configuration options
- Troubleshooting guide
- Production checklist
- Security recommendations

## 🏠 Local Development

For local development:

```bash
# Run setup script
./setup.sh

# Or manual setup:
cd backend && npm install
cd ../frontend && npm install

# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)  
cd frontend && npm run dev
```

Visit: http://localhost:5173

## 🧪 Test Users

After seeding:
- **Admin**: admin@penpal.com / admin123
- **Alice**: alice@test.com / password123
- **Bob**: bob@test.com / password123
- **Carol**: carol@test.com / password123
- **Dave**: dave@test.com / password123

## 📝 Environment Variables

| Required | Variable | Description |
|----------|----------|-------------|
| ✅ | DATABASE_URL | PostgreSQL connection string |
| ✅ | JWT_SECRET | Random 32+ char string |
| ✅ | ADDRESS_ENCRYPTION_KEY | 64-char hex key |
| ✅ | AWS_ACCESS_KEY_ID | AWS access key |
| ✅ | AWS_SECRET_ACCESS_KEY | AWS secret key |
| ✅ | AWS_REGION | AWS region |
| ✅ | S3_BUCKET | S3 bucket name |
| ⚪ | FIREBASE_PROJECT_ID | Firebase project ID |
| ⚪ | SENDGRID_API_KEY | SendGrid API key |

## 🔍 Troubleshooting

**Frontend loads but API fails**
- Check environment variables in Vercel dashboard
- Redeploy after adding variables

**Database connection errors**
- Verify DATABASE_URL is correct
- Check database allows external connections

**Build fails**
- Check Node.js version (16+)
- Verify all dependencies are listed

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)

## 🆘 Support

- Open an issue: https://github.com/Squ1zM0/PalsPO/issues
- Vercel support: support@vercel.com
