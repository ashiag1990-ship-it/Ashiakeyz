# Unified Provider System - Quick Reference

Quick reference for implementing and understanding the unified provider dashboard system in AKFU.

---

## Key Concept

**One Dashboard for All Services**

Users manage all their provider accounts (Higgsfield, Suno, ElevenLabs, etc.) from a single AKFU interface without needing to log into each service separately.

---

## Database Schema at a Glance

```
akfu_provider_configs
├── provider_name (higgsfield, suno, elevenlabs, etc)
├── api_endpoint
├── affiliate_link
└── enabled

akfu_user_provider_accounts
├── user_id
├── provider_name
├── provider_user_id (their ID on provider)
├── provider_email
├── access_token (encrypted)
├── refresh_token (encrypted)
├── credentials_json (encrypted API keys)
├── account_status (active|suspended|expired)
├── credits_balance (cached)
└── last_synced_at

akfu_provider_credits
├── user_id
├── provider_name
├── credit_type (video_generation|music_generation|voice_synthesis)
├── amount
├── cost_usd
├── transaction_type (purchase|usage|refund)
└── status (pending|completed|failed)

akfu_provider_usage
├── user_id
├── provider_name
├── feature (video_gen|music_gen|tts)
├── units_used
├── cost_usd
└── created_at

akfu_affiliate_signups
├── user_id
├── provider_name
├── affiliate_link_used
├── provider_signup_date
├── credit_earned
└── status (pending|confirmed|rejected)
```

---

## API Flow Diagrams

### User Connects Provider (OAuth)

```
Frontend                          Backend                      Provider
   |                                 |                             |
   |--1. "Connect Higgsfield"------->|                             |
   |                                 |--2. OAuth popup            |
   |<----3. Redirect to auth---------|<-----------------------------|
   |                                 |                             |
   |---4. User authorizes---------->|                             |
   |                                 |--5. Get auth code---------->|
   |                                 |<----6. Return code----------|
   |                                 |                             |
   |<----7. "Connected!"-------------|                             |
   |                                 |--8. Store encrypted token--|
   |                                 |--9. Update dashboard       |
   |
```

### User Generates Video

```
Frontend                  Backend                    Provider
   |                         |                          |
   |--1. Generate------->|
   |                    |--2. Get credentials-----|
   |                    |    (decrypt from DB)   |
   |                    |                        |
   |                    |--3. Call API--------->|
   |                    |    (with auth token)  |
   |                    |<----4. Job ID---------|
   |                    |                       |
   |<----5. Processing----|                    |
   |    (show status)      |--6. Log usage      |
   |                       |--7. Deduct credits |
   |                       |--8. Track cost     |
   |
```

### Get Provider Dashboard

```
GET /api/provider-dashboard
↓
Fetch all connected providers for user
↓
For each provider:
  - Get account status
  - Get credit balance
  - Get usage this month
  - Get affiliate link
  - Get last sync time
↓
Return unified dashboard
```

---

## Environment Variables

### Backend Required

```env
TOKEN_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-min-32-chars
ADMIN_KEY=YourAdminKey2026!
DATABASE_URL=file:./akfu.db (dev) or postgresql://... (prod)
PORT=3001
```

### Affiliate Links (Hardcoded in Backend)

```typescript
const AFFILIATE_LINKS = {
  higgsfield: 'https://higgsfield.ai?ref=ashiakeyz_akfu',
  suno: 'https://suno.ai?ref=ashiakeyz_akfu',
  elevenlabs: 'https://elevenlabs.io?ref=ashiakeyz_akfu',
  openai_tts: 'https://platform.openai.com?ref=ashiakeyz_akfu',
  runwayml: 'https://runway.com?ref=ashiakeyz_akfu',
  capcut: 'https://www.capcut.com?ref=ashiakeyz_akfu',
};
```

---

## Core Endpoints

### View Dashboard

```bash
GET /api/provider-dashboard
Authorization: Bearer <token>

Response:
{
  "providers": [
    {
      "name": "higgsfield",
      "status": "connected|needs_setup|expired",
      "credits_balance": 2400.50,
      "usage_this_month": 340.20,
      "affiliate_link": "https://higgsfield.ai?ref=...",
      "last_synced": 1696953600,
      "email": "user@example.com"
    },
    ...
  ]
}
```

### Setup Provider (OAuth)

```bash
POST /api/providers/higgsfield/setup
Authorization: Bearer <token>
Content-Type: application/json

{
  "setup_method": "oauth"
}

Response:
{
  "auth_url": "https://higgsfield.ai/oauth/authorize?..."
}
```

### Complete Provider Auth

