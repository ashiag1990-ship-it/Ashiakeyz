# AKFU Deployment Checklist
**Complete guide to deploying AKFU to production**

---

## 🎯 Overview

This checklist covers:
1. Backend deployment to Railway.app
2. Frontend deployment to Vercel
3. Database setup and initialization
4. Stripe integration
5. Email service setup
6. Testing and verification
7. Launch checklist

**Estimated Time:** 2-3 hours for complete deployment

---

## 📋 Pre-Deployment Checklist

- [ ] Railway account created (railway.app)
- [ ] Vercel account created (vercel.com)
- [ ] Stripe account created (stripe.com)
- [ ] GitHub repo access
- [ ] Environment variables documented
- [ ] Team access configured
- [ ] Backup/rollback plan in place

---

## 🔧 PART 1: Backend Deployment to Railway

### Step 1.1: Create Railway Project

```bash
# Login to Railway
# Go to https://railway.app/dashboard
# Click "New Project"
# Select "Deploy from GitHub"
# Connect your GitHub account
# Select the ashiakeyz/akfu repository
```

### Step 1.2: Create PostgreSQL Database

```bash
# In Railway project dashboard:
# 1. Click "Add"
# 2. Select "Database"
# 3. Choose "PostgreSQL"
# 4. Click "Add"
# 5. Wait for database to initialize (2-3 min)
```

### Step 1.3: Configure Backend Service

```bash
# In Railway project dashboard:
# 1. Click "New Service"
# 2. Select "GitHub"
# 3. Select this repository
# 4. Railway will auto-detect Hono app
# 5. Set root directory to "/" (if monorepo, adjust as needed)
```

### Step 1.4: Set Environment Variables

**In Railway → Project → Variables tab:**

```env
# Node/Bun Runtime
NODE_ENV=production

# Server
PORT=3001

# Database (AUTO-FILLED BY RAILWAY)
DATABASE_URL=postgresql://postgres:password@host:5432/railway

# Secrets (GENERATE NEW VALUES)
TOKEN_SECRET=<generate-32-char-random-string>
ENCRYPTION_KEY=<generate-32-char-random-string>
ADMIN_KEY=YourAdminKey2026!<generate-8-char-random>

# Stripe (GET FROM STRIPE DASHBOARD)
STRIPE_SECRET_KEY=sk_live_<your-key>
STRIPE_PUBLISHABLE_KEY=pk_live_<your-key>

# Email Service (OPTIONAL - FOR LATER)
SENDGRID_API_KEY=<optional-later>
EMAIL_FROM=noreply@akfu.com
```

**Generate secure values:**
```bash
# On your computer
openssl rand -hex 16  # TOKEN_SECRET (32 chars)
openssl rand -hex 16  # ENCRYPTION_KEY (32 chars)
openssl rand -hex 4   # ADMIN_KEY suffix (8 chars)
```

### Step 1.5: Deploy Backend

```bash
# In Railway:
# 1. Click the service
# 2. Click "Deploy"
# 3. Wait for build (2-5 minutes)
# 4. Verify "Deploy Successful" message
```

### Step 1.6: Get Backend URL

```bash
# In Railway → Your Service:
# 1. Click "Settings"
# 2. Find "Domains"
# 3. Click "Generate Domain"
# 4. Copy domain (e.g., akfu-api.up.railway.app)
# 5. Save as NEXT_PUBLIC_API_URL for frontend
```

### Step 1.7: Initialize Database

```bash
# Replace YOUR_API_URL and YOUR_ADMIN_KEY
curl -X POST "https://YOUR_API_URL/admin/setup-db?admin=YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "status": "success",
#   "tables_created": 25,
#   "indexes_created": 10
# }
```

---

## 🎨 PART 2: Frontend Deployment to Vercel

### Step 2.1: Create Vercel Project

```bash
# Go to https://vercel.com
# Click "Add New"
# Select "Project"
# Import from GitHub
# Select the ashiakeyz/akfu repository
# Click "Import"
```

### Step 2.2: Configure Environment Variables

**In Vercel → Project → Settings → Environment Variables:**

```env
# API Configuration
NEXT_PUBLIC_API_URL=https://YOUR_API_URL
NEXT_PUBLIC_ENVIRONMENT=production

# Stripe Public Key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<your-key>
```

### Step 2.3: Deploy Frontend

```bash
# Vercel auto-deploys on push
# Or manually click "Deploy" in Vercel dashboard
# Wait for build (1-2 minutes)
# Verify deployment successful
```

### Step 2.4: Get Frontend URL

