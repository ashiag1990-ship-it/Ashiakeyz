// ============================================================================
// AKFU BACKEND - ROOMS & STATIONS API ENDPOINTS
// Add these endpoints to the main akfu-backend.ts file
// ============================================================================

// ============================================================================
// ROOM & STATION DATABASE SETUP (Add to setupDatabase function)
// ============================================================================

/*
Add these CREATE TABLE statements to the setupDatabase() function in akfu-backend.ts:

    // Core room definitions (12 total)
    CREATE TABLE IF NOT EXISTS akfu_rooms (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      department TEXT,
      order_index INTEGER,
      exterior_name TEXT,
      design_goal TEXT,
      environment_art_direction TEXT,
      campus_region TEXT,
      focus_point TEXT,
      interior_asset_url TEXT,
      ambient_audio_url TEXT,
      ambient_audio_duration INTEGER,
      entry_sound_url TEXT,
      camera_storyboard TEXT,
      camera_motion_rules TEXT,
      environment_motion_rules TEXT,
      permissions TEXT DEFAULT '[]',
      prerequisite_room_id TEXT,
      transition_type TEXT DEFAULT 'portal',
      transition_duration_ms INTEGER DEFAULT 1250,
      status TEXT DEFAULT 'active',
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (prerequisite_room_id) REFERENCES akfu_rooms(id)
    );

    CREATE TABLE IF NOT EXISTS akfu_stations (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      station_order INTEGER,
      icon_name TEXT,
      icon_url TEXT,
      hotspot_region TEXT,
      background_image_url TEXT,
      station_type TEXT NOT NULL,
      action_route TEXT,
      action_endpoint TEXT,
      loading_message TEXT,
      permissions TEXT DEFAULT '[]',
      prerequisite_station_id TEXT,
      requires_project BOOLEAN DEFAULT true,
      stores_to TEXT,
      success_message TEXT,
      failure_message TEXT,
      status TEXT DEFAULT 'active',
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (room_id) REFERENCES akfu_rooms(id),
      FOREIGN KEY (prerequisite_station_id) REFERENCES akfu_stations(id),
      UNIQUE (room_id, station_order)
    );

    CREATE TABLE IF NOT EXISTS akfu_room_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      visit_count INTEGER DEFAULT 1,
      first_visited_at INTEGER,
      last_visited_at INTEGER,
      time_spent_seconds INTEGER DEFAULT 0,
      completion_status TEXT DEFAULT 'incomplete',
      all_stations_visited BOOLEAN DEFAULT false,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id),
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (room_id) REFERENCES akfu_rooms(id),
      UNIQUE (user_id, project_id, room_id)
    );

    CREATE TABLE IF NOT EXISTS akfu_station_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      station_id TEXT NOT NULL,
      visit_count INTEGER DEFAULT 1,
      first_visited_at INTEGER,
      last_visited_at INTEGER,
      time_spent_seconds INTEGER DEFAULT 0,
      completion_status TEXT DEFAULT 'incomplete',
      station_data TEXT,
      created_project_id TEXT,
      created_script_id TEXT,
      created_character_id TEXT,
      created_wardrobe_id TEXT,
      created_audio_asset_id TEXT,
      error_state TEXT,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES akfu_users(id),
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (room_id) REFERENCES akfu_rooms(id),
      FOREIGN KEY (station_id) REFERENCES akfu_stations(id),
      UNIQUE (user_id, project_id, station_id)
    );

    CREATE TABLE IF NOT EXISTS akfu_audio_assets (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      room_id TEXT,
      station_id TEXT,
      title TEXT,
      description TEXT,
      audio_url TEXT,
      thumbnail_url TEXT,
      audio_type TEXT,
      duration_seconds INTEGER,
      file_size_bytes INTEGER,
      mime_type TEXT,
      generator_type TEXT,
      generation_prompt TEXT,
      generation_job_id TEXT,
      status TEXT DEFAULT 'active',
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
      FOREIGN KEY (user_id) REFERENCES akfu_users(id),
      FOREIGN KEY (room_id) REFERENCES akfu_rooms(id),
      FOREIGN KEY (station_id) REFERENCES akfu_stations(id)
    );

    CREATE INDEX IF NOT EXISTS idx_rooms_slug ON akfu_rooms(slug);
    CREATE INDEX IF NOT EXISTS idx_stations_room ON akfu_stations(room_id);
    CREATE INDEX IF NOT EXISTS idx_room_progress_user_project ON akfu_room_progress(user_id, project_id);
    CREATE INDEX IF NOT EXISTS idx_station_progress_user ON akfu_station_progress(user_id);
    CREATE INDEX IF NOT EXISTS idx_audio_assets_project ON akfu_audio_assets(project_id);
*/

// ============================================================================
// ROOM & STATION API ENDPOINTS (Add these to app in akfu-backend.ts)
// ============================================================================

// ============================================================================
// ROOM ENDPOINTS
// ============================================================================

