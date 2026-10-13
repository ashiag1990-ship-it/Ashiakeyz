# AKFU Deployment Guide - Complete with Unified Provider System

Complete instructions for deploying Ashia Keyz Film University Phase 1 with integrated provider management, credential storage, and affiliate tracking.

---

## Prerequisites

- [x] Bun runtime 1.0+ installed (https://bun.sh)
- [x] Node.js 18+ installed (for package compatibility)
- [x] Railway account (https://railway.app)
- [x] Vercel account for frontend (https://vercel.com)
- [x] Git repository setup
- [x] GitHub account connected to Railway (recommended)

---

## Part 1: Backend Deployment (Railway)

### Step 1: Prepare Repository Structure

```bash
# Create directory structure
mkdir -p akfu-backend
cd akfu-backend

# Copy these files to the directory:
# - akfu-backend.ts
# - package.json
# - .env.example (create from step 5)
```

### Step 2: Create Railway Project

```bash
# Option A: Via Railway CLI
railway login
railway init
# Select "Create new project"
# Name it "akfu-backend"

# Option B: Via Railway Dashboard
# 1. Go to https://railway.app/dashboard
# 2. Click "New Project"
# 3. Select "Deploy from GitHub" or "Start Blank"
```

### Step 3: Create PostgreSQL Database on Railway

In Railway dashboard:

1. Click your project
2. Click "+ New"
3. Select "Database" → "PostgreSQL"
4. Railway automatically creates `DATABASE_URL` environment variable

**Important:** Copy the PostgreSQL URL for backup:
```
postgresql://user:password@host:port/database
```

### Step 4: Configure Environment Variables on Railway

In Railway dashboard, go to project settings and add these variables:

```env
# Core
PORT=3001
ENVIRONMENT=production
NODE_ENV=production

# Security Keys (CHANGE THESE VALUES!)
TOKEN_SECRET=your-jwt-secret-here-min-32-chars-$(openssl rand -hex 16)
ENCRYPTION_KEY=your-encryption-key-min-32-chars-$(openssl rand -hex 16)
ADMIN_KEY=YourAdminKey2026!$(openssl rand -hex 8)

# Database (Auto-populated by Railway PostgreSQL plugin)
DATABASE_URL=postgresql://... (already set by Railway)

# Optional: Provider API Keys (if using real APIs)
HIGGSFIELD_API_KEY=your-key-here
SUNO_API_KEY=your-key-here
ELEVENLABS_API_KEY=your-key-here
```

### Step 5: Deploy Backend Code

**Option A: GitHub Push (Recommended)**

```bash
# Initialize git repo
git init
git add .
git commit -m "Initial AKFU backend commit"

# Push to GitHub
git remote add origin https://github.com/yourusername/akfu-backend.git
git branch -M main
git push -u origin main

# In Railway dashboard:
# 1. Select "Deploy from GitHub"
# 2. Connect your GitHub account
# 3. Select the akfu-backend repository
# 4. Railway auto-deploys on every push
```

**Option B: Direct Railway CLI**

```bash
# With files in current directory
railway up
```

### Step 6: Verify Backend Deployment

Once deployed, Railway provides a service URL (e.g., `akfu-api.up.railway.app`):

```bash
# Test health endpoint
curl https://akfu-api.up.railway.app/health

# Expected response:
# {"status":"ok","service":"akfu-backend"}
```

### Step 7: Initialize Database with Tables and Provider Configs

Replace `YOUR_ADMIN_KEY` with the value you set in environment variables:

```bash
ADMIN_KEY=YourAdminKey2026!uniquerandom

curl -X POST "https://akfu-api.up.railway.app/admin/setup-db?admin=$ADMIN_KEY" \
  -H "Content-Type: application/json"

# Expected response:
# {"message":"Database initialized successfully","tables_created":18}
```

This creates:
- **13 Phase 1 tables:** users, projects, scripts, characters, wardrobe, generation jobs, agents, etc.
- **5 Provider system tables:** provider configs, user accounts, credits, usage, affiliate signups

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Initialize Next.js Project

```bash
# Create new directory
mkdir akfu-frontend
cd akfu-frontend

# Initialize Next.js
npm create next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --no-git

# Install dependencies
npm install framer-motion zustand axios
npm install --save-dev @types/node
```

### Step 2: Set Up Environment Variables

Create `.env.local`:

```env
# Backend API
NEXT_PUBLIC_API_URL=https://akfu-api.up.railway.app
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_NAME=AKFU Studios

# Optional: Analytics
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
```

Create `.env.example`:

```env
# Copy of .env.local for version control
NEXT_PUBLIC_API_URL=https://akfu-api.up.railway.app
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_APP_NAME=AKFU Studios
```

### Step 3: Create Core Layout and Theme

`app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --akfu-dark: #030303;
  --akfu-card: #15120e;
  --akfu-gold: #ecd29a;
  --akfu-accent: #c9a45c;
  --akfu-text: #f3eee6;
  --akfu-border: rgba(201,164,92,.28);
}

@font-face {
  font-family: 'Cinzel';
  src: url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
}

body {
  @apply bg-[#030303] text-[#f3eee6] font-sans;
}
```

`tailwind.config.ts`:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'akfu': {
          'dark': '#030303',
          'card': '#15120e',
          'gold': '#ecd29a',
          'accent': '#c9a45c',
          'text': '#f3eee6',
          'border': 'rgba(201,164,92,.28)',
        },
      },
      fontFamily: {
        'cinzel': ['Cinzel', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

### Step 4: Create API Client

`lib/api.ts`:

```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Step 5: Create Auth Store

`lib/store/authStore.ts`:

```typescript
import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  name: string;
  director_name?: string;
  studio_name?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,
  setUser: (user) => set({ user, isLoggedIn: true }),
  setToken: (token) => set({ token }),
  logout: () => {
    set({ user: null, token: null, isLoggedIn: false });
    localStorage.removeItem('auth_token');
  },
}));
```

### Step 6: Create Root Layout

`app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AKFU Studios - Your Vision. Your Studio. Your AI Production Crew.',
  description: 'AI-powered film production platform with unified provider management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-akfu-dark text-akfu-text">
        {children}
      </body>
    </html>
  );
}
```

### Step 7: Create Basic Auth Pages

`app/auth/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-akfu-dark flex items-center justify-center">
      <div className="bg-akfu-card border border-akfu-border rounded-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-cinzel text-akfu-gold mb-8">Director Login</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-akfu-accent text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-akfu-border rounded px-3 py-2 text-akfu-text"
              required
            />
          </div>

          <div>
            <label className="block text-akfu-accent text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-akfu-border rounded px-3 py-2 text-akfu-text"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-akfu-gold to-akfu-accent text-akfu-dark font-cinzel py-2 rounded font-semibold disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-akfu-accent">
            New to AKFU?{' '}
            <a href="/auth/register" className="text-akfu-gold hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Step 8: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel deploy --prod

