# API Documentation

This document contains the documented endpoints, routes, and data contracts as they are implemented.

Base URL: `http://localhost:3000/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "alias": "UserAlias"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "userId": 1
}
```

### POST /auth/login
Login to an existing account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "userId": 1
}
```

### GET /auth/me
Get current user information (requires authentication).

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2026-01-06T00:00:00.000Z",
    "alias": "UserAlias",
    "interests": ["writing", "travel"],
    "writing_style": "casual",
    "age_range": "25-35",
    "region": "United States",
    "language": "English"
  }
}
```

## Profiles

### GET /profiles
Get current user's profile (requires authentication).

**Response:**
```json
{
  "profile": {
    "id": 1,
    "user_id": 1,
    "alias": "UserAlias",
    "interests": ["writing", "travel"],
    "writing_style": "casual",
    "age_range": "25-35",
    "region": "United States",
    "language": "English",
    "discovery_filters": {}
  }
}
```

### PUT /profiles
Update current user's profile (requires authentication).

**Request Body:**
```json
{
  "alias": "NewAlias",
  "interests": ["writing", "travel", "books"],
  "writing_style": "formal",
  "age_range": "30-40",
  "region": "Canada",
  "language": "English"
}
```

### PUT /profiles/preferences
Update discovery preferences (requires authentication).

**Request Body:**
```json
{
  "discovery_filters": {
    "age_range": "25-35",
    "interests": ["writing"],
    "region": "North America"
  }
}
```

## Discovery & Matching

### GET /discovery/feed
Get discovery feed of potential connections (requires authentication).

**Query Parameters:**
- `limit` (optional): Number of profiles to return (default: 10)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "profiles": [
    {
      "user_id": 2,
      "alias": "OtherUser",
      "interests": ["art", "music"],
      "writing_style": "casual",
      "age_range": "25-35",
      "region": "United States",
      "language": "English"
    }
  ]
}
```

### GET /discovery/requests
Get pending connection requests (requires authentication).

**Response:**
```json
{
  "requests": [
    {
      "id": 1,
      "from_user_id": 2,
      "to_user_id": 1,
      "status": "pending",
      "created_at": "2026-01-06T00:00:00.000Z",
      "alias": "OtherUser",
      "interests": ["art", "music"]
    }
  ]
}
```

### POST /discovery/connect/:toUserId
Send a connection request (requires authentication).

**Response:**
```json
{
  "message": "Connection request sent",
  "request": {
    "id": 1,
    "from_user_id": 1,
    "to_user_id": 2,
    "status": "pending",
    "created_at": "2026-01-06T00:00:00.000Z"
  }
}
```

### PUT /discovery/requests/:requestId
Respond to a connection request (requires authentication).

**Request Body:**
```json
{
  "action": "accept"
}
```
or
```json
{
  "action": "reject"
}
```

**Response (accept):**
```json
{
  "message": "Connection request accepted",
  "match": {
    "id": 1,
    "user1_id": 1,
    "user2_id": 2,
    "consent_state": "chatting"
  }
}
```

## Matches

### GET /matches
Get all active matches (requires authentication).

**Response:**
```json
{
  "matches": [
    {
      "id": 1,
      "user1_id": 1,
      "user2_id": 2,
      "consent_state": "chatting",
      "partner_alias": "OtherUser",
      "partner_interests": ["art", "music"],
      "partner_id": 2
    }
  ]
}
```

### POST /matches/:matchId/request-penpal
Request to become pen pals (requires authentication).

**Response:**
```json
{
  "message": "Pen pal request sent",
  "match": {
    "id": 1,
    "consent_state": "requested_pen_pal"
  }
}
```

### POST /matches/:matchId/confirm-penpal
Confirm pen pal request (requires authentication).

**Response:**
```json
{
  "message": "Pen pal confirmed",
  "match": {
    "id": 1,
    "consent_state": "mutual_pen_pal"
  }
}
```

### POST /matches/:matchId/end
End a match (requires authentication).

**Response:**
```json
{
  "message": "Match ended",
  "match": {
    "id": 1,
    "consent_state": "ended"
  }
}
```

## Messages

### GET /messages/:matchId
Get messages for a match (requires authentication).

**Query Parameters:**
- `limit` (optional): Number of messages to return (default: 50)
- `before` (optional): Timestamp to get messages before

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "match_id": 1,
      "sender_id": 1,
      "content": "Hello!",
      "timestamp": "2026-01-06T00:00:00.000Z",
      "sender_alias": "UserAlias"
    }
  ]
}
```

### POST /messages/:matchId
Send a message (requires authentication).

**Request Body:**
```json
{
  "content": "Hello, how are you?"
}
```

**Response:**
```json
{
  "message": "Message sent",
  "data": {
    "id": 1,
    "match_id": 1,
    "sender_id": 1,
    "content": "Hello, how are you?",
    "timestamp": "2026-01-06T00:00:00.000Z",
    "sender_alias": "UserAlias"
  }
}
```

## Addresses

### PUT /addresses
Save or update user's address (requires authentication).

**Request Body:**
```json
{
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States"
  }
}
```

**Response:**
```json
{
  "message": "Address saved successfully",
  "addressId": 1
}
```

### GET /addresses/me
Get user's own address (requires authentication).

**Response:**
```json
{
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States"
  },
  "created_at": "2026-01-06T00:00:00.000Z"
}
```

### POST /addresses/reveal/:matchId/request
Request address reveal (requires authentication, mutual_pen_pal state).

**Response:**
```json
{
  "message": "Address reveal requested",
  "match": {
    "id": 1,
    "consent_state": "address_requested"
  }
}
```

### POST /addresses/reveal/:matchId/confirm
Confirm address reveal (requires authentication, both addresses saved).

**Response:**
```json
{
  "message": "Addresses revealed",
  "match": {
    "id": 1,
    "consent_state": "revealed"
  }
}
```

### GET /addresses/partner/:matchId
Get partner's address (requires authentication, revealed state).

**Response:**
```json
{
  "address": {
    "street": "456 Oak Ave",
    "city": "Boston",
    "state": "MA",
    "postal_code": "02101",
    "country": "United States"
  }
}
```

## Letters

### POST /letters/:matchId
Create a letter event (requires authentication).

**Request Body:**
```json
{
  "event_type": "sent"
}
```
or
```json
{
  "event_type": "received"
}
```

**Response:**
```json
{
  "message": "Letter event created",
  "event": {
    "id": 1,
    "match_id": 1,
    "user_id": 1,
    "event_type": "sent",
    "timestamp": "2026-01-06T00:00:00.000Z"
  }
}
```

### GET /letters/:matchId
Get letter events for a match (requires authentication).

**Response:**
```json
{
  "events": [
    {
      "id": 1,
      "match_id": 1,
      "user_id": 1,
      "event_type": "sent",
      "timestamp": "2026-01-06T00:00:00.000Z",
      "user_alias": "UserAlias"
    }
  ]
}
```

### PUT /letters/:eventId
Update a letter event (requires authentication).

**Request Body:**
```json
{
  "event_type": "received"
}
```

## Scans

### POST /scans/upload
Upload a scanned letter (requires authentication).

**Request:** Multipart form-data
- `scan`: Image file
- `letterEventId`: ID of the letter event

**Response:**
```json
{
  "message": "Scan uploaded successfully",
  "scan": {
    "id": 1,
    "letter_event_id": 1,
    "s3_key": "scans/1/1/timestamp_filename.jpg",
    "metadata": {
      "original_name": "letter.jpg",
      "size": 1024000,
      "mime_type": "image/jpeg",
      "uploaded_by": 1
    }
  }
}
```

### GET /scans/:matchId
Get all scans for a match (requires authentication).

