# PenPal Platform v1

A privacy-conscious pen pal platform that supports matching, in-app communication, physical letter exchange, and scanned letter archiving.

## 🚨 Production Deployment Notice

**If you're experiencing authentication issues in production** (e.g., "Something went wrong" errors), please see [PRODUCTION_TROUBLESHOOTING.md](PRODUCTION_TROUBLESHOOTING.md) for:
- Quick diagnosis steps
- Environment variable setup
- Common fixes
- Health check endpoint usage

## 🚀 Quick Start

**Deploy to Vercel in 5 minutes**: See [QUICKSTART.md](QUICKSTART.md)

**Local Development**: Run `./setup.sh` or see instructions below

## Features Implemented (v1 MVP)

### Backend (Phase 4 - Complete)
- ✅ User authentication (JWT-based)
- ✅ Profile management with interests and preferences
- ✅ Discovery feed and matching system
- ✅ Connection requests and match management
- ✅ Real-time messaging (polling-based)
- ✅ Pen pal consent state machine
- ✅ Encrypted address vault with reveal flow
- ✅ Letter tracking (sent/received events)
- ✅ Scan upload and storage (S3 integration)
- ✅ Safety features (block, report)
- ✅ Admin moderation tools
- ✅ Audit logging

### Frontend (Phase 5 - Complete)
- ✅ Login and registration
- ✅ Profile editing
- ✅ Discovery feed with swipe-like interface
- ✅ Matches dashboard
- ✅ Chat interface with real-time updates
- ✅ Pen pal consent flow UI
- ✅ Address management
- ✅ Address reveal workflow
- ✅ Letter tracking interface
- ✅ Scan upload functionality
- ✅ Settings and safety controls

## Getting Started

### Deployment Options

#### Option 1: Deploy to Vercel (Recommended for Production)

See **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** for complete deployment instructions.

Quick deploy:
```bash
npm install -g vercel
vercel
```

#### Option 2: Local Development

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- AWS S3 bucket (for scan storage)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Squ1zM0/PalsPO.git
cd PalsPO
```

2. **Set up the database**

Create a PostgreSQL database:
```bash
createdb penpal
```

Run the schema:
```bash
psql penpal < backend/schema.sql
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `ADDRESS_ENCRYPTION_KEY`: 64-character hex key for address encryption
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`: AWS S3 credentials

4. **Install dependencies**

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

5. **Seed the database (optional)**

Create test users:
```bash
cd backend
node seed.js
```

This creates:
- Admin: `admin@penpal.com` / `admin123`
- Test users: `alice@test.com`, `bob@test.com`, `carol@test.com`, `dave@test.com` / `password123`

6. **Start the application**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

7. **Access the application**

Open your browser to: `http://localhost:5173`

## Usage Flow

### Getting Started as a New User

1. **Register** - Create an account with email, alias, and password
2. **Complete Profile** - Add interests, writing style, and preferences
3. **Add Address** - Save your mailing address (encrypted and private)
4. **Discover** - Browse potential pen pals and send connection requests
5. **Chat** - Start conversations with your matches
6. **Become Pen Pals** - Request/confirm pen pal status
7. **Reveal Addresses** - Mutually consent to exchange addresses
8. **Track Letters** - Mark when you send/receive physical letters
9. **Upload Scans** - Archive scanned letters in your timeline

### Privacy & Safety Features

- **Controlled Address Reveal**: Addresses are never shared without mutual consent
- **Simultaneous Reveal**: Both addresses are revealed at the same time
- **Block & Report**: Instantly hide addresses and prevent further contact
- **Encrypted Storage**: Addresses are encrypted server-side
- **Audit Logging**: All address reveals are logged

## API Documentation

See [docs/API.md](docs/API.md) for complete API reference.

## Architecture

- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + Vite
- **Authentication**: JWT tokens
- **Storage**: AWS S3 (scans)
- **Encryption**: AES-256-GCM (addresses)

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture.

## Project Status

See [docs/IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) for current implementation status.

## Roadmap

### Completed
- ✅ Phase 3: Technical Architecture
- ✅ Phase 4: Data Model & API Build
- ✅ Phase 5: Client App Build (MVP)

### Upcoming
- Phase 6: Printer Support (optional)
- Phase 7: Safety & Moderation hardening
- Phase 8: Legal & Compliance
- Phase 9: Analytics & Instrumentation
- Phase 10: Beta Program
- Phase 11: Hardening & Polish
- Phase 12: Launch Plan

## Contributing

This project follows the master plan outlined in [penpal_masterplan_FULL.md](penpal_masterplan_FULL.md).

## License

MIT License - See LICENSE file for details.

## Support

For issues and questions, please open a GitHub issue.