# Or connect GitHub repo for automatic deployments:
# 1. Push code to GitHub
# 2. Go to https://vercel.com/new
# 3. Import your GitHub repository
# 4. Set environment variables (same as .env.local)
# 5. Vercel auto-deploys on every push
```

### Step 9: Configure Vercel Environment Variables

In Vercel dashboard, go to project settings and add:

```
NEXT_PUBLIC_API_URL=https://akfu-api.up.railway.app
NEXT_PUBLIC_ENVIRONMENT=production
```

---

## Part 3: Database Verification

### Verify PostgreSQL Connection

```bash
# Get database URL from Railway dashboard
# Format: postgresql://user:pass@host:port/database

# Test connection (if you have psql installed)
psql "your-database-url"

# List tables
\dt akfu_*

# Check users table
SELECT * FROM akfu_users LIMIT 5;

# Check provider configs
SELECT * FROM akfu_provider_configs;
```

### Verify All Tables Created

After running `/admin/setup-db`, verify these tables exist:

**Phase 1 Core Tables (13):**
- akfu_users
- akfu_projects
- akfu_scripts
- akfu_script_versions
- akfu_characters
- akfu_character_references
- akfu_wardrobe_looks
- akfu_generation_jobs
- akfu_generated_videos
- akfu_agents

**Provider System Tables (5):**
- akfu_provider_configs
- akfu_user_provider_accounts
- akfu_provider_credits
- akfu_provider_usage
- akfu_affiliate_signups

---

## Part 4: Complete Testing Workflow

### Test 1: User Registration

```bash
curl -X POST https://akfu-api.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "director@test.com",
    "password": "TestPassword123!",
    "name": "Test Director",
    "director_name": "Director Test",
    "studio_name": "Test Studios",
    "skill_level": "intermediate",
    "preferred_mode": "express"
  }'

# Response:
# {"user": {...}, "token": "eyJ..."}

# Save token for next requests
TOKEN="<token-from-response>"
```

### Test 2: Login

```bash
curl -X POST https://akfu-api.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "director@test.com",
    "password": "TestPassword123!"
  }'
```

### Test 3: Create Project

```bash
curl -X POST https://akfu-api.up.railway.app/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Film",
    "genre": "Drama",
    "logline": "A story about...",
    "project_type": "short"
  }'
```

### Test 4: Get Provider Dashboard

```bash
curl https://akfu-api.up.railway.app/api/provider-dashboard \
  -H "Authorization: Bearer $TOKEN"

# Response shows:
# - List of available providers (Higgsfield, Suno, ElevenLabs, etc.)
# - Any connected provider accounts
# - Credit balances
# - Affiliate earnings
# - Last sync timestamps
```

### Test 5: Setup Provider Connection (API Key)

```bash
curl -X POST https://akfu-api.up.railway.app/api/providers/higgsfield/complete-auth \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "setup_method": "api_key",
    "api_key": "hf_your_api_key_here"
  }'

