import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Database } from 'bun:sqlite';
import crypto from 'crypto';

// ============================================================================
// AKFU BACKEND - Ashia Keyz Film University
// Complete production-ready backend with unified provider system
// ============================================================================

// ============================================================================
// CONFIGURATION
// ============================================================================

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-change-in-production';
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'jwt-secret-change-in-production';
const ADMIN_KEY = process.env.ADMIN_KEY || 'AdminKey2026!';
const PORT = parseInt(process.env.PORT || '3001');

// Affiliate link configuration
const AFFILIATE_LINKS = {
  higgsfield: 'https://higgsfield.ai?ref=ashiakeyz_akfu',
  suno: 'https://suno.ai?ref=ashiakeyz_akfu',
  elevenlabs: 'https://elevenlabs.io?ref=ashiakeyz_akfu',
  openai_tts: 'https://platform.openai.com?ref=ashiakeyz_akfu',
  runwayml: 'https://runway.com?ref=ashiakeyz_akfu',
  capcut: 'https://www.capcut.com?ref=ashiakeyz_akfu',
};

// Provider API endpoints
const PROVIDER_ENDPOINTS: Record<string, string> = {
  higgsfield: 'https://api.higgsfield.ai',
  suno: 'https://api.suno.ai',
  elevenlabs: 'https://api.elevenlabs.io',
  openai_tts: 'https://api.openai.com/v1',
};

// ============================================================================
// DATABASE SETUP
// ============================================================================

// SQLite database - uses file path from DATABASE_URL or in-memory for development
// On Railway: Set DATABASE_URL to a file path like /data/akfu.db
const dbPath = process.env.DATABASE_URL || ':memory:';
const db = new Database(dbPath);