/**
 * GET /api/rooms
 * List all rooms in the AKFU platform
 */
app.get('/api/rooms', async (c) => {
  try {
    const rooms = db.prepare(`
      SELECT * FROM akfu_rooms
      WHERE status = 'active'
      ORDER BY order_index ASC
    `).all() as any[];

    return c.json({ rooms });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /api/rooms/:roomId
 * Get a specific room with all its stations
 */
app.get('/api/rooms/:roomId', async (c) => {
  try {
    const roomId = c.req.param('roomId');

    const room = db.prepare(`
      SELECT * FROM akfu_rooms WHERE id = ?
    `).get(roomId) as any;

    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    const stations = db.prepare(`
      SELECT * FROM akfu_stations
      WHERE room_id = ?
      ORDER BY station_order ASC
    `).all(roomId) as any[];

    return c.json({
      room,
      stations
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /api/rooms/:roomSlug/by-slug
 * Get a room by its slug identifier
 */
app.get('/api/rooms/:roomSlug/by-slug', async (c) => {
  try {
    const roomSlug = c.req.param('roomSlug');

    const room = db.prepare(`
      SELECT * FROM akfu_rooms WHERE slug = ?
    `).get(roomSlug) as any;

    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    const stations = db.prepare(`
      SELECT * FROM akfu_stations
      WHERE room_id = ?
      ORDER BY station_order ASC
    `).all(room.id) as any[];

    return c.json({
      room,
      stations
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// ROOM PROGRESS ENDPOINTS
// ============================================================================

/**
 * POST /api/room-progress
 * Record that a user visited a room
 */
app.post('/api/room-progress', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json() as any;
  const { project_id, room_id } = body;

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(project_id, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const room = db.prepare(`
      SELECT * FROM akfu_rooms WHERE id = ?
    `).get(room_id) as any;

    if (!room) {
      return c.json({ error: 'Room not found' }, 404);
    }

    const now = Math.floor(Date.now() / 1000);
    const progressId = crypto.randomUUID();

    // Check if progress record exists
    const existing = db.prepare(`
      SELECT * FROM akfu_room_progress
      WHERE user_id = ? AND project_id = ? AND room_id = ?
    `).get(auth.userId, project_id, room_id) as any;

    if (existing) {
      // Update existing record
      db.prepare(`
        UPDATE akfu_room_progress
        SET visit_count = visit_count + 1,
            last_visited_at = ?,
            updated_at = ?
        WHERE id = ?
      `).run(now, now, existing.id);

      return c.json({
        id: existing.id,
        status: 'updated',
        visit_count: existing.visit_count + 1
      });
    } else {
      // Create new progress record
      db.prepare(`
        INSERT INTO akfu_room_progress
        (id, user_id, project_id, room_id, visit_count, first_visited_at, last_visited_at, created_at, updated_at)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
      `).run(progressId, auth.userId, project_id, room_id, now, now, now, now);

      return c.json({
        id: progressId,
        status: 'created',
        visit_count: 1
      }, 201);
    }
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /api/room-progress/:projectId
 * Get all room progress for a project
 */
app.get('/api/room-progress/:projectId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const progress = db.prepare(`
      SELECT * FROM akfu_room_progress
      WHERE user_id = ? AND project_id = ?
      ORDER BY last_visited_at DESC
    `).all(auth.userId, projectId) as any[];

    return c.json({ progress });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// STATION ENDPOINTS
// ============================================================================

/**
 * GET /api/stations/:stationId
 * Get a specific station details
 */
app.get('/api/stations/:stationId', async (c) => {
  try {
    const stationId = c.req.param('stationId');

    const station = db.prepare(`
      SELECT * FROM akfu_stations WHERE id = ?
    `).get(stationId) as any;

    if (!station) {
      return c.json({ error: 'Station not found' }, 404);
    }

    return c.json({ station });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /api/stations/:stationSlug/by-slug/:roomId
 * Get a station by slug within a room
 */
app.get('/api/stations/:stationSlug/by-slug/:roomId', async (c) => {
  try {
    const stationSlug = c.req.param('stationSlug');
    const roomId = c.req.param('roomId');

    const station = db.prepare(`
      SELECT * FROM akfu_stations WHERE slug = ? AND room_id = ?
    `).get(stationSlug, roomId) as any;

    if (!station) {
      return c.json({ error: 'Station not found' }, 404);
    }

    return c.json({ station });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// STATION PROGRESS ENDPOINTS
// ============================================================================

/**
 * POST /api/station-progress
 * Record station visit and optionally save progress data
 */
app.post('/api/station-progress', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json() as any;
  const { project_id, room_id, station_id, station_data, completion_status } = body;

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(project_id, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const now = Math.floor(Date.now() / 1000);
    const progressId = crypto.randomUUID();

    // Check if progress record exists
    const existing = db.prepare(`
      SELECT * FROM akfu_station_progress
      WHERE user_id = ? AND project_id = ? AND station_id = ?
    `).get(auth.userId, project_id, station_id) as any;

    if (existing) {
      // Update existing record
      db.prepare(`
        UPDATE akfu_station_progress
        SET visit_count = visit_count + 1,
            last_visited_at = ?,
            station_data = COALESCE(?, station_data),
            completion_status = COALESCE(?, completion_status),
            updated_at = ?
        WHERE id = ?
      `).run(
        now,
        station_data ? JSON.stringify(station_data) : null,
        completion_status,
        now,
        existing.id
      );

      return c.json({
        id: existing.id,
        status: 'updated',
        visit_count: existing.visit_count + 1,
        completion_status: completion_status || existing.completion_status
      });
    } else {
      // Create new progress record
      db.prepare(`
        INSERT INTO akfu_station_progress
        (id, user_id, project_id, room_id, station_id, visit_count, first_visited_at, last_visited_at, station_data, completion_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)
      `).run(
        progressId,
        auth.userId,
        project_id,
        room_id,
        station_id,
        now,
        now,
        station_data ? JSON.stringify(station_data) : null,
        completion_status || 'incomplete',
        now,
        now
      );

      return c.json({
        id: progressId,
        status: 'created',
        visit_count: 1,
        completion_status: completion_status || 'incomplete'
      }, 201);
    }
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /api/station-progress/:projectId
 * Get all station progress for a project
 */
app.get('/api/station-progress/:projectId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const progress = db.prepare(`
      SELECT * FROM akfu_station_progress
      WHERE user_id = ? AND project_id = ?
      ORDER BY last_visited_at DESC
    `).all(auth.userId, projectId) as any[];

    return c.json({ progress });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

// ============================================================================
// AUDIO ASSETS ENDPOINTS
// ============================================================================

/**
 * POST /api/audio-assets
 * Create a new audio asset
 */
app.post('/api/audio-assets', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json() as any;
  const {
    project_id,
    room_id,
    station_id,
    title,
    description,
    audio_url,
    audio_type,
    duration_seconds,
    generator_type,
    generation_prompt,
    generation_job_id
  } = body;

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(project_id, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const assetId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);

    db.prepare(`
      INSERT INTO akfu_audio_assets
      (id, project_id, user_id, room_id, station_id, title, description, audio_url, audio_type, duration_seconds, generator_type, generation_prompt, generation_job_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      assetId,
      project_id,
      auth.userId,
      room_id || null,
      station_id || null,
      title,
      description,
      audio_url,
      audio_type,
      duration_seconds,
      generator_type,
      generation_prompt,
      generation_job_id,
      now,
      now
    );

    return c.json({
      id: assetId,
      project_id,
      title,
      audio_url,
      created_at: now
    }, 201);
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /api/audio-assets/:projectId
 * List all audio assets for a project
 */
app.get('/api/audio-assets/:projectId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const projectId = c.req.param('projectId');

  try {
    const project = db.prepare(`
      SELECT * FROM akfu_projects WHERE id = ? AND user_id = ?
    `).get(projectId, auth.userId) as any;

    if (!project) {
      return c.json({ error: 'Project not found' }, 404);
    }

    const assets = db.prepare(`
      SELECT * FROM akfu_audio_assets
      WHERE project_id = ? AND status = 'active'
      ORDER BY created_at DESC
    `).all(projectId) as any[];

    return c.json({ assets });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * GET /api/audio-assets/room/:roomId/:projectId
 * List all audio assets created in a specific room for a project
 */
app.get('/api/audio-assets/room/:roomId/:projectId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const roomId = c.req.param('roomId');
  const projectId = c.req.param('projectId');

  try {
    const assets = db.prepare(`
      SELECT * FROM akfu_audio_assets
      WHERE project_id = ? AND user_id = ? AND room_id = ? AND status = 'active'
      ORDER BY created_at DESC
    `).all(projectId, auth.userId, roomId) as any[];

    return c.json({ assets });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

/**
 * PUT /api/audio-assets/:assetId
 * Update audio asset metadata
 */
app.put('/api/audio-assets/:assetId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const auth = authMiddleware(authHeader);
  if (!auth) return c.json({ error: 'Unauthorized' }, 401);

  const assetId = c.req.param('assetId');
  const body = await c.req.json() as any;

  try {
    const asset = db.prepare(`
      SELECT * FROM akfu_audio_assets WHERE id = ? AND user_id = ?
    `).get(assetId, auth.userId) as any;

    if (!asset) {
      return c.json({ error: 'Audio asset not found' }, 404);
    }

    const now = Math.floor(Date.now() / 1000);
    const updateFields = ['title', 'description', 'audio_url', 'duration_seconds', 'status'];

    for (const field of updateFields) {
      if (body[field] !== undefined) {
        db.prepare(`UPDATE akfu_audio_assets SET ${field} = ?, updated_at = ? WHERE id = ?`)
          .run(body[field], now, assetId);
      }
    }

    return c.json({
      id: assetId,
      status: 'updated',
      updated_at: now
    });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});
