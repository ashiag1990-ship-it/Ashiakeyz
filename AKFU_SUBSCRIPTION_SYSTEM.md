# AKFU Subscription System - Stripe Integration

**Status:** Implementation Specification  
**Date:** October 12, 2026  
**Billing Model:** $39.99/month with 14-day free trial

---

## 🎯 Subscription Flow

```
1. User purchases Directors Course ($349.99) on Ashiakeyz.com
   ↓
2. Course platform creates/links AKFU account via webhook/API
   ↓
3. User enrolls in course training
   ↓
4. At "AKFU University" section of course:
   - AKFU banner appears: "Add payment method to unlock"
   - User enters Stripe card details
   - Card is saved but NOT charged
   - 14-day trial countdown begins
   ↓
5. Day 14 at 11:59 PM:
   - First charge: $39.99
   - Email: "Your subscription is now active"
   ↓
6. Monthly:
   - Charge $39.99 on subscription anniversary
   - If successful: Email confirmation
   - If declined: Trigger payment retry workflow
   ↓
7. User can cancel anytime:
   - Subscription ends immediately
   - No refunds
   - Access revoked
```

---

## 🗄️ Database Tables

### akfu_subscriptions

```sql
CREATE TABLE akfu_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  
  subscription_tier TEXT DEFAULT 'monthly', -- "monthly", "trial_expired_declined", "cancelled"
  subscription_status TEXT NOT NULL, -- "trial_active", "active", "payment_failed", "cancelled"
  
  -- Trial Period
  trial_start_date TIMESTAMP,
  trial_end_date TIMESTAMP,
  trial_days INT DEFAULT 14,
  
  -- Billing
  monthly_amount DECIMAL(10, 2) DEFAULT 39.99,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT, -- Only set after first charge
  
  -- Payment Method
  payment_method_id TEXT, -- Stripe PaymentMethod ID
  card_last_four TEXT,
  card_brand TEXT, -- "visa", "mastercard", etc.
  card_exp_month INT,
  card_exp_year INT,
  
  -- Billing Dates
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  next_billing_date TIMESTAMP,
  last_payment_date TIMESTAMP,
  
  -- Payment Failures
  payment_failure_count INT DEFAULT 0,
  last_payment_failure_date TIMESTAMP,
  last_payment_failure_reason TEXT,
  
  -- Cancellation
  cancellation_date TIMESTAMP,
  cancellation_reason TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);

CREATE INDEX idx_akfu_subscriptions_user_id ON akfu_subscriptions(user_id);
CREATE INDEX idx_akfu_subscriptions_status ON akfu_subscriptions(subscription_status);
CREATE INDEX idx_akfu_subscriptions_next_billing ON akfu_subscriptions(next_billing_date);
```

### akfu_payment_attempts

```sql
CREATE TABLE akfu_payment_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  
  charge_amount DECIMAL(10, 2) NOT NULL,
  stripe_charge_id TEXT,
  stripe_intent_id TEXT,
  
  attempt_type TEXT NOT NULL, -- "initial_charge", "retry", "manual_retry"
  attempt_number INT DEFAULT 1,
  
  status TEXT NOT NULL, -- "pending", "succeeded", "failed", "cancelled"
  failure_reason TEXT, -- Stripe decline reason
  failure_code TEXT, -- Stripe error code
  
  billing_period_start TIMESTAMP,
  billing_period_end TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES akfu_users(id),
  FOREIGN KEY (subscription_id) REFERENCES akfu_subscriptions(id)
);

CREATE INDEX idx_akfu_payment_attempts_user_id ON akfu_payment_attempts(user_id);
CREATE INDEX idx_akfu_payment_attempts_status ON akfu_payment_attempts(status);
```

### akfu_payment_retry_workflow