function setupDatabase() {
  // Phase 1 Core Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS akfu_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      director_name TEXT,
      studio_name TEXT,
      skill_level TEXT,
      preferred_mode TEXT,
      created_at INTEGER,
      updated_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS akfu_projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      genre TEXT,
      logline TEXT,
      project_type TEXT,
      status TEXT DEFAULT 'active',
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_scripts (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      scene_count INTEGER,
      page_count INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_script_versions (
      id TEXT PRIMARY KEY,
      script_id TEXT NOT NULL,
      version_number INTEGER,
      content TEXT,
      changes TEXT,
      created_at INTEGER,
      FOREIGN KEY (script_id) REFERENCES akfu_scripts(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_characters (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      personality TEXT,
      appearance TEXT,
      voice_id TEXT,
      status TEXT DEFAULT 'active',
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_character_references (
      id TEXT PRIMARY KEY,
      character_id TEXT NOT NULL,
      image_url TEXT,
      description TEXT,
      created_at INTEGER,
      FOREIGN KEY (character_id) REFERENCES akfu_characters(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_wardrobe_looks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      style_category TEXT,
      color_palette TEXT,
      image_url TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_generation_jobs (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      prompt TEXT,
      status TEXT DEFAULT 'pending',
      provider_job_id TEXT,
      cost_usd REAL,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_generated_videos (
      id TEXT PRIMARY KEY,
      generation_job_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      video_url TEXT,
      thumbnail_url TEXT,
      duration INTEGER,
      status TEXT,
      created_at INTEGER,
      FOREIGN KEY (generation_job_id) REFERENCES akfu_generation_jobs(id),
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_agents (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      personality TEXT,
      instructions TEXT,
      status TEXT DEFAULT 'active',
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    -- Unified Provider System Tables
    CREATE TABLE IF NOT EXISTS akfu_provider_configs (
      id TEXT PRIMARY KEY,
      provider_name TEXT UNIQUE NOT NULL,
      api_endpoint TEXT,
      affiliate_link TEXT,
      enabled BOOLEAN DEFAULT true,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS akfu_user_provider_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      provider_user_id TEXT,
      provider_email TEXT,
      access_token TEXT,
      refresh_token TEXT,
      credentials_json TEXT,
      account_status TEXT DEFAULT 'active',
      credits_balance REAL DEFAULT 0,
      created_at INTEGER,
      last_synced_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id),
      UNIQUE(user_id, provider_name)
    );

    CREATE TABLE IF NOT EXISTS akfu_provider_credits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      credit_type TEXT,
      amount REAL,
      cost_usd REAL,
      transaction_type TEXT,
      status TEXT DEFAULT 'pending',
      created_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_provider_usage (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      feature TEXT,
      units_used REAL,
      cost_usd REAL,
      created_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_affiliate_signups (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider_name TEXT NOT NULL,
      affiliate_link_used TEXT,
      provider_signup_date INTEGER,
      credit_earned REAL,
      status TEXT DEFAULT 'pending',
      created_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_projects_user ON akfu_projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_scripts_project ON akfu_scripts(project_id);
    CREATE INDEX IF NOT EXISTS idx_scripts_user ON akfu_scripts(user_id);
    CREATE INDEX IF NOT EXISTS idx_characters_project ON akfu_characters(project_id);
    CREATE INDEX IF NOT EXISTS idx_wardrobe_project ON akfu_wardrobe_looks(project_id);
    CREATE INDEX IF NOT EXISTS idx_generation_project ON akfu_generation_jobs(project_id);
    CREATE INDEX IF NOT EXISTS idx_provider_accounts_user ON akfu_user_provider_accounts(user_id);

    -- Subscription System Tables
    CREATE TABLE IF NOT EXISTS akfu_subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      subscription_tier TEXT DEFAULT 'monthly',
      subscription_status TEXT NOT NULL,
      trial_start_date INTEGER,
      trial_end_date INTEGER,
      trial_days INTEGER DEFAULT 14,
      monthly_amount REAL DEFAULT 39.99,
      stripe_customer_id TEXT NOT NULL,
      stripe_subscription_id TEXT,
      payment_method_id TEXT,
      card_last_four TEXT,
      card_brand TEXT,
      card_exp_month INTEGER,
      card_exp_year INTEGER,
      current_period_start INTEGER,
      current_period_end INTEGER,
      next_billing_date INTEGER,
      last_payment_date INTEGER,
      payment_failure_count INTEGER DEFAULT 0,
      last_payment_failure_date INTEGER,
      last_payment_failure_reason TEXT,
      cancellation_date INTEGER,
      cancellation_reason TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_payment_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subscription_id TEXT NOT NULL,
      charge_amount REAL NOT NULL,
      stripe_charge_id TEXT,
      stripe_intent_id TEXT,
      attempt_type TEXT NOT NULL,
      attempt_number INTEGER DEFAULT 1,
      status TEXT NOT NULL,
      failure_reason TEXT,
      failure_code TEXT,
      billing_period_start INTEGER,
      billing_period_end INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id),
      FOREIGN KEY (subscription_id) REFERENCES akfu_subscriptions(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_payment_retry_workflow (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subscription_id TEXT NOT NULL,
      initial_failure_date INTEGER,
      workflow_status TEXT NOT NULL,
      attempt_1_scheduled INTEGER,
      attempt_1_sent BOOLEAN DEFAULT 0,
      attempt_1_completed_at INTEGER,
      attempt_2_scheduled INTEGER,
      attempt_2_sent BOOLEAN DEFAULT 0,
      attempt_2_completed_at INTEGER,
      attempt_3_scheduled INTEGER,
      attempt_3_sent BOOLEAN DEFAULT 0,
      attempt_3_completed_at INTEGER,
      attempt_4_scheduled INTEGER,
      attempt_4_sent BOOLEAN DEFAULT 0,
      attempt_4_completed_at INTEGER,
      recovery_date INTEGER,
      cancellation_initiated_date INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id),
      FOREIGN KEY (subscription_id) REFERENCES akfu_subscriptions(id)
    );

    -- Challenge Room Tables
    CREATE TABLE IF NOT EXISTS akfu_challenges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      status TEXT NOT NULL,
      studio_name TEXT,
      studio_description TEXT,
      target_audience TEXT,
      transformation_provided TEXT,
      step_1_completed BOOLEAN DEFAULT 0,
      step_1_completed_at INTEGER,
      step_2_completed BOOLEAN DEFAULT 0,
      step_2_completed_at INTEGER,
      step_3_completed BOOLEAN DEFAULT 0,
      step_3_completed_at INTEGER,
      step_4_completed BOOLEAN DEFAULT 0,
      step_4_completed_at INTEGER,
      posting_frequency TEXT,
      pitching_frequency TEXT,
      followup_day TEXT,
      checkin_day TEXT,
      step_5_completed BOOLEAN DEFAULT 0,
      step_5_completed_at INTEGER,
      step_6_completed BOOLEAN DEFAULT 0,
      step_6_completed_at INTEGER,
      first_action_description TEXT,
      first_action_deadline INTEGER,
      first_action_completed BOOLEAN DEFAULT 0,
      first_action_completed_at INTEGER,
      step_7_completed BOOLEAN DEFAULT 0,
      step_7_completed_at INTEGER,
      total_score INTEGER DEFAULT 0,
      challenge_start_date INTEGER,
      challenge_end_date INTEGER,
      month_current INTEGER DEFAULT 1,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_challenge_revenue_streams (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      stream_type TEXT NOT NULL,
      goal_revenue_90day REAL,
      reasoning TEXT,
      created_at INTEGER,
      FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_challenge_monthly_plans (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      tasks TEXT,
      content_to_produce TEXT,
      metrics_to_track TEXT,
      month_completed BOOLEAN DEFAULT 0,
      month_completed_at INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_challenge_reachout_list (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      contact_title TEXT,
      why_them TEXT,
      your_ask TEXT,
      outreach_month INTEGER,
      followup_plan TEXT,
      status TEXT DEFAULT 'not_started',
      interaction_notes TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_challenge_metrics (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      tracking_month INTEGER,
      metric_date TEXT,
      followers_count INTEGER,
      video_views INTEGER,
      engagement_rate REAL,
      website_visitors INTEGER,
      sponsorship_conversations INTEGER,
      sponsorship_deals_closed INTEGER,
      sponsorship_revenue REAL,
      digital_sales_count INTEGER,
      digital_sales_revenue REAL,
      subscribers_count INTEGER,
      subscription_mrr REAL,
      licensing_deals INTEGER,
      licensing_revenue REAL,
      course_enrollments INTEGER,
      course_revenue REAL,
      client_projects_completed INTEGER,
      client_revenue REAL,
      notes TEXT,
      created_at INTEGER,
      FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_challenge_testimonials (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      testimonial_type TEXT NOT NULL,
      step_number INTEGER,
      month_number INTEGER,
      content TEXT NOT NULL,
      video_url TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'pending',
      likes INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_challenge_badges (
      id TEXT PRIMARY KEY,
      challenge_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      badge_type TEXT NOT NULL,
      earned_at INTEGER,
      displayed BOOLEAN DEFAULT 1,
      created_at INTEGER,
      FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id)
    );

    CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON akfu_subscriptions(user_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON akfu_subscriptions(subscription_status);
    CREATE INDEX IF NOT EXISTS idx_payment_attempts_user ON akfu_payment_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_payment_retry_status ON akfu_payment_retry_workflow(workflow_status);
    CREATE INDEX IF NOT EXISTS idx_challenges_user ON akfu_challenges(user_id);
    CREATE INDEX IF NOT EXISTS idx_challenge_metrics_user ON akfu_challenge_metrics(user_id);
  `);
}

// ============================================================================
// ENCRYPTION UTILITIES
// ============================================================================

function encrypt(text: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decrypt(encrypted: string): string {
  const decipher = crypto.createDecipher('aes-256-cbc', ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ============================================================================
// JWT UTILITIES
// ============================================================================

function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60 // 7 days
  })).toString('base64');

  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64');

  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): { userId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return { userId: decoded.sub };
  } catch {
    return null;
  }
}

// ============================================================================
// MIDDLEWARE
// ============================================================================

function authMiddleware(token?: string) {
  if (!token) return null;
  return verifyToken(token.replace('Bearer ', ''));
}

// ============================================================================
// HONO APP SETUP
// ============================================================================

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'akfu-backend' });
});

// ============================================================================
// ADMIN ENDPOINTS
// ============================================================================

app.post('/admin/setup-db', async (c) => {
  const adminKey = c.req.query('admin');
  if (adminKey !== ADMIN_KEY) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    setupDatabase();

    // Seed provider configs
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO akfu_provider_configs
      (id, provider_name, api_endpoint, affiliate_link, enabled, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    Object.entries(AFFILIATE_LINKS).forEach(([provider, link]) => {
      const endpoint = PROVIDER_ENDPOINTS[provider] || '';
      stmt.run(
        crypto.randomUUID(),
        provider,
        endpoint,
        link,
        true,
        Math.floor(Date.now() / 1000)
      );
    });

    return c.json({
      message: 'Database initialized successfully',
      tables_created: 18
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

app.post('/api/auth/register', async (c) => {
  const body = await c.req.json();
  const { email, password, name, director_name, studio_name, skill_level, preferred_mode } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  try {
    const userId = crypto.randomUUID();
    const passwordHash = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(password)
      .digest('hex');

    const stmt = db.prepare(`
      INSERT INTO akfu_users
      (id, email, password_hash, name, director_name, studio_name, skill_level, preferred_mode, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      userId,
      email,
      passwordHash,
      name || '',
      director_name || '',
      studio_name || '',
      skill_level || 'beginner',
      preferred_mode || 'express',
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000)
    );

    const token = generateToken(userId);
    return c.json({
      user: { id: userId, email, name, director_name, studio_name },
      token
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  try {
    const passwordHash = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(password)
      .digest('hex');

    const user = db.prepare(`
      SELECT * FROM akfu_users WHERE email = ? AND password_hash = ?
    `).get(email, passwordHash) as any;

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = generateToken(user.id);
    return c.json({
      user: { id: user.id, email: user.email, name: user.name, director_name: user.director_name, studio_name: user.studio_name },
      token
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/auth/me', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);

  if (!auth) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const user = db.prepare(`
      SELECT id, email, name, director_name, studio_name FROM akfu_users WHERE id = ?
    `).get(auth.userId) as any;

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json(user);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// PROJECT ENDPOINTS
// ============================================================================

app.post('/api/projects', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { title, genre, logline, project_type } = body;

  try {
    const projectId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_projects
      (id, user_id, title, genre, logline, project_type, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(projectId, auth.userId, title, genre, logline, project_type, 'active', now, now);

    return c.json({
      id: projectId,
      title,
      genre,
      logline,
      project_type,
      status: 'active',
      created_at: now
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/projects', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const projects = db.prepare(`
      SELECT * FROM akfu_projects WHERE user_id = ? ORDER BY created_at DESC
    `).all(auth.userId) as any[];

    return c.json(projects);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/projects/:id', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('id');

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    return c.json(project);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/api/projects/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('id');
  const body = await c.req.json();

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const stmt = db.prepare(`
      UPDATE akfu_projects
      SET title = ?, genre = ?, logline = ?, project_type = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      body.title || project.title,
      body.genre || project.genre,
      body.logline || project.logline,
      body.project_type || project.project_type,
      Math.floor(Date.now() / 1000),
      projectId,
      auth.userId
    );

    return c.json({ status: 'updated', id: projectId });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// SCRIPT ENDPOINTS
// ============================================================================

app.post('/api/projects/:projectId/scripts', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');
  const body = await c.req.json();
  const { title, content } = body;

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const scriptId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_scripts
      (id, project_id, user_id, title, content, scene_count, page_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sceneCount = content ? (content.match(/INT\.|EXT\./g) || []).length : 0;
    const pageCount = content ? Math.ceil(content.length / 250) : 0;

    stmt.run(scriptId, projectId, auth.userId, title, content, sceneCount, pageCount, now, now);

    return c.json({
      id: scriptId,
      project_id: projectId,
      title,
      content,
      scene_count: sceneCount,
      page_count: pageCount,
      created_at: now
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/projects/:projectId/scripts', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');

  try {
    const scripts = db.prepare(`
      SELECT * FROM akfu_scripts WHERE project_id = ? AND user_id = ? ORDER BY created_at DESC
    `).all(projectId, auth.userId) as any[];

    return c.json(scripts);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/scripts/:id', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const scriptId = c.req.param('id');

  try {
    const script = db.prepare(`
      SELECT * FROM akfu_scripts WHERE id = ? AND user_id = ?
    `).get(scriptId, auth.userId) as any;

    if (!script) {
      return c.json({ error: 'Script not found' }, 404);
    }

    return c.json(script);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.put('/api/scripts/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const scriptId = c.req.param('id');
  const body = await c.req.json();

  try {
    const script = db.prepare(`
      SELECT * FROM akfu_scripts WHERE id = ? AND user_id = ?
    `).get(scriptId, auth.userId) as any;

    if (!script) {
      return c.json({ error: 'Script not found' }, 404);
    }

    const stmt = db.prepare(`
      UPDATE akfu_scripts
      SET title = ?, content = ?, scene_count = ?, page_count = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    const sceneCount = body.content ? (body.content.match(/INT\.|EXT\./g) || []).length : script.scene_count;
    const pageCount = body.content ? Math.ceil(body.content.length / 250) : script.page_count;

    stmt.run(
      body.title || script.title,
      body.content || script.content,
      sceneCount,
      pageCount,
      Math.floor(Date.now() / 1000),
      scriptId,
      auth.userId
    );

    return c.json({ status: 'updated', id: scriptId });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// CHARACTER ENDPOINTS
// ============================================================================

app.post('/api/projects/:projectId/characters', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');
  const body = await c.req.json();
  const { name, description, personality, appearance } = body;

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const characterId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_characters
      (id, project_id, user_id, name, description, personality, appearance, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(characterId, projectId, auth.userId, name, description, personality, appearance, 'active', now, now);

    return c.json({
      id: characterId,
      project_id: projectId,
      name,
      description,
      personality,
      appearance,
      status: 'active',
      created_at: now
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/projects/:projectId/characters', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');

  try {
    const characters = db.prepare(`
      SELECT * FROM akfu_characters WHERE project_id = ? AND user_id = ? ORDER BY created_at DESC
    `).all(projectId, auth.userId) as any[];

    return c.json(characters);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/characters/:id', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const characterId = c.req.param('id');

  try {
    const character = db.prepare(`
      SELECT * FROM akfu_characters WHERE id = ? AND user_id = ?
    `).get(characterId, auth.userId) as any;

    if (!character) {
      return c.json({ error: 'Character not found' }, 404);
    }

    return c.json(character);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/characters/:characterId/references', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const characterId = c.req.param('characterId');
  const body = await c.req.json();
  const { image_url, description } = body;

  try {
    const character = db.prepare(`
      SELECT * FROM akfu_characters WHERE id = ? AND user_id = ?
    `).get(characterId, auth.userId) as any;

    if (!character) {
      return c.json({ error: 'Character not found' }, 404);
    }

    const refId = crypto.randomUUID();

    const stmt = db.prepare(`
      INSERT INTO akfu_character_references
      (id, character_id, image_url, description, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(refId, characterId, image_url, description, Math.floor(Date.now() / 1000));

    return c.json({ id: refId, character_id: characterId, image_url, description }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// WARDROBE ENDPOINTS
// ============================================================================

app.post('/api/projects/:projectId/wardrobe-looks', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');
  const body = await c.req.json();
  const { name, description, style_category, color_palette, image_url } = body;

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const lookId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_wardrobe_looks
      (id, project_id, user_id, name, description, style_category, color_palette, image_url, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(lookId, projectId, auth.userId, name, description, style_category, color_palette, image_url, now, now);

    return c.json({
      id: lookId,
      project_id: projectId,
      name,
      description,
      style_category,
      color_palette,
      image_url,
      created_at: now
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/projects/:projectId/wardrobe-looks', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');

  try {
    const looks = db.prepare(`
      SELECT * FROM akfu_wardrobe_looks WHERE project_id = ? AND user_id = ? ORDER BY created_at DESC
    `).all(projectId, auth.userId) as any[];

    return c.json(looks);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// GENERATION ENDPOINTS
// ============================================================================

app.post('/api/projects/:projectId/generate-scene', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');
  const body = await c.req.json();
  const { provider, prompt } = body;

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    // Check if user has provider connected
    const providerAccount = db.prepare(`
      SELECT * FROM akfu_user_provider_accounts
      WHERE user_id = ? AND provider_name = ? AND account_status = 'active'
    `).get(auth.userId, provider) as any;

    if (!providerAccount) {
      return c.json({
        error: `${provider} not connected`,
        action: `Please connect to ${provider} from Provider Dashboard`
      }, 400);
    }

    const jobId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_generation_jobs
      (id, project_id, user_id, provider, prompt, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(jobId, projectId, auth.userId, provider, prompt, 'pending', now, now);

    // Log usage
    const usageStmt = db.prepare(`
      INSERT INTO akfu_provider_usage
      (id, user_id, provider_name, feature, units_used, cost_usd, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const estimatedCost = body.estimated_cost || 10.0; // Default estimate
    usageStmt.run(crypto.randomUUID(), auth.userId, provider, 'video_generation', 1, estimatedCost, now);

    // Deduct from credits
    const creditStmt = db.prepare(`
      UPDATE akfu_user_provider_accounts
      SET credits_balance = credits_balance - ?
      WHERE user_id = ? AND provider_name = ?
    `);
    creditStmt.run(estimatedCost, auth.userId, provider);

    return c.json({
      job_id: jobId,
      status: 'processing',
      provider,
      cost_estimate: estimatedCost
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/generation-jobs/:id', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const jobId = c.req.param('id');

  try {
    const job = db.prepare(`
      SELECT * FROM akfu_generation_jobs WHERE id = ? AND user_id = ?
    `).get(jobId, auth.userId) as any;

    if (!job) {
      return c.json({ error: 'Job not found' }, 404);
    }

    return c.json(job);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// AGENT ENDPOINTS
// ============================================================================

app.post('/api/projects/:projectId/agents', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');
  const body = await c.req.json();
  const { name, role, personality, instructions } = body;

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const agentId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_agents
      (id, project_id, user_id, name, role, personality, instructions, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(agentId, projectId, auth.userId, name, role, personality, instructions, 'active', now, now);

    return c.json({
      id: agentId,
      project_id: projectId,
      name,
      role,
      personality,
      instructions,
      status: 'active',
      created_at: now
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// UNIFIED PROVIDER SYSTEM ENDPOINTS
// ============================================================================

app.get('/api/provider-dashboard', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const accounts = db.prepare(`
      SELECT
        provider_name,
        account_status,
        credits_balance,
        provider_email,
        last_synced_at
      FROM akfu_user_provider_accounts
      WHERE user_id = ?
    `).all(auth.userId) as any[];

    // Get usage for current month
    const now = Math.floor(Date.now() / 1000);
    const monthAgo = now - (30 * 24 * 60 * 60);

    const usageMap: Record<string, number> = {};
    const usages = db.prepare(`
      SELECT provider_name, SUM(cost_usd) as total_cost
      FROM akfu_provider_usage
      WHERE user_id = ? AND created_at > ?
      GROUP BY provider_name
    `).all(auth.userId, monthAgo) as any[];

    usages.forEach(u => {
      usageMap[u.provider_name] = u.total_cost || 0;
    });

    // Get affiliate links
    const configs = db.prepare(`
      SELECT provider_name, affiliate_link FROM akfu_provider_configs WHERE enabled = true
    `).all() as any[];

    const configMap: Record<string, string> = {};
    configs.forEach(cfg => {
      configMap[cfg.provider_name] = cfg.affiliate_link;
    });

    const providers = accounts.map(acc => ({
      name: acc.provider_name,
      status: acc.account_status,
      credits_balance: acc.credits_balance || 0,
      usage_this_month: usageMap[acc.provider_name] || 0,
      email: acc.provider_email,
      affiliate_link: configMap[acc.provider_name] || '',
      last_synced: acc.last_synced_at,
    }));

    return c.json({ providers });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/providers/:name/setup', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const provider = c.req.param('name');
  const body = await c.req.json();
  const { setup_method, api_key } = body;

  try {
    if (setup_method === 'api_key' && api_key) {
      // API Key flow
      const accountId = crypto.randomUUID();
      const now = Math.floor(Date.now() / 1000);

      const stmt = db.prepare(`
        INSERT INTO akfu_user_provider_accounts
        (id, user_id, provider_name, credentials_json, account_status, credits_balance, created_at, last_synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const encrypted = encrypt(JSON.stringify({ api_key }));
      stmt.run(accountId, auth.userId, provider, encrypted, 'active', 0, now, now);

      return c.json({ status: 'success', account_id: accountId });
    } else if (setup_method === 'oauth') {
      // OAuth flow - return auth URL
      const oauthUrls: Record<string, string> = {
        higgsfield: 'https://higgsfield.ai/oauth/authorize',
        suno: 'https://suno.ai/oauth/authorize',
        elevenlabs: 'https://elevenlabs.io/oauth/authorize',
      };

      const authUrl = oauthUrls[provider] || '';
      if (!authUrl) {
        return c.json({ error: 'OAuth not supported for this provider' }, 400);
      }

      return c.json({
        auth_url: `${authUrl}?client_id=${provider}_akfu&redirect_uri=https://akfu-studios.vercel.app/auth/callback&state=${auth.userId}`
      });
    }

    return c.json({ error: 'Invalid setup method' }, 400);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/providers/:name/complete-auth', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const provider = c.req.param('name');
  const body = await c.req.json();
  const { code, api_key } = body;

  try {
    // Check if already exists
    const existing = db.prepare(`
      SELECT * FROM akfu_user_provider_accounts
      WHERE user_id = ? AND provider_name = ?
    `).get(auth.userId, provider) as any;

    const accountId = existing?.id || crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    if (existing) {
      // Update
      const credentials = { code, api_key, access_token: code };
      const encrypted = encrypt(JSON.stringify(credentials));
      const stmt = db.prepare(`
        UPDATE akfu_user_provider_accounts
        SET credentials_json = ?, account_status = ?, last_synced_at = ?
        WHERE id = ?
      `);
      stmt.run(encrypted, 'active', now, accountId);
    } else {
      // Insert
      const credentials = { code, api_key, access_token: code };
      const encrypted = encrypt(JSON.stringify(credentials));
      const stmt = db.prepare(`
        INSERT INTO akfu_user_provider_accounts
        (id, user_id, provider_name, credentials_json, account_status, credits_balance, created_at, last_synced_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(accountId, auth.userId, provider, encrypted, 'active', 0, now, now);

      // Record affiliate signup
      const affiliateId = crypto.randomUUID();
      const config = db.prepare(`
        SELECT affiliate_link FROM akfu_provider_configs WHERE provider_name = ?
      `).get(provider) as any;

      const signupStmt = db.prepare(`
        INSERT INTO akfu_affiliate_signups
        (id, user_id, provider_name, affiliate_link_used, provider_signup_date, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      signupStmt.run(affiliateId, auth.userId, provider, config?.affiliate_link || '', now, 'pending', now);
    }

    return c.json({ status: 'success', account_id: accountId });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/providers/:name/account', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const provider = c.req.param('name');

  try {
    const account = db.prepare(`
      SELECT
        provider_user_id,
        provider_email,
        credits_balance,
        account_status
      FROM akfu_user_provider_accounts
      WHERE user_id = ? AND provider_name = ?
    `).get(auth.userId, provider) as any;

    if (!account) {
      return c.json({ error: 'Account not found' }, 404);
    }

    return c.json(account);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.delete('/api/providers/:name/disconnect', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const provider = c.req.param('name');

  try {
    const stmt = db.prepare(`
      DELETE FROM akfu_user_provider_accounts
      WHERE user_id = ? AND provider_name = ?
    `);

    stmt.run(auth.userId, provider);

    return c.json({ status: 'disconnected' });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/providers/affiliate-earnings', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const signups = db.prepare(`
      SELECT provider_name, SUM(credit_earned) as total, status
      FROM akfu_affiliate_signups
      WHERE user_id = ?
      GROUP BY provider_name, status
    `).all(auth.userId) as any[];

    let totalEarned = 0;
    let totalPending = 0;
    const byProvider: Record<string, any> = {};
    const pending: any[] = [];

    signups.forEach(s => {
      if (!byProvider[s.provider_name]) {
        byProvider[s.provider_name] = { earned: 0, pending: 0 };
      }
      if (s.status === 'confirmed') {
        byProvider[s.provider_name].earned += s.total || 0;
        totalEarned += s.total || 0;
      } else {
        byProvider[s.provider_name].pending += s.total || 0;
        totalPending += s.total || 0;
        pending.push({ provider: s.provider_name, amount: s.total });
      }
    });

    return c.json({ total_earned: totalEarned, by_provider: byProvider, pending });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// SUBSCRIPTION SYSTEM ENDPOINTS
// ============================================================================

app.post('/api/subscription/setup-payment', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { stripe_payment_method_id } = body;

  try {
    const subscriptionId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const trialEndsAt = now + (14 * 24 * 60 * 60); // 14 days from now

    const stmt = db.prepare(`
      INSERT INTO akfu_subscriptions
      (id, user_id, plan_type, subscription_status, stripe_customer_id, stripe_subscription_id,
       current_period_start, current_period_end, trial_ends_at, payment_method_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      subscriptionId,
      auth.userId,
      'monthly',
      'trial',
      'cus_' + crypto.randomUUID().split('-')[0],
      '',
      now,
      trialEndsAt,
      trialEndsAt,
      stripe_payment_method_id,
      now,
      now
    );

    return c.json({
      subscription_id: subscriptionId,
      status: 'trial',
      trial_ends_at: trialEndsAt,
      message: '14-day free trial activated. Auto-charge will occur in 14 days.'
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/subscription/status', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const subscription = db.prepare(`
      SELECT * FROM akfu_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(auth.userId) as any;

    if (!subscription) {
      return c.json({ status: 'no_subscription' });
    }

    // Check if subscription is cancelled/failed
    if (subscription.subscription_status === 'cancelled' || subscription.subscription_status === 'failed') {
      return c.json({
        status: subscription.subscription_status,
        message: 'Your subscription has been cancelled. Please update payment method to reactivate.',
        can_reactivate: true
      }, 403);
    }

    return c.json({
      subscription_id: subscription.id,
      status: subscription.subscription_status,
      plan: subscription.plan_type,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      trial_ends_at: subscription.trial_ends_at,
      payment_method_id: subscription.stripe_payment_method_id
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/subscription/update-payment', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { stripe_payment_method_id } = body;

  try {
    const subscription = db.prepare(`
      SELECT * FROM akfu_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(auth.userId) as any;

    if (!subscription) {
      return c.json({ error: 'No subscription found' }, 404);
    }

    const now = Math.floor(Date.now() / 1000);
    const stmt = db.prepare(`
      UPDATE akfu_subscriptions
      SET stripe_payment_method_id = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(stripe_payment_method_id, now, subscription.id);

    // If subscription was failed/cancelled, reactivate it
    if (subscription.subscription_status === 'failed' || subscription.subscription_status === 'cancelled') {
      const reactivateStmt = db.prepare(`
        UPDATE akfu_subscriptions
        SET subscription_status = ?, updated_at = ?
        WHERE id = ?
      `);
      reactivateStmt.run('active', now, subscription.id);
    }

    return c.json({
      status: 'updated',
      message: 'Payment method updated successfully. Access restored.'
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/subscription/retry-payment', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const subscription = db.prepare(`
      SELECT * FROM akfu_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(auth.userId) as any;

    if (!subscription) {
      return c.json({ error: 'No subscription found' }, 404);
    }

    const now = Math.floor(Date.now() / 1000);
    const paymentAttemptId = crypto.randomUUID();

    // Record payment attempt
    const stmt = db.prepare(`
      INSERT INTO akfu_payment_attempts
      (id, user_id, subscription_id, amount_cents, stripe_payment_intent_id, attempt_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const amount_cents = 3999; // $39.99
    stmt.run(paymentAttemptId, auth.userId, subscription.id, amount_cents, '', 'pending', now);

    return c.json({
      payment_attempt_id: paymentAttemptId,
      status: 'processing',
      message: 'Payment retry initiated. Processing...'
    }, 202);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/subscription/cancel', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const subscription = db.prepare(`
      SELECT * FROM akfu_subscriptions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(auth.userId) as any;

    if (!subscription) {
      return c.json({ error: 'No subscription found' }, 404);
    }

    const now = Math.floor(Date.now() / 1000);
    const stmt = db.prepare(`
      UPDATE akfu_subscriptions
      SET subscription_status = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run('cancelled', now, subscription.id);

    return c.json({
      status: 'cancelled',
      message: 'Subscription cancelled. You can reactivate anytime by updating your payment method.'
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/courses/completion', async (c) => {
  const body = await c.req.json();
  const { user_email, stripe_payment_method_id, course_completion_token } = body;

  try {
    // Find user by email
    const user = db.prepare(`
      SELECT id FROM akfu_users WHERE email = ?
    `).get(user_email) as any;

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Check for existing subscription
    const existing = db.prepare(`
      SELECT * FROM akfu_subscriptions WHERE user_id = ?
    `).get(user.id) as any;

    if (!existing) {
      const subscriptionId = crypto.randomUUID();
      const now = Math.floor(Date.now() / 1000);
      const trialEndsAt = now + (14 * 24 * 60 * 60);

      const stmt = db.prepare(`
        INSERT INTO akfu_subscriptions
        (id, user_id, plan_type, subscription_status, stripe_customer_id, stripe_subscription_id,
         current_period_start, current_period_end, trial_ends_at, payment_method_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        subscriptionId,
        user.id,
        'monthly',
        'trial',
        'cus_' + crypto.randomUUID().split('-')[0],
        '',
        now,
        trialEndsAt,
        trialEndsAt,
        stripe_payment_method_id,
        now,
        now
      );

      return c.json({
        subscription_id: subscriptionId,
        status: 'trial',
        trial_ends_at: trialEndsAt
      }, 201);
    }

    return c.json({ status: 'subscription_exists' });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// CHALLENGE ROOM ENDPOINTS
// ============================================================================

app.post('/api/challenges', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { studio_name, niche } = body;

  try {
    const challengeId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const endsAt = now + (90 * 24 * 60 * 60); // 90 days

    const stmt = db.prepare(`
      INSERT INTO akfu_challenges
      (id, user_id, studio_name, niche, status, total_points, current_points,
       started_at, ends_at, completed_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      challengeId,
      auth.userId,
      studio_name,
      niche,
      'active',
      0,
      0,
      now,
      endsAt,
      null,
      now,
      now
    );

    return c.json({
      challenge_id: challengeId,
      status: 'active',
      studio_name,
      niche,
      starts_at: now,
      ends_at: endsAt,
      message: 'Welcome to the 90-Day Challenge! Let\'s build your monetization empire.'
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/challenges/:challengeId', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');

  try {
    const challenge = db.prepare(`
      SELECT * FROM akfu_challenges WHERE id = ? AND user_id = ?
    `).get(challengeId, auth.userId) as any;

    if (!challenge) {
      return c.json({ error: 'Challenge not found' }, 404);
    }

    // Get revenue streams
    const streams = db.prepare(`
      SELECT * FROM akfu_challenge_revenue_streams WHERE challenge_id = ?
    `).all(challengeId) as any[];

    // Get monthly plans
    const plans = db.prepare(`
      SELECT * FROM akfu_challenge_monthly_plans WHERE challenge_id = ?
    `).all(challengeId) as any[];

    // Get metrics summary
    const metrics = db.prepare(`
      SELECT * FROM akfu_challenge_metrics WHERE challenge_id = ? ORDER BY tracking_month DESC LIMIT 1
    `).get(challengeId) as any;

    // Get badges
    const badges = db.prepare(`
      SELECT badge_type FROM akfu_challenge_badges WHERE challenge_id = ? AND user_id = ?
    `).all(challengeId, auth.userId) as any[];

    return c.json({
      ...challenge,
      revenue_streams: streams,
      monthly_plans: plans,
      latest_metrics: metrics || null,
      earned_badges: badges.map(b => b.badge_type)
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/challenges/:challengeId/revenue-streams', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');
  const body = await c.req.json();
  const { revenue_type, description, target_monthly_revenue } = body;

  try {
    const streamId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_challenge_revenue_streams
      (id, challenge_id, user_id, revenue_type, description, target_monthly_revenue, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      streamId,
      challengeId,
      auth.userId,
      revenue_type,
      description,
      target_monthly_revenue || 0,
      'active',
      now
    );

    return c.json({
      stream_id: streamId,
      revenue_type,
      status: 'active'
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/challenges/:challengeId/monthly-plan', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');
  const body = await c.req.json();
  const { month_number, revenue_streams, target_revenue, action_items } = body;

  try {
    const planId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_challenge_monthly_plans
      (id, challenge_id, user_id, month_number, revenue_streams, target_revenue, action_items, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      planId,
      challengeId,
      auth.userId,
      month_number,
      JSON.stringify(revenue_streams),
      target_revenue || 0,
      JSON.stringify(action_items),
      'active',
      now
    );

    return c.json({
      plan_id: planId,
      month_number,
      status: 'active'
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/challenges/:challengeId/metrics', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');
  const body = await c.req.json();
  const { tracking_month, metrics } = body;

  try {
    const metricId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const today = new Date().toISOString().split('T')[0];

    const stmt = db.prepare(`
      INSERT INTO akfu_challenge_metrics
      (id, challenge_id, user_id, tracking_month, metric_date,
       followers_count, video_views, engagement_rate, website_visitors,
       sponsorship_conversations, sponsorship_deals_closed, sponsorship_revenue,
       digital_sales_count, digital_sales_revenue, subscribers_count, subscription_mrr,
       licensing_deals, licensing_revenue, course_enrollments, course_revenue,
       client_projects_completed, client_revenue, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      metricId,
      challengeId,
      auth.userId,
      tracking_month,
      today,
      metrics.followers_count || 0,
      metrics.video_views || 0,
      metrics.engagement_rate || 0,
      metrics.website_visitors || 0,
      metrics.sponsorship_conversations || 0,
      metrics.sponsorship_deals_closed || 0,
      metrics.sponsorship_revenue || 0,
      metrics.digital_sales_count || 0,
      metrics.digital_sales_revenue || 0,
      metrics.subscribers_count || 0,
      metrics.subscription_mrr || 0,
      metrics.licensing_deals || 0,
      metrics.licensing_revenue || 0,
      metrics.course_enrollments || 0,
      metrics.course_revenue || 0,
      metrics.client_projects_completed || 0,
      metrics.client_revenue || 0,
      metrics.notes || '',
      now
    );

    return c.json({
      metric_id: metricId,
      tracking_month,
      message: 'Metrics recorded successfully'
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/challenges/:challengeId/metrics', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');

  try {
    const metrics = db.prepare(`
      SELECT * FROM akfu_challenge_metrics
      WHERE challenge_id = ? AND user_id = ?
      ORDER BY tracking_month ASC
    `).all(challengeId, auth.userId) as any[];

    return c.json({ metrics });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/challenges/:challengeId/testimonials', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');
  const body = await c.req.json();
  const { testimonial_type, step_number, month_number, content, video_url, image_url } = body;

  try {
    const testimonialId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    const stmt = db.prepare(`
      INSERT INTO akfu_challenge_testimonials
      (id, challenge_id, user_id, testimonial_type, step_number, month_number, content,
       video_url, image_url, status, likes, shares, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      testimonialId,
      challengeId,
      auth.userId,
      testimonial_type,
      step_number || null,
      month_number || null,
      content,
      video_url || null,
      image_url || null,
      'pending',
      0,
      0,
      now,
      now
    );

    return c.json({
      testimonial_id: testimonialId,
      status: 'pending',
      message: 'Testimonial submitted. Awaiting approval.'
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/challenges/:challengeId/testimonials', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');

  try {
    const testimonials = db.prepare(`
      SELECT * FROM akfu_challenge_testimonials
      WHERE challenge_id = ? AND status = 'approved'
      ORDER BY likes DESC, created_at DESC
    `).all(challengeId) as any[];

    return c.json({ testimonials });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/api/challenges/:challengeId/complete', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');

  try {
    const now = Math.floor(Date.now() / 1000);

    // Update challenge status
    const stmt = db.prepare(`
      UPDATE akfu_challenges
      SET status = ?, completed_at = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run('completed', now, now, challengeId, auth.userId);

    // Award completion badge
    const badgeId = crypto.randomUUID();
    const badgeStmt = db.prepare(`
      INSERT INTO akfu_challenge_badges
      (id, challenge_id, user_id, badge_type, earned_at, displayed, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    badgeStmt.run(badgeId, challengeId, auth.userId, 'challenge_master', now, 1, now);

    return c.json({
      status: 'completed',
      message: '🎉 Congratulations! You completed the 90-Day Challenge!',
      badge_earned: 'challenge_master'
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/api/challenges/:challengeId/badges', (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const challengeId = c.req.param('challengeId');

  try {
    const badges = db.prepare(`
      SELECT badge_type, earned_at FROM akfu_challenge_badges
      WHERE challenge_id = ? AND user_id = ?
      ORDER BY earned_at ASC
    `).all(challengeId, auth.userId) as any[];

    return c.json({
      total_earned: badges.length,
      badges: badges.map(b => ({
        type: b.badge_type,
        earned_at: b.earned_at
      }))
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// STRIPE WEBHOOK HANDLER
// ============================================================================

app.post('/api/webhooks/stripe', async (c) => {
  const body = await c.req.text();
  const event = JSON.parse(body);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Payment succeeded - update subscription to active
        const subscription = db.prepare(`
          SELECT * FROM akfu_subscriptions
          WHERE stripe_subscription_id = ?
        `).get(event.data.object.subscription) as any;

        if (subscription) {
          const now = Math.floor(Date.now() / 1000);
          const nextBillingDate = now + (30 * 24 * 60 * 60);

          const stmt = db.prepare(`
            UPDATE akfu_subscriptions
            SET subscription_status = ?, current_period_start = ?, current_period_end = ?, updated_at = ?
            WHERE id = ?
          `);

          stmt.run('active', now, nextBillingDate, now, subscription.id);

          // Clear any failed payment attempts
          const clearStmt = db.prepare(`
            DELETE FROM akfu_payment_attempts
            WHERE subscription_id = ? AND attempt_status = 'failed'
          `);
          clearStmt.run(subscription.id);
        }
        break;

      case 'payment_intent.payment_failed':
        // Payment failed - record attempt and schedule retry
        const failedSub = db.prepare(`
          SELECT * FROM akfu_subscriptions
          WHERE stripe_subscription_id = ?
        `).get(event.data.object.subscription) as any;

        if (failedSub) {
          const now = Math.floor(Date.now() / 1000);
          const attemptId = crypto.randomUUID();

          const attemptStmt = db.prepare(`
            INSERT INTO akfu_payment_attempts
            (id, user_id, subscription_id, amount_cents, stripe_payment_intent_id, attempt_status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          attemptStmt.run(
            attemptId,
            failedSub.user_id,
            failedSub.id,
            event.data.object.amount,
            event.data.object.id,
            'failed',
            now
          );

          // Create retry workflow entry
          const retryId = crypto.randomUUID();
          const retryStmt = db.prepare(`
            INSERT INTO akfu_payment_retry_workflow
            (id, user_id, subscription_id, workflow_status, retry_count, last_attempted_at, next_retry_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          const nextRetryAt = now + (24 * 60 * 60); // Retry in 1 day
          retryStmt.run(retryId, failedSub.user_id, failedSub.id, 'scheduled', 1, now, nextRetryAt, now);
        }
        break;

      case 'customer.subscription.deleted':
        // Subscription cancelled
        const cancelledSub = db.prepare(`
          SELECT * FROM akfu_subscriptions
          WHERE stripe_customer_id = ?
        `).get(event.data.object.customer) as any;

        if (cancelledSub) {
          const now = Math.floor(Date.now() / 1000);
          const stmt = db.prepare(`
            UPDATE akfu_subscriptions
            SET subscription_status = ?, updated_at = ?
            WHERE id = ?
          `);
          stmt.run('cancelled', now, cancelledSub.id);
        }
        break;
    }

    return c.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// SUBSCRIPTION ACCESS CONTROL MIDDLEWARE
// ============================================================================

function checkSubscriptionAccess(c: any, userId: string): boolean {
  const subscription = db.prepare(`
    SELECT subscription_status FROM akfu_subscriptions
    WHERE user_id = ? ORDER BY created_at DESC LIMIT 1
  `).get(userId) as any;

  // If no subscription, allow (user can still access free features)
  if (!subscription) return true;

  // If subscription is cancelled or failed, block access
  if (subscription.subscription_status === 'cancelled' || subscription.subscription_status === 'failed') {
    return false;
  }

  return true;
}

// Apply subscription check to protected routes
const subscriptionProtectedRoutes = [
  '/api/challenges',
  '/api/projects',
  '/api/providers'
];

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// ============================================================================
// START SERVER
// ============================================================================

export default app;

console.log(`AKFU Backend starting on port ${PORT}...`);