# Response:
# {"status":"success","account_id":"..."}
```

### Test 6: Complete Frontend Workflow

1. Open frontend URL (e.g., `https://akfu-studios.vercel.app`)
2. Click "Register"
3. Create account with test credentials
4. Should redirect to dashboard
5. Click "Create New Project"
6. Go to Writers' Room
7. Write a script
8. Go to Casting Studio
9. Create a character
10. Go to Dressing Room
11. Create outfit
12. Go to Soundstage
13. View provider dashboard
14. Connect a provider
15. Verify credit balance
16. Verify affiliate link displayed

---

## Part 5: Production Checklist

### Backend
- [ ] Railway project created
- [ ] PostgreSQL database provisioned
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] Health endpoint responding
- [ ] Database initialized (18 tables created)
- [ ] All provider configs seeded
- [ ] CORS enabled for frontend domain
- [ ] Encryption keys set (TOKEN_SECRET, ENCRYPTION_KEY)
- [ ] Admin key configured

### Frontend
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] API URL points to correct backend
- [ ] Build succeeds without errors
- [ ] Login/Register flow works
- [ ] Protected routes redirect unauthorized users
- [ ] Mobile responsive verified
- [ ] No console errors in production
- [ ] Tailwind CSS theme applied

### Database
- [ ] All 18 tables created
- [ ] Provider configs populated
- [ ] Indexes created
- [ ] Test user can be created
- [ ] Project CRUD operations work
- [ ] Multi-tenant isolation verified
- [ ] Encryption working for credentials

### Security
- [ ] No API keys in frontend code
- [ ] Token validation on protected routes
- [ ] Users can't access other users' projects
- [ ] Credentials encrypted in database
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] SQL injection prevention verified

---

## Troubleshooting

### Backend Won't Start

```
Error: Cannot find module 'hono'
Solution: Ensure package.json dependencies are installed
         bun install
```

### CORS Errors in Frontend

```
Error: Access to XMLHttpRequest blocked by CORS
Solution: Check NEXT_PUBLIC_API_URL is correct
         Verify backend has CORS enabled
         Check deployed frontend domain matches CORS allowlist
```

### Database Connection Failed

```
Error: Connection refused / ECONNREFUSED
Solution: Check DATABASE_URL is correct in Railway
         Verify PostgreSQL database is running
         Check network access rules in Railway settings
```

### Authentication Failing

```
Error: Invalid token
Solution: Verify TOKEN_SECRET matches between frontend and backend
         Check token is being sent in Authorization header
         Verify token hasn't expired (7-day TTL)
```

### Provider Setup Failing

```
Error: Provider not connected
Solution: Ensure provider account is set up first
         Check API key is valid
         Verify credentials are not corrupted
         Try disconnecting and reconnecting
```

---

## Monitoring & Logs

### Railway Logs

```bash
# View live logs
railway logs

# Filter by service
railway logs --service akfu-backend

# Export recent logs
railway logs --tail 100 > logs.txt
```

### Vercel Logs

- View in Vercel dashboard under "Deployments"
- Check "Function Logs" for API calls
- Monitor "Error Log" for issues

### Database Monitoring

```bash
# Connect to PostgreSQL
psql $DATABASE_URL

# Monitor active connections
SELECT datname, usename, count(*) FROM pg_stat_activity 
GROUP BY datname, usename;

# Check table sizes
SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size DESC;
```

---

## Next Steps

### After Phase 1 Deployment

1. **Real Higgsfield Integration**
   - Obtain Higgsfield API key
   - Test with real video generation
   - Implement webhook handling for job completion

2. **Enhanced Provider Support**
   - Add more providers (Runway, CapCut, etc.)
   - Implement provider-specific OAuth flows
   - Create provider-specific UI panels

3. **Monitoring & Analytics**
   - Set up error tracking (Sentry)
   - Add usage analytics
   - Monitor credit usage patterns

4. **Performance Optimization**
   - Add database connection pooling
   - Implement caching for provider data
   - Optimize database queries with indexes

5. **User Experience**
   - Implement provider setup wizard
   - Add real-time credit notifications
   - Create affiliate earnings dashboard

---

## Support & Documentation

- **Architecture:** See AKFU_ARCHITECTURE.md
- **Implementation Plan:** See AKFU_IMPLEMENTATION_PLAN.md
- **Provider System:** See AKFU_UNIFIED_PROVIDER_SYSTEM.md
- **Frontend Structure:** See akfu-frontend-structure.md
- **API Reference:** See backend code comments

---

## Deployment Complete ✅

Your AKFU platform is now live with:

- ✅ Complete authentication system
- ✅ Project management workflow
- ✅ Unified provider dashboard
- ✅ Affiliate link tracking
- ✅ Encrypted credential storage
- ✅ Multi-tenant architecture
- ✅ Production-ready infrastructure

**Access points:**
- Frontend: `https://akfu-studios.vercel.app`
- Backend API: `https://akfu-api.up.railway.app`
- Database: PostgreSQL on Railway

**Next Phase:** Implement the complete Phase 1 frontend components and integrate real provider APIs.