```bash
# In Vercel:
# 1. Click "Domains"
# 2. Copy your domain (e.g., akfu-studios.vercel.app)
# 3. Update any hardcoded URLs in backend
# 4. Update CORS settings if needed
```

---

## 💳 PART 3: Stripe Integration

### Step 3.1: Get Stripe Keys

```bash
# Go to https://dashboard.stripe.com
# Left menu → API Keys
# Copy:
#   - Publishable key (pk_live_...)
#   - Secret key (sk_live_...)
# Add to environment variables (done in Step 1.4 and 2.2)
```

### Step 3.2: Configure Webhook

```bash
# In Stripe Dashboard:
# 1. Click "Webhooks" (Left menu)
# 2. Click "Add Endpoint"
# 3. Endpoint URL: https://YOUR_API_URL/api/webhooks/stripe
# 4. Events to send:
#    - payment_intent.succeeded
#    - payment_intent.payment_failed
#    - customer.subscription.deleted
# 5. Click "Create endpoint"
# 6. Copy signing secret
```

### Step 3.3: Add Webhook Secret to Backend

```bash
# Add to Railway environment variables:
STRIPE_WEBHOOK_SECRET=whsec_...

# Redeploy backend
```

### Step 3.4: Test Stripe Integration

```bash
# In Stripe Dashboard → Webhooks:
# 1. Click the endpoint you created
# 2. Click "Send test webhook"
# 3. Select "payment_intent.succeeded"
# 4. Click "Send test webhook"
# 5. Verify it succeeds (200 response)
```

---

## 📧 PART 4: Email Service Setup (Optional for MVP)

### Step 4.1: Choose Email Service

**Options:**
- SendGrid (recommended)
- AWS SES
- Mailgun
- Postmark

**For SendGrid:**

```bash
# 1. Create SendGrid account (sendgrid.com)
# 2. Create API key
# 3. Add to Railway env vars:
SENDGRID_API_KEY=SG.xxxxx
EMAIL_FROM=billing@akfu.com
```

### Step 4.2: Email Templates

**Needed templates:**
- Welcome email
- Confirmation email
- Payment failure notice (Day 1)
- Payment failure warning (Day 3)
- Final payment notice (Day 7)
- Final notice before cancellation (Day 14)
- Subscription cancelled
- Subscription reactivated

---

## 🧪 PART 5: Testing & Verification

### Step 5.1: Test Registration & Login

```bash
# 1. Visit https://YOUR_FRONTEND_URL
# 2. Click "Register"
# 3. Create account with test email
# 4. Should redirect to dashboard
# 5. Verify JWT token in localStorage

curl -X POST https://YOUR_API_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'

# Expected response: { user_id, token, user_data }
```

### Step 5.2: Test Subscription Flow

```bash
# Get token from login
TOKEN=<your-token>

# 1. Setup payment (14-day trial)
curl -X POST https://YOUR_API_URL/api/subscription/setup-payment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stripe_payment_method_id": "pm_test_visa"
  }'

# Expected: { subscription_id, status: "trial", trial_ends_at }

# 2. Check subscription status
curl https://YOUR_API_URL/api/subscription/status \
  -H "Authorization: Bearer $TOKEN"

# Expected: { subscription_id, status: "trial", trial_ends_at }
```

### Step 5.3: Test Challenge Room

```bash
TOKEN=<your-token>

# 1. Create challenge
curl -X POST https://YOUR_API_URL/api/challenges \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "studio_name": "Test Studio",
    "niche": "AI Film Production"
  }'

# Expected: { challenge_id, status: "active", starts_at, ends_at }

# 2. Get challenge details
CHALLENGE_ID=<from-response>
curl https://YOUR_API_URL/api/challenges/$CHALLENGE_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected: Full challenge details with revenue_streams, monthly_plans, etc
```

### Step 5.4: Test Provider System

```bash
TOKEN=<your-token>

# 1. View provider dashboard
curl https://YOUR_API_URL/api/provider-dashboard \
  -H "Authorization: Bearer $TOKEN"

# Expected: { providers: [] } (empty initially)

# 2. Setup provider with API key
curl -X POST https://YOUR_API_URL/api/providers/higgsfield/setup \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "setup_method": "api_key", "api_key": "hf_test_key" }'

# Expected: { status: "success", account_id }
```

### Step 5.5: Test Database Initialization

```bash
# Verify all tables created
curl https://YOUR_API_URL/api/health

# Expected: { status: "ok", tables: 25, indexes: 10 }

# Check specific tables exist
curl -X POST https://YOUR_API_URL/admin/check-tables?admin=YOUR_ADMIN_KEY

# Expected: { tables_exist: true, count: 25 }
```