```sql
CREATE TABLE akfu_payment_retry_workflow (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  initial_failure_date TIMESTAMP,
  
  workflow_status TEXT NOT NULL, -- "active", "recovered", "cancelled"
  
  -- Retry Schedule
  attempt_1_scheduled TIMESTAMP, -- Immediately
  attempt_1_sent BOOLEAN DEFAULT FALSE,
  attempt_1_completed_at TIMESTAMP,
  
  attempt_2_scheduled TIMESTAMP, -- 3 days after initial failure
  attempt_2_sent BOOLEAN DEFAULT FALSE,
  attempt_2_completed_at TIMESTAMP,
  
  attempt_3_scheduled TIMESTAMP, -- 7 days after initial failure
  attempt_3_sent BOOLEAN DEFAULT FALSE,
  attempt_3_completed_at TIMESTAMP,
  
  attempt_4_scheduled TIMESTAMP, -- 14 days after initial failure
  attempt_4_sent BOOLEAN DEFAULT FALSE,
  attempt_4_completed_at TIMESTAMP,
  
  -- Final Status
  recovery_date TIMESTAMP, -- When payment finally succeeded
  cancellation_initiated_date TIMESTAMP, -- When user cancelled
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES akfu_users(id),
  FOREIGN KEY (subscription_id) REFERENCES akfu_subscriptions(id)
);

CREATE INDEX idx_akfu_payment_retry_workflow_status ON akfu_payment_retry_workflow(workflow_status);
```

### akfu_payment_emails

```sql
CREATE TABLE akfu_payment_emails (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subscription_id TEXT NOT NULL,
  
  email_type TEXT NOT NULL, -- "trial_activated", "payment_successful", "payment_failed_1", "payment_failed_2", "payment_failed_3", "payment_failed_4", "subscription_cancelled"
  email_subject TEXT,
  email_body TEXT,
  
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP, -- If email has reactivation link
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES akfu_users(id),
  FOREIGN KEY (subscription_id) REFERENCES akfu_subscriptions(id)
);

CREATE INDEX idx_akfu_payment_emails_user_id ON akfu_payment_emails(user_id);
CREATE INDEX idx_akfu_payment_emails_type ON akfu_payment_emails(email_type);
```

---

## 💳 API Endpoints

### Subscription Setup (In Course)

```bash
POST /api/subscription/setup-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_method_id": "<stripe-payment-method-id>"
}

Response:
{
  "subscription_id": "uuid",
  "trial_start_date": "2026-10-12",
  "trial_end_date": "2026-10-26",
  "status": "trial_active",
  "message": "14-day trial activated"
}
```

### Get Subscription Status

```bash
GET /api/subscription/status
Authorization: Bearer <token>

Response:
{
  "subscription_id": "uuid",
  "status": "trial_active|active|payment_failed|cancelled",
  "subscription_tier": "monthly",
  "trial_end_date": "2026-10-26",
  "next_billing_date": "2026-10-26",
  "payment_method": {
    "card_last_four": "4242",
    "card_brand": "visa",
    "card_exp_month": 12,
    "card_exp_year": 2028
  },
  "payment_failures": {
    "failure_count": 2,
    "last_failure_date": "2026-10-13",
    "last_failure_reason": "insufficient_funds"
  }
}
```

### Update Payment Method

```bash
POST /api/subscription/update-payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_method_id": "<new-stripe-payment-method-id>"
}

Response:
{
  "status": "success",
  "message": "Payment method updated",
  "new_card_last_four": "5555"
}
```

### Retry Failed Payment

```bash
POST /api/subscription/retry-payment
Authorization: Bearer <token>
Content-Type: application/json

Response:
{
  "attempt_status": "pending|succeeded|failed",
  "message": "Payment retry initiated",
  "failure_reason": null or "decline_reason"
}
```

### Cancel Subscription

```bash
POST /api/subscription/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancellation_reason": "too expensive|don't need|technical issues|other"
}

Response:
{
  "status": "cancelled",
  "cancellation_date": "2026-10-12",
  "access_revoked_at": "2026-10-12T20:48:00Z"
}
```

---

## ⚡ Stripe Integration

### Payment Intent Creation

**At Trial Activation (No Charge):**
```typescript
// User clicks "Add payment method" in course
POST /api/subscription/setup-payment

1. Create Stripe Customer (if not exists)
   - stripeCustomerId = Stripe Customer ID
   - Save to akfu_subscriptions

2. Create PaymentMethod from frontend token
   - paymentMethodId = Stripe PaymentMethod ID

3. Attach PaymentMethod to Customer
   - stripe.paymentMethods.attach()

4. Create subscription in akfu_subscriptions
   - subscription_status = "trial_active"
   - trial_start_date = NOW()
   - trial_end_date = NOW() + 14 days
   - next_billing_date = trial_end_date
   - payment_method_id = stripePaymentMethodId
   - card_last_four, card_brand, card_exp_month, card_exp_year = from Stripe

5. Send email: "Trial activated"
```

