# AKFU Deploy - One Command

## Copy & Paste This

```bash
git clone https://github.com/ashiakeyz/akfu && cd akfu && npm i && npm run deploy
```

---

## Or Use Railway CLI (Simplest)

```bash
railway link
railway up
```

Done. Everything auto-configures.

---

## Manual (3 clicks on Railway.app)

1. https://railway.app/dashboard
2. "New Project" → "Deploy from GitHub" → Select repo
3. Add PostgreSQL database
4. Click "Deploy"

Get URL. Paste into Vercel. Live.

---

## What Happens Auto

- ✅ Backend deploys
- ✅ Database creates all 25 tables
- ✅ API endpoints ready
- ✅ Stripe webhook endpoint ready

---

## Env Vars (Set in Railway Dashboard)

```
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
TOKEN_SECRET=<generate-random>
ENCRYPTION_KEY=<generate-random>
ADMIN_KEY=AdminKey2026!
```

Done. Live in 10 minutes.
