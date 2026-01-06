# Architecture Overview

## Stack

- **Frontend:** React with Vite, PWA for mobile-first experience.
- **Backend:** Node.js with Express.js for API, Socket.io for realtime chat.
- **Database:** PostgreSQL (hosted on Supabase for managed service).
- **Authentication:** JWT with bcrypt for password hashing.
- **Storage:** AWS S3 for scanned letter uploads.
- **Notifications:** Firebase Cloud Messaging for push notifications, SendGrid for email.
- **Admin:** React-based dashboard for moderation.

## Services and Data Boundaries

- **Auth Service:** Handles user registration, login, JWT issuance. Stores User and Profile data.
- **Profiles Service:** Manages pseudonymous profiles and preferences.
- **Matching Service:** Handles discovery and connection requests. Uses MatchRequest and Match data.
- **Chat Service:** Manages realtime messaging via Socket.io. Stores Message data.
- **Consent State Service:** Authoritative service for pen pal consent states (ConsentState).
- **Address Vault Service:** Secure server-side storage for addresses (Address, encrypted). Enforces consent-gated access with audit logging.
- **Letter Workflow Service:** Tracks letter events (LetterEvent).
- **Media Upload Service:** Handles scan uploads to S3, associates with ScanAsset.
- **Moderation Service:** Processes reports and blocks (Report, Block), with admin actions.
- **Analytics Service:** Collects telemetry data.

Data boundaries: Each service owns its data models, with clear API boundaries. Address data is isolated and only accessible via the Address Vault Service.

## Security

- Addresses stored encrypted server-side only.
- Clients never receive addresses without consent.
- Audit logs for reveals.
- Block hides addresses instantly.
- Rate limits and cooldowns.
- Image uploads virus-scanned and size-limited.