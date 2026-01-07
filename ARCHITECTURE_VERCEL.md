# PenPal Platform - Vercel Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL DEPLOYMENT                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────┐      ┌─────────────────────────┐   │
│  │   Frontend (Static)    │      │  Backend (Serverless)   │   │
│  │                        │      │                         │   │
│  │  • React + Vite        │◄────►│  • Express API          │   │
│  │  • Served from /       │      │  • Served from /api/*   │   │
│  │  • Built to /dist      │      │  • Node.js Functions    │   │
│  │                        │      │  • JWT Auth             │   │
│  └────────────────────────┘      └─────────────────────────┘   │
│           │                                 │                   │
│           │                                 │                   │
└───────────┼─────────────────────────────────┼───────────────────┘
            │                                 │
            │                                 │
            ▼                                 ▼
    ┌──────────────┐              ┌────────────────────┐
    │   Browser    │              │   External APIs    │
    │              │              │                    │
    │  • User UI   │              │  ┌──────────────┐  │
    │  • Local     │              │  │ PostgreSQL   │  │
    │    Storage   │              │  │  (Neon/     │  │
    │  • Auth      │              │  │   Supabase)  │  │
    │    Token     │              │  └──────────────┘  │
    └──────────────┘              │                    │
                                  │  ┌──────────────┐  │
                                  │  │   AWS S3     │  │
                                  │  │  (File       │  │
                                  │  │   Storage)   │  │
                                  │  └──────────────┘  │
                                  │                    │
                                  │  ┌──────────────┐  │
                                  │  │  SendGrid    │  │
                                  │  │  (Optional)  │  │
                                  │  └──────────────┘  │
                                  │                    │
                                  │  ┌──────────────┐  │
                                  │  │  Firebase    │  │
                                  │  │  (Optional)  │  │
                                  │  └──────────────┘  │
                                  └────────────────────┘
```

## Request Flow

### Frontend Request
```
User Browser → https://your-app.vercel.app/
              └──► Vercel Edge Network
                   └──► Static Files (index.html, JS, CSS)
                        └──► Browser renders React app
```

### API Request
```
User Browser → https://your-app.vercel.app/api/auth/login
              └──► Vercel Edge Network
                   └──► Vercel Serverless Function (backend/server.js)
                        └──► Express Route Handler
                             ├──► PostgreSQL (user data)
                             ├──► JWT Generation
                             └──► Response to browser
```

### File Upload Flow
```
User Browser → Select file
              └──► /api/scans/upload
                   └──► Vercel Function
                        └──► AWS S3 Upload
                             └──► Return S3 URL
                                  └──► Store URL in PostgreSQL
```

## Data Flow

### User Registration
```
1. Frontend: User fills registration form
2. POST /api/auth/register
3. Backend: Hash password with bcrypt
4. PostgreSQL: Insert user record
5. Backend: Generate JWT token
6. Frontend: Store token in localStorage
7. Frontend: Redirect to dashboard
```

### Address Reveal
```
1. Frontend: User requests address reveal
2. POST /api/addresses/reveal/:matchId
3. Backend: Check consent state (must be mutual_pen_pal)
4. Backend: Decrypt both addresses (AES-256-GCM)
5. PostgreSQL: Update consent state to 'revealed'
6. PostgreSQL: Log audit entry
7. Backend: Return both addresses
8. Frontend: Display addresses
```

## Security Model

```
┌─────────────────────────────────────────────┐
│         Security Layers                     │
├─────────────────────────────────────────────┤
│                                             │
│  1. HTTPS/TLS (Vercel automatic)            │
│     └─► All traffic encrypted               │
│                                             │
│  2. CORS (backend middleware)               │
│     └─► Restrict origins                    │
│                                             │
│  3. Rate Limiting (express-rate-limit)      │
│     └─► 100 requests per 15 min             │
│                                             │
│  4. Helmet.js (security headers)            │
│     └─► XSS, clickjacking protection        │
│                                             │
│  5. JWT Authentication                      │
│     └─► Token-based auth                    │
│     └─► Stored in localStorage              │
│                                             │
│  6. Password Hashing (bcrypt)               │
│     └─► One-way hash with salt              │
│                                             │
│  7. Address Encryption (AES-256-GCM)        │
│     └─► Server-side encryption              │
│     └─► 32-byte encryption key              │
│                                             │
│  8. SQL Injection Protection                │
│     └─► Parameterized queries (pg)          │
│                                             │
│  9. Audit Logging                           │
│     └─► Track sensitive operations          │
│                                             │
└─────────────────────────────────────────────┘
```

## Environment Variables Flow

```
Development (.env local)
    └──► Backend reads via dotenv
         └──► Database connection
         └──► Encryption keys
         └──► API credentials

Production (Vercel Dashboard)
    └──► Vercel injects into serverless functions
         └──► process.env.DATABASE_URL
         └──► process.env.JWT_SECRET
         └──► process.env.ADDRESS_ENCRYPTION_KEY
         └──► etc.
```

## Deployment Process

```
1. Code Changes
   └──► git commit
        └──► git push origin main

2. Vercel (if auto-deploy enabled)
   └──► Detects push
        └──► Runs vercel.json config
             ├──► Build Frontend
             │    └──► npm install
             │         └──► vite build
             │              └──► Output to frontend/dist
             │
             └──► Build Backend
                  └──► npm install
                       └──► Export Express app
                            └──► Deploy as serverless functions

3. Vercel Edge Network
   └──► Deploy to global CDN
        └──► Frontend: Static files
        └──► Backend: Serverless functions

4. Production Live
   └──► https://your-app.vercel.app
```

## File Structure

```
PalsPO/
├── frontend/
│   ├── src/
│   │   ├── pages/           → React components
│   │   ├── services/        → API calls
│   │   └── contexts/        → Auth context
│   ├── dist/                → Build output (Vercel serves this)
│   └── vite.config.js       → Build config
│
├── backend/
│   ├── routes/              → API endpoints
│   ├── controllers/         → Business logic
│   ├── middleware/          → Auth, validation
│   └── server.js            → Express app (exports for Vercel)
│
├── vercel.json              → Deployment config
├── VERCEL_DEPLOYMENT.md     → Full deployment guide
├── QUICKSTART.md            → Quick reference
└── DEPLOYMENT_CHECKLIST.md  → Step-by-step checklist
```

## Scaling Considerations

### Vercel Limits (Free Tier)
- Bandwidth: 100 GB/month
- Function Execution: 100 GB-hours/month
- Function Duration: 10 seconds max
- Deployments: Unlimited

### Database Scaling (Neon Free Tier)
- Storage: 0.5 GB
- Compute: Shared
- Connections: Limited

### Upgrade Path
1. Start: Free tiers (Vercel + Neon)
2. Growth: Vercel Pro ($20/mo) + Neon Paid
3. Scale: Enterprise solutions

## Monitoring

```
Vercel Dashboard
    ├── Logs → View function errors
    ├── Analytics → Traffic metrics
    └── Deployments → Deploy history

Database Dashboard (Neon)
    ├── Queries → Slow query log
    ├── Connections → Active connections
    └── Storage → Usage metrics

AWS S3 Console
    ├── Storage → File count/size
    └── Bandwidth → Transfer metrics
```

## Backup Strategy

```
Database:
    └──► Neon automatic backups (point-in-time recovery)
    └──► Manual: pg_dump scheduled backups

S3 Files:
    └──► Versioning enabled
    └──► Lifecycle policies

Code:
    └──► Git repository
    └──► Vercel deployment history
```

---

For detailed deployment instructions, see:
- **Quick Start**: QUICKSTART.md
- **Full Guide**: VERCEL_DEPLOYMENT.md
- **Checklist**: DEPLOYMENT_CHECKLIST.md
