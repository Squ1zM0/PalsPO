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

## Data Model Outline

- User: id, email, password_hash, created_at, is_admin
- Profile: user_id, alias, interests (json), writing_style, age_range, region, language
- Preferences: user_id, discovery_filters (json)
- MatchRequest: id, from_user_id, to_user_id, status (pending/accepted/rejected), created_at
- Match: id, user1_id, user2_id, consent_state (chatting/requested_pen_pal/mutual_pen_pal/address_requested/revealed/ended/blocked)
- Message: id, match_id, sender_id, content, timestamp
- Address: user_id, encrypted_address, created_at
- LetterEvent: id, match_id, user_id, event_type (sent/received), timestamp
- ScanAsset: id, letter_event_id, s3_key, metadata (json)
- Report: id, reporter_id, reported_id, category, context, created_at
- Block: user_id, blocked_user_id, created_at
- AuditLog: id, user_id, action (address_reveal), details (json), timestamp
- AdminUser: id, email, password_hash

## API Route Outline

- Auth: POST /register, POST /login, POST /logout
- Profiles: GET /profile, PUT /profile
- Discovery: GET /discover
- Connections: POST /connect/:user_id, PUT /connect/:request_id
- Chat: GET /messages/:match_id, POST /messages/:match_id (with Socket.io for realtime)
- Consent: POST /consent/request/:match_id, PUT /consent/confirm/:match_id
- Address: PUT /address, POST /address/reveal/:match_id
- Letters: POST /letters/:match_id, PUT /letters/:event_id
- Scans: POST /scans/upload, PUT /scans/attach/:letter_event_id
- Safety: POST /block/:user_id, POST /report/:user_id
- Admin: GET /reports, PUT /reports/:id/action

## Threat Model v1 (Basic)

- Spoofing: Use JWT for auth, validate tokens.
- Tampering: HTTPS everywhere, input validation.
- Repudiation: Audit logs for key actions.
- Information Disclosure: Encrypt addresses, limit data exposure.
- Denial of Service: Rate limits, resource monitoring.
- Elevation of Privilege: Role-based access, admin checks.

## Environment Setup Plan

- Dev: Local setup with PostgreSQL in Docker, .env for secrets.
- Stage: Cloud deployment on Heroku or Vercel, Supabase for DB, test data.
- Prod: AWS or similar, production secrets, monitoring.

Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2026-01-06 03:24:08
Current User's Login: Squ1zM0