```bash
POST /api/providers/higgsfield/complete-auth
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "auth_code_from_oauth"
}

OR (for API key)

{
  "api_key": "hf_your_api_key_here"
}

Response:
{
  "status": "success",
  "account_id": "uuid"
}
```

### Generate with Provider

```bash
POST /api/projects/:projectId/generate-scene
Authorization: Bearer <token>
Content-Type: application/json

{
  "provider": "higgsfield",
  "prompt": "A cinematic scene of...",
  "estimated_cost": 10.0
}

Response:
{
  "job_id": "job-uuid",
  "status": "processing",
  "provider": "higgsfield",
  "cost_estimate": 10.0
}

Process:
1. Get user's Higgsfield credentials from DB
2. Decrypt credentials
3. Call Higgsfield API with user's token
4. Log usage to akfu_provider_usage
5. Deduct cost from akfu_user_provider_accounts.credits_balance
6. Track cost_usd in database
7. Return job_id and status
```

### Disconnect Provider

```bash
DELETE /api/providers/higgsfield/disconnect
Authorization: Bearer <token>

Response:
{
  "status": "disconnected"
}
```

### View Affiliate Earnings

```bash
GET /api/providers/affiliate-earnings
Authorization: Bearer <token>

Response:
{
  "total_earned": 165.00,
  "by_provider": {
    "higgsfield": { "earned": 120.00, "pending": 0 },
    "suno": { "earned": 45.00, "pending": 0 }
  },
  "pending": []
}
```

---

## Credential Encryption

### Storing Credentials

```typescript
// User provides API key
const apiKey = "hf_abc123...";

// Encrypt it
const encrypted = encrypt(apiKey);
// encrypted = "a7f2e9c4..." (hex string)

// Store in database
db.run(
  "INSERT INTO akfu_user_provider_accounts (..., credentials_json, ...) VALUES (..., ?, ...)",
  [encrypted]
);
```

### Using Credentials

```typescript
// Retrieve encrypted credentials
const account = db.get(
  "SELECT credentials_json FROM akfu_user_provider_accounts WHERE ..."
);

// Decrypt it
const decrypted = decrypt(account.credentials_json);
// decrypted = "hf_abc123..." (original API key)

// Use with provider API
const response = await fetch('https://api.higgsfield.ai/generate', {
  headers: { 'Authorization': `Bearer ${decrypted}` }
});
```

---

## Usage Tracking Pattern

Every time a user generates content:

```typescript
// 1. Check provider is connected
const account = db.get(
  "SELECT * FROM akfu_user_provider_accounts 
   WHERE user_id = ? AND provider_name = ? AND account_status = 'active'"
);

if (!account) {
  return error("Provider not connected");
}

// 2. Call provider API (with decrypted credentials)
const credentials = decrypt(account.credentials_json);
const result = await callProviderAPI(credentials, prompt);

// 3. Log the usage
db.run(
  "INSERT INTO akfu_provider_usage (...) VALUES (...)",
  [userId, provider, 'video_generation', 1, estimatedCost, now]
);

// 4. Deduct credits
db.run(
  "UPDATE akfu_user_provider_accounts 
   SET credits_balance = credits_balance - ?
   WHERE user_id = ? AND provider_name = ?",
  [estimatedCost, userId, provider]
);

// 5. Return result
return { job_id, status: 'processing', cost: estimatedCost };
```

---

## Frontend Integration Points

### Provider Dashboard Component

```typescript
// GET /api/provider-dashboard
const providers = await api.get('/api/provider-dashboard');

// Display for each provider:
// - Name & status
// - Credit balance
// - Monthly usage
// - Affiliate link (copyable)
// - Last synced time
// - Connect/Disconnect buttons
```

### Connect Provider Flow

```typescript
// 1. User clicks "Connect Higgsfield"

// 2. Request setup URL
const setup = await api.post('/api/providers/higgsfield/setup', {
  setup_method: 'oauth'
});

// 3. Open OAuth popup
window.open(setup.auth_url);

// 4. Callback returns auth code to frontend
// (handled by callback page)

// 5. Complete auth
const result = await api.post(
  '/api/providers/higgsfield/complete-auth',
  { code: authCode }
);

// 6. Show "Connected" message
// 7. Refresh dashboard
```

### Generate with Provider

```typescript
// User clicks "Generate" button
// Provider is already selected (from dashboard)

const response = await api.post(
  `/api/projects/${projectId}/generate-scene`,
  {
    provider: 'higgsfield',
    prompt: assembledPrompt,
    estimated_cost: 10.0
  }
);

// Shows job_id and status
// User can track in real-time
// Credits deducted automatically
```

---

## Affiliate System

### How Affiliates Work

1. **User signs up via affiliate link**
   ```
   https://higgsfield.ai?ref=ashiakeyz_akfu
   ```