**On Billing Date (After Trial):**
```typescript
// Scheduled job runs daily at 00:00 UTC
const subscriptions = db.query(
  "SELECT * FROM akfu_subscriptions WHERE next_billing_date <= NOW() AND subscription_status IN ('trial_active', 'active')"
);

for (const sub of subscriptions) {
  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 3999, // $39.99 in cents
    currency: 'usd',
    customer: sub.stripe_customer_id,
    payment_method: sub.payment_method_id,
    off_session: true, // recurring charge
    confirm: true
  });

  // Log attempt
  db.run(
    "INSERT INTO akfu_payment_attempts (...) VALUES (...)",
    [sub.user_id, sub.id, 39.99, paymentIntent.id, paymentIntent.client_secret, 'initial_charge', 1, paymentIntent.status, ...]
  );

  if (paymentIntent.status === 'succeeded') {
    // Update subscription
    db.run(
      "UPDATE akfu_subscriptions SET subscription_status = 'active', stripe_subscription_id = ?, current_period_start = ?, current_period_end = ?, next_billing_date = ?, last_payment_date = NOW() WHERE id = ?",
      [paymentIntent.id, NOW(), NOW() + 30 days, NOW() + 30 days, sub.id]
    );

    // Send email: "Payment successful"
    sendEmail('payment_successful', sub.user_id);

  } else if (paymentIntent.status === 'requires_action') {
    // 3D Secure or other authentication needed
    // Send email with reauth link

  } else if (paymentIntent.status === 'succeeded' === false) {
    // Payment failed
    handlePaymentFailure(sub);
  }
}
```

---

## 📧 Email Workflow on Payment Failure

### Failure Detection

```typescript
if (paymentIntent.status === 'requires_payment_method' || status === 'canceled') {
  handlePaymentFailure(sub);
}

function handlePaymentFailure(subscription) {
  const failureReason = paymentIntent.last_payment_error.message;

  // Update subscription
  db.run(
    "UPDATE akfu_subscriptions SET subscription_status = 'payment_failed', payment_failure_count = payment_failure_count + 1, last_payment_failure_date = NOW(), last_payment_failure_reason = ? WHERE id = ?",
    [failureReason, subscription.id]
  );

  // Create retry workflow (if not exists)
  const workflow = db.get(
    "SELECT id FROM akfu_payment_retry_workflow WHERE subscription_id = ? AND workflow_status = 'active'",
    [subscription.id]
  );

  if (!workflow) {
    db.run(
      "INSERT INTO akfu_payment_retry_workflow (id, user_id, subscription_id, initial_failure_date, workflow_status, attempt_1_scheduled) VALUES (?, ?, ?, NOW(), 'active', NOW())",
      [uuid(), subscription.user_id, subscription.id]
    );
  }

  // Send immediate email
  sendPaymentFailureEmail(subscription, failureReason, 1);
}
```

### Email Sequence

**Email 1: Immediate (within 1 hour)**
```
Subject: Payment Failed - Update Your Payment Method

Hi [Name],

Your card was declined when we tried to charge your AKFU subscription ($39.99/month).

Reason: [failure_reason]

What to do:
1. Update your payment method: [link to /subscription/update-payment]
2. We'll retry automatically in 3 days

Your access is suspended until payment succeeds. Complete this within 14 days to keep your account active.

Reactivate now: [link with token]
- [Cancel subscription]
```

**Email 2: 3 Days After Failure**
```
Subject: AKFU Access Suspended - Update Payment Method Now

Hi [Name],

Your AKFU subscription payment is still failing. You have 11 days to fix this before your account is cancelled.

Your access is currently suspended.

Update payment: [link to /subscription/update-payment]

[Cancel subscription option]
```

**Email 3: 7 Days After Failure**
```
Subject: FINAL NOTICE: Your AKFU Subscription Will Be Cancelled

Hi [Name],

Your payment method is still failing. You have 7 days to update it before your subscription is cancelled permanently.

Update payment now: [link]

[Cancel subscription option]
```

**Email 4: 14 Days After Failure (Final)**
```
Subject: Your AKFU Subscription Has Been Cancelled

Hi [Name],

Your subscription has been cancelled due to failed payment attempts.

Your access to AKFU is now revoked.

Want to reactivate?
Update payment: [link with reactivation option]

We're here if you want to try again.
```

### Retry Logic

```typescript
// Scheduled job runs every day
const failedWorkflows = db.query(
  "SELECT * FROM akfu_payment_retry_workflow WHERE workflow_status = 'active' AND (attempt_1_scheduled <= NOW() OR attempt_2_scheduled <= NOW() OR attempt_3_scheduled <= NOW() OR attempt_4_scheduled <= NOW())"
);

for (const workflow of failedWorkflows) {
  const sub = db.get("SELECT * FROM akfu_subscriptions WHERE id = ?", [workflow.subscription_id]);

  // Determine which attempt this is
  let attemptNumber = 1;
  if (workflow.attempt_1_completed_at) attemptNumber = 2;
  if (workflow.attempt_2_completed_at) attemptNumber = 3;
  if (workflow.attempt_3_completed_at) attemptNumber = 4;

  if (attemptNumber <= 4) {
    // Retry payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 3999,
      currency: 'usd',
      customer: sub.stripe_customer_id,
      payment_method: sub.payment_method_id,
      off_session: true,
      confirm: true
    });

    // Log attempt
    db.run(
      "INSERT INTO akfu_payment_attempts (...) VALUES (...)",
      [sub.user_id, sub.id, 39.99, paymentIntent.id, null, 'retry', attemptNumber, paymentIntent.status, ...]
    );

    if (paymentIntent.status === 'succeeded') {
      // Payment succeeded
      db.run(
        "UPDATE akfu_subscriptions SET subscription_status = 'active', payment_failure_count = 0 WHERE id = ?",
        [sub.id]
      );

      db.run(
        "UPDATE akfu_payment_retry_workflow SET workflow_status = 'recovered', recovery_date = NOW() WHERE id = ?",
        [workflow.id]
      );

      // Send email: "Payment recovered"
      sendEmail('payment_recovered', sub.user_id);

    } else {
      // Payment still failing
      db.run(
        "UPDATE akfu_payment_retry_workflow SET attempt_${attemptNumber}_completed_at = NOW() WHERE id = ?",
        [workflow.id]
      );

      // If this is 4th attempt (14 days), cancel subscription
      if (attemptNumber === 4) {
        db.run(
          "UPDATE akfu_subscriptions SET subscription_status = 'cancelled', cancellation_date = NOW() WHERE id = ?",
          [sub.id]
        );

        db.run(
          "UPDATE akfu_payment_retry_workflow SET workflow_status = 'cancelled', cancellation_initiated_date = NOW() WHERE id = ?",
          [workflow.id]
        );

        sendEmail('subscription_cancelled_failed_payment', sub.user_id);
      }
    }
  }
}
```

---

## 🔐 Access Control

### Before Any AKFU Route

```typescript
// Apply to all GET /api routes
const subscriptionMiddleware = (req) => {
  const user = authMiddleware(req);
  
  const sub = db.get(
    "SELECT * FROM akfu_subscriptions WHERE user_id = ?",
    [user.id]
  );

  if (!sub) {
    return { error: "No subscription found. Purchase course to access AKFU." };
  }

  if (sub.subscription_status === 'cancelled') {
    return { error: "Your subscription is cancelled. Reactivate to continue." };
  }

  if (sub.subscription_status === 'payment_failed') {
    return { error: "Payment failed. Update your payment method to restore access.", action: "/subscription/update-payment" };
  }

  // Check if trial is still active or subscription is active
  const now = new Date();
  if (sub.subscription_status === 'trial_active' && now < sub.trial_end_date) {
    // Trial is valid
    return user;
  }

  if (sub.subscription_status === 'active') {
    // Subscription is valid
    return user;
  }

  return { error: "Subscription expired. Renew to continue." };
};
```

---

## 🌐 Stripe Webhook Handling

### Webhook Events to Listen For

```typescript
POST /api/webhooks/stripe
Content-Type: application/json

// Verify signature
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);

switch (event.type) {
  case 'payment_intent.succeeded':
    // Payment succeeded
    const paymentIntent = event.data.object;
    updatePaymentAttempt(paymentIntent.id, 'succeeded');
    break;

  case 'payment_intent.payment_failed':
    // Payment failed
    const failedIntent = event.data.object;
    handlePaymentFailure(failedIntent);
    break;

  case 'charge.refunded':
    // Refund issued
    const refund = event.data.object;
    handleRefund(refund);
    break;

  case 'customer.subscription.deleted':
    // Subscription deleted (shouldn't happen with our setup, but handle it)
    break;
}

return { received: true };
```

---

## 📊 Subscription Status Visualization (Frontend)

### Trial Active (Days 1-14)
```
┌─────────────────────────────────┐
│ Trial Active                    │
│                                 │
│ Days remaining: 12              │
│ Next billing: Oct 26, 2026      │
│ Amount: $39.99/month            │
│                                 │
│ Payment method: Visa ••• 4242   │
│                                 │
│ [Update Payment] [Cancel Trial] │
└─────────────────────────────────┘
```

### Active (Subscription Running)
```
┌─────────────────────────────────┐
│ Active Subscription             │
│                                 │
│ Next billing: Nov 26, 2026      │
│ Amount: $39.99/month            │
│                                 │
│ Payment method: Visa ••• 4242   │
│                                 │
│ [Update Payment] [Cancel Plan]  │
└─────────────────────────────────┘
```

### Payment Failed (Days 1-14)
```
┌─────────────────────────────────┐
│ ⚠️ Payment Failed               │
│                                 │
│ Action required                 │
│ Days to fix: 10                 │
│                                 │
│ Your card was declined.         │
│ Reason: Insufficient funds      │
│                                 │
│ [Update Payment Method]         │
│ [Cancel Subscription]           │
└─────────────────────────────────┘
```

### Cancelled
```
┌─────────────────────────────────┐
│ Subscription Cancelled          │
│                                 │
│ Your access to AKFU is revoked. │
│                                 │
│ Cancelled: Oct 13, 2026         │
│ Reason: User requested          │
│                                 │
│ [Reactivate Subscription]       │
└─────────────────────────────────┘
```

---

## 🔧 Scheduled Jobs

### Daily at 00:00 UTC

**Job 1: Process Billing**
```typescript
// Find subscriptions due for billing
- Check next_billing_date <= NOW()
- Create PaymentIntent for each
- Handle succeeded/failed
- Update subscriptions
```

**Job 2: Process Retry Workflow**
```typescript
// Find active workflows with scheduled retries
- Check attempt_X_scheduled <= NOW()
- Retry payment
- Send emails if failed
- Cancel if 4th attempt fails
```

**Job 3: Check Expiring Cards**
```typescript
// Find subscriptions with cards expiring this month
- Send "Update payment method" email
- Mark card as expiring
```

---

## 🎁 Special Cases

### Course Completion → AKFU Access

**Flow:**
1. User completes Directors Course on Ashiakeyz.com
2. Course platform calls webhook: `POST /api/courses/completion`
3. AKFU creates subscription record (if doesn't exist)
4. Course then shows AKFU banner with "Add payment method"
5. User clicks, enters card, trial activates

**Webhook:**
```bash
POST /api/courses/completion
Content-Type: application/json
Authorization: Bearer <course-platform-token>

{
  "user_email": "user@example.com",
  "user_name": "John Doe",
  "course_id": "directors-course",
  "completion_date": "2026-10-12"
}

Response:
{
  "akfu_user_id": "uuid",
  "akfu_status": "ready_for_payment_setup"
}
```

### Card Reactivation After Cancellation

**When User Clicks "Reactivate":**
```typescript
POST /api/subscription/reactivate
{
  "payment_method_id": "<stripe-payment-method-id>"
}

// Action:
1. Update subscription_status to "trial_active" (new trial) OR "active" (charge immediately)
2. Set new trial_end_date = NOW() + 14 days
3. Clear payment_failure_count
4. Cancel retry workflow
5. Charge immediately if reactivating mid-cycle
```

---

## 🧪 Testing Checklist

- [ ] Trial activation (card collected, no charge)
- [ ] Successful charge after 14 days
- [ ] Failed charge triggers retry workflow
- [ ] Email sequence sends on schedule (1 day, 3 days, 7 days, 14 days)
- [ ] User can update payment method
- [ ] Payment recovers after update
- [ ] Manual retry succeeds
- [ ] 4th failed attempt cancels subscription
- [ ] Cancellation revokes access immediately
- [ ] Reactivation restarts subscription
- [ ] Stripe webhook events handled correctly
- [ ] Access middleware blocks cancelled/failed subscriptions
- [ ] Card expiration warning sends 30 days before

---

*Subscription System Specification Complete*  
*Ready for Backend Implementation*