**Response:**
```json
{
  "scans": [
    {
      "id": 1,
      "letter_event_id": 1,
      "s3_key": "scans/1/1/timestamp_filename.jpg",
      "metadata": {},
      "event_type": "received",
      "event_timestamp": "2026-01-06T00:00:00.000Z"
    }
  ]
}
```

### GET /scans/url/:scanId
Get signed URL for a scan (requires authentication).

**Response:**
```json
{
  "url": "https://s3.amazonaws.com/bucket/key?signature=..."
}
```

## Safety

### POST /safety/block/:userId
Block a user (requires authentication).

**Response:**
```json
{
  "message": "User blocked successfully"
}
```

### DELETE /safety/block/:userId
Unblock a user (requires authentication).

**Response:**
```json
{
  "message": "User unblocked successfully"
}
```

### GET /safety/blocked
Get list of blocked users (requires authentication).

**Response:**
```json
{
  "blocked": [
    {
      "blocked_user_id": 2,
      "created_at": "2026-01-06T00:00:00.000Z",
      "alias": "BlockedUser"
    }
  ]
}
```

### POST /safety/report/:userId
Report a user (requires authentication).

**Request Body:**
```json
{
  "category": "harassment",
  "context": "Description of the issue"
}
```

Categories: `harassment`, `scam`, `sexual_content`, `hate_speech`, `minors`, `spam`, `other`

**Response:**
```json
{
  "message": "Report submitted successfully",
  "report": {
    "id": 1,
    "reporter_id": 1,
    "reported_id": 2,
    "category": "harassment",
    "context": "Description of the issue",
    "created_at": "2026-01-06T00:00:00.000Z"
  }
}
```

## Admin

### POST /admin/login
Admin login.

**Request Body:**
```json
{
  "email": "admin@penpal.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Admin login successful",
  "token": "jwt_token_here"
}
```

### GET /admin/reports
Get all reports (requires admin authentication).

**Query Parameters:**
- `limit` (optional): Number of reports (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "reports": [
    {
      "id": 1,
      "reporter_id": 1,
      "reported_id": 2,
      "category": "harassment",
      "context": "Description",
      "created_at": "2026-01-06T00:00:00.000Z",
      "reporter_alias": "Reporter",
      "reported_alias": "Reported"
    }
  ]
}
```

### GET /admin/reports/:reportId
Get report details (requires admin authentication).

**Response:**
```json
{
  "report": {
    "id": 1,
    "reporter_id": 1,
    "reported_id": 2,
    "category": "harassment",
    "context": "Description",
    "created_at": "2026-01-06T00:00:00.000Z",
    "reporter_alias": "Reporter",
    "reported_alias": "Reported"
  },
  "recent_messages": []
}
```

### POST /admin/action/:userId
Take moderation action (requires admin authentication).

**Request Body:**
```json
{
  "action": "warn",
  "reason": "Reason for action"
}
```

Actions: `warn`, `suspend`, `ban`

### GET /admin/audit-logs
Get audit logs (requires admin authentication).

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `limit` (optional): Number of logs (default: 50)
- `offset` (optional): Offset for pagination (default: 0)

**Response:**
```json
{
  "logs": [
    {
      "id": 1,
      "user_id": 1,
      "action": "address_reveal",
      "details": {},
      "timestamp": "2026-01-06T00:00:00.000Z",
      "alias": "UserAlias"
    }
  ]
}
```

## Consent States

Match consent states flow:
1. `chatting` - Initial state after connection
2. `requested_pen_pal` - One user requested to become pen pals
3. `mutual_pen_pal` - Both users agreed to be pen pals
4. `address_requested` - One user requested address reveal
5. `revealed` - Addresses have been mutually revealed
6. `ended` - Match ended by one party
7. `blocked` - Match blocked due to user blocking

Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): 2026-01-06 03:32:39
Current User's Login: Squ1zM0