#!/bin/bash
# AKFU ONE-COMMAND DEPLOYMENT
# Just run: bash QUICK_DEPLOY.sh

set -e

echo "🚀 AKFU Quick Deploy Starting..."

# 1. Check dependencies
echo "✓ Checking dependencies..."
command -v railway >/dev/null 2>&1 || { echo "Install: npm i -g @railway/cli"; exit 1; }
command -v git >/dev/null 2>&1 || { echo "Git required"; exit 1; }

# 2. Initialize Railway project
echo "✓ Creating Railway project..."
railway init --name akfu-api

# 3. Add PostgreSQL
echo "✓ Adding PostgreSQL..."
railway add --name database --service postgres

# 4. Set environment variables
echo "✓ Setting environment variables..."
railway variables set \
  NODE_ENV=production \
  PORT=3001 \
  TOKEN_SECRET=$(openssl rand -hex 16) \
  ENCRYPTION_KEY=$(openssl rand -hex 16) \
  ADMIN_KEY="YourAdminKey2026!$(openssl rand -hex 4)"

# 5. Deploy
echo "✓ Deploying to Railway..."
railway up

# 6. Get domain
DOMAIN=$(railway domain)
echo "✓ Backend deployed to: $DOMAIN"

# 7. Initialize database
echo "✓ Initializing database..."
ADMIN_KEY=$(railway variables get ADMIN_KEY)
curl -X POST "https://$DOMAIN/admin/setup-db?admin=$ADMIN_KEY" \
  -H "Content-Type: application/json"

echo ""
echo "✅ AKFU DEPLOYED!"
echo ""
echo "Next steps:"
echo "1. Save this URL for frontend: $DOMAIN"
echo "2. Setup Stripe keys in Railway dashboard"
echo "3. Deploy frontend to Vercel with NEXT_PUBLIC_API_URL=$DOMAIN"
echo ""
echo "API Ready: https://$DOMAIN/api/health"
