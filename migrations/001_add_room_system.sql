-- ============================================================================
-- AKFU ROOM & STATION SYSTEM TABLES
-- Migration: Add support for 12 rooms × 6 stations per room
-- ============================================================================

-- Core room definitions (12 total)
CREATE TABLE IF NOT EXISTS akfu_rooms (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT,
  order_index INTEGER,

  -- Visual/UX configuration
  exterior_name TEXT,
  design_goal TEXT,
  environment_art_direction TEXT,
  campus_region TEXT,
  focus_point TEXT,
  interior_asset_url TEXT,

  -- Audio configuration
  ambient_audio_url TEXT,
  ambient_audio_duration INTEGER,
  entry_sound_url TEXT,

  -- Camera storyboard (comma-separated or JSON)
  camera_storyboard TEXT,
  camera_motion_rules TEXT,
  environment_motion_rules TEXT,

  -- Navigation
  permissions TEXT DEFAULT '[]',
  prerequisite_room_id TEXT,
  transition_type TEXT DEFAULT 'portal',
  transition_duration_ms INTEGER DEFAULT 1250,

  -- Status
  status TEXT DEFAULT 'active',
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (prerequisite_room_id) REFERENCES akfu_rooms(id)
);

-- Station definitions (6 per room)
CREATE TABLE IF NOT EXISTS akfu_stations (
  id TEXT PRIMARY KEY,
  room_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  station_order INTEGER,

  -- Visual representation
  icon_name TEXT,
  icon_url TEXT,
  hotspot_region TEXT,
  background_image_url TEXT,

  -- Station type & behavior
  station_type TEXT NOT NULL, -- 'form', 'editor', 'gallery', 'generator', 'library', 'dashboard'
  action_route TEXT,
  action_endpoint TEXT,
  loading_message TEXT,

  -- Permissions & dependencies
  permissions TEXT DEFAULT '[]',
  prerequisite_station_id TEXT,
  requires_project BOOLEAN DEFAULT true,

  -- Output handling
  stores_to TEXT, -- 'projects', 'scripts', 'characters', 'wardrobe', 'audio_assets'
  success_message TEXT,
  failure_message TEXT,

  -- Status
  status TEXT DEFAULT 'active',
  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (room_id) REFERENCES akfu_rooms(id),
  FOREIGN KEY (prerequisite_station_id) REFERENCES akfu_stations(id),
  UNIQUE (room_id, station_order)
);

-- User progress per room (visited, time spent, completion status)
CREATE TABLE IF NOT EXISTS akfu_room_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  room_id TEXT NOT NULL,

  visit_count INTEGER DEFAULT 1,
  first_visited_at INTEGER,
  last_visited_at INTEGER,
  time_spent_seconds INTEGER DEFAULT 0,

  completion_status TEXT DEFAULT 'incomplete', -- 'incomplete', 'in_progress', 'completed'
  all_stations_visited BOOLEAN DEFAULT false,

  created_at INTEGER,
  updated_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES akfu_users(id),
  FOREIGN KEY (project_id) REFERENCES akfu_projects(id),
  FOREIGN KEY (room_id) REFERENCES akfu_rooms(id),
  UNIQUE (user_id, project_id, room_id)
);

-- User progress per station
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

  completion_status TEXT DEFAULT 'incomplete', -- 'incomplete', 'in_progress', 'completed'

  -- Station-specific data (stored as JSON since each station type differs)
  station_data TEXT, -- JSON blob with results

  -- Reference to what was created
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

-- Audio assets created in Sound Lab and other rooms
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

  audio_type TEXT, -- 'ambience', 'song', 'sfx', 'dialogue', 'voiceover'
  duration_seconds INTEGER,
  file_size_bytes INTEGER,
  mime_type TEXT,

  -- Generation metadata
  generator_type TEXT, -- 'suno', 'elevenlabs', 'openai_tts', 'custom_upload'
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON akfu_rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON akfu_rooms(status);
CREATE INDEX IF NOT EXISTS idx_stations_room ON akfu_stations(room_id);
CREATE INDEX IF NOT EXISTS idx_stations_slug ON akfu_stations(slug);
CREATE INDEX IF NOT EXISTS idx_room_progress_user_project ON akfu_room_progress(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_station_progress_user_project ON akfu_station_progress(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_audio_assets_project ON akfu_audio_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_audio_assets_room ON akfu_audio_assets(room_id);