2. **AKFU tracks the signup**
   - When user authorizes Higgsfield in AKFU
   - Record added to akfu_affiliate_signups
   - status = 'pending'

3. **Provider confirms signup**
   - Higgsfield verifies the signup
   - Webhook or API confirms
   - status = 'confirmed'

4. **Credits earned**
   - Provider pays affiliate commission
   - Amount stored in database
   - Shown in /api/providers/affiliate-earnings

### Database Tracking

```sql
INSERT INTO akfu_affiliate_signups 
(id, user_id, provider_name, affiliate_link_used, provider_signup_date, status, created_at)
VALUES 
(uuid, user123, 'higgsfield', 'https://higgsfield.ai?ref=ashiakeyz_akfu', now(), 'pending', now())
```

---

## Testing Checklist

### Setup & Configuration
- [ ] DATABASE_URL configured
- [ ] TOKEN_SECRET and ENCRYPTION_KEY set
- [ ] ADMIN_KEY configured
- [ ] All affiliate links added

### Database
- [ ] All 5 provider tables created
- [ ] Indexes created
- [ ] Provider configs seeded

### Authentication
- [ ] User can register
- [ ] User can login
- [ ] Token is valid
- [ ] Protected routes require token

### Provider System
- [ ] Can view provider dashboard (empty)
- [ ] Can initiate provider setup
- [ ] Can complete OAuth flow
- [ ] Can complete API key flow
- [ ] Credentials are encrypted
- [ ] Can disconnect provider

### Generation
- [ ] User with provider connected can generate
- [ ] Usage is logged
- [ ] Credits are deducted
- [ ] Job status is trackable
- [ ] User without provider gets error

### Affiliate System
- [ ] Signup tracked when user authorizes
- [ ] Affiliate earnings visible
- [ ] Affiliate link displayed on dashboard
- [ ] Earnings show in affiliate endpoint

---

## Common Errors & Fixes

### "Provider not connected"
```
Cause: User tried to generate without connecting provider first
Fix: Have user go to provider dashboard, connect provider, try again
```

### "Invalid credentials"
```
Cause: Encrypted credentials corrupted or expired token
Fix: Disconnect and reconnect provider
```

### "Credits balance is zero"
```
Cause: User ran out of credits
Fix: User needs to add credits via provider dashboard
```

### "Webhook signature invalid"
```
Cause: Affiliate provider webhook signature doesn't match
Fix: Verify webhook secret is correct, verify IP allowlist
```

---

## Performance Optimization Tips

1. **Cache provider configs** - Rarely change, cache for 24 hours
2. **Batch usage logging** - Log every N requests instead of every one
3. **Async credit deduction** - Queue credit deductions, process in batch
4. **Connection pooling** - Use database connection pool (especially PostgreSQL)
5. **Index optimization** - Queries filtered by user_id should use indexes

---

## Security Checklist

- [ ] Credentials encrypted with strong key
- [ ] Encryption key from environment, not hardcoded
- [ ] API keys never logged
- [ ] API keys never in error messages
- [ ] Credentials only decrypted on backend
- [ ] Frontend never sees raw API keys
- [ ] User can only see their own data
- [ ] SQL queries use parameterized inputs
- [ ] Tokens validated on every protected route
- [ ] CORS configured for frontend domain only

---

## Deployment Verification

After deploying to production:

```bash
# 1. Check health
curl https://akfu-api.up.railway.app/health

# 2. Setup database
curl -X POST "https://akfu-api.up.railway.app/admin/setup-db?admin=YOUR_KEY"

# 3. Register test user
curl -X POST https://akfu-api.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{...}'

# 4. Get token from registration response
TOKEN=...

# 5. View provider dashboard (should be empty)
curl https://akfu-api.up.railway.app/api/provider-dashboard \
  -H "Authorization: Bearer $TOKEN"

# 6. Test provider setup
curl -X POST https://akfu-api.up.railway.app/api/providers/higgsfield/setup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"setup_method":"oauth"}'

# All endpoints working = Deployment successful!
```

---

## Next: Frontend Implementation

After backend is deployed, implement frontend components:

1. **Provider Dashboard UI Component**
   - Display list of providers
   - Show connect/disconnect buttons
   - Display balances and usage
   - Show affiliate links (with copy button)

2. **Provider Setup Flow**
   - Modal for provider selection
   - OAuth redirect and callback handling
   - API key input form
   - Success/error messages

3. **Generation UI**
   - Provider selection dropdown
   - Cost estimate display
   - Generate button
   - Progress indicator
   - Result display

4. **Affiliate Section**
   - Earnings display
   - Referral link display
   - Payment history

---

*Quick Reference Complete - Ready for Development*