---

## 🚀 PART 6: Pre-Launch Checklist

### Backend Checklist
- [ ] Database initialized (25 tables created)
- [ ] All endpoints tested and working
- [ ] Stripe integration configured
- [ ] Webhook handler verified
- [ ] Environment variables set securely
- [ ] CORS configured for frontend domain
- [ ] Error logging enabled
- [ ] Rate limiting enabled
- [ ] Backups configured (Railway handles this)

### Frontend Checklist
- [ ] All components built and tested
- [ ] API client configured correctly
- [ ] Authentication flow working
- [ ] Payment setup modal functional
- [ ] Challenge room UI complete
- [ ] Responsive design verified (mobile/tablet/desktop)
- [ ] Error messages user-friendly
- [ ] Loading states implemented
- [ ] SEO metadata added

### Security Checklist
- [ ] All secrets in environment variables (not hardcoded)
- [ ] HTTPS enforced (Vercel + Railway both support)
- [ ] CORS whitelist configured
- [ ] SQL injection prevention verified
- [ ] XSS protection enabled
- [ ] CSRF tokens for forms (if applicable)
- [ ] Rate limiting on auth endpoints
- [ ] Subscription validation on protected routes
- [ ] Payment data never logged
- [ ] No API keys in response bodies

### Monitoring Checklist
- [ ] Error tracking enabled (Sentry or similar)
- [ ] Performance monitoring enabled
- [ ] Database backups configured
- [ ] Alert rules set up
- [ ] Uptime monitoring configured
- [ ] Log aggregation enabled

---

## 📊 PART 7: Monitoring & Maintenance

### Daily Checks
```bash
# Monitor health
curl https://YOUR_API_URL/api/health

# Check logs in Railway Dashboard
# Watch for errors, failures, warnings
```

### Weekly Tasks
- [ ] Review error logs
- [ ] Check database size
- [ ] Monitor Stripe disputes/chargebacks
- [ ] Review subscription metrics
- [ ] Check email delivery rates

### Monthly Tasks
- [ ] Database optimization (VACUUM, ANALYZE)
- [ ] Security audit
- [ ] Performance review
- [ ] Backup verification
- [ ] Cost analysis

---

## 🔄 Post-Deployment Operations

### Payment Processing

**Automatic (via scheduled jobs):**
1. Day 14 of trial: Auto-charge $39.99
2. Day 1 after charge fails: Send email + retry
3. Day 3: Send warning email + retry
4. Day 7: Send urgent email + retry
5. Day 14: Send final notice + retry
6. On final failure: Auto-cancel subscription

**Manual interventions:**
- Customer updates payment method → Automatic reactivation
- Customer requests cancellation → Immediate cancellation
- Refund requests → Process in Stripe dashboard

### Database Maintenance

```bash
# Connect to Railway PostgreSQL
# Run weekly:
VACUUM ANALYZE;

# Check database size:
SELECT pg_size_pretty(pg_database_size('railway'));
```

---

## 🆘 Troubleshooting

### Backend Won't Deploy
```
1. Check build logs in Railway
2. Verify Node version compatible
3. Ensure package.json has all deps
4. Check for syntax errors: npm run build
5. Verify environment variables set
```

### Database Connection Failed
```
1. Verify DATABASE_URL is correct
2. Check PostgreSQL is running (Railway)
3. Verify IP whitelist (if applicable)
4. Test connection: psql $DATABASE_URL
5. Check logs for connection errors
```

### Stripe Webhook Not Firing
```
1. Verify endpoint URL is correct
2. Check webhook signing secret in env vars
3. Verify events are enabled in Stripe
4. Check logs for webhook errors
5. Test webhook in Stripe dashboard
```

### Users Can't Subscribe
```
1. Verify Stripe keys are correct
2. Check subscription endpoint logs
3. Verify payment method is valid
4. Check database subscription table
5. Verify Stripe webhook is working
```

---

## 📞 Support Contacts

- **Railway Support:** https://railway.app/support
- **Vercel Support:** https://vercel.com/support
- **Stripe Support:** https://support.stripe.com
- **GitHub Issues:** Your repo issues page

---

## ✅ Final Sign-Off

Before launching to users:

- [ ] All tests passing
- [ ] Performance acceptable (< 500ms response time)
- [ ] Error handling comprehensive
- [ ] Monitoring alerts configured
- [ ] Backup and recovery plan tested
- [ ] Security audit passed
- [ ] Team trained on systems
- [ ] Launch communication ready

---

**Status:** Ready for production deployment
**Last Updated:** October 12, 2026
**Estimated Users at Launch:** Test phase

