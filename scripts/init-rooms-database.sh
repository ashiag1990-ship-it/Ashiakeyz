#!/bin/bash

# ============================================================================
# AKFU Room & Station Database Initialization
# Initializes tables and seeds 12 rooms × 6 stations
# ============================================================================

set -e  # Exit on error

# Configuration
DATABASE_URL="${DATABASE_URL:-/data/akfu.db}"
BACKUP_DIR="${BACKUP_DIR:-/data/backups}"

echo "🎬 AKFU Room System Database Initialization"
echo "=========================================="
echo "Database: $DATABASE_URL"
echo "Timestamp: $(date)"
echo ""

# Step 1: Create backup
echo "Step 1: Creating backup..."
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/akfu-backup-$(date +%Y%m%d-%H%M%S).db"
if [ -f "$DATABASE_URL" ]; then
  cp "$DATABASE_URL" "$BACKUP_FILE"
  echo "✅ Backup created: $BACKUP_FILE"
else
  echo "ℹ️  No existing database, will create new"
fi

# Step 2: Create tables
echo ""
echo "Step 2: Creating room system tables..."

sqlite3 "$DATABASE_URL" << 'EOF'
-- Core room definitions (12 total)
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

-- Station definitions (6 per room)
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

-- User progress per room
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

-- Audio assets
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON akfu_rooms(slug);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON akfu_rooms(status);
CREATE INDEX IF NOT EXISTS idx_stations_room ON akfu_stations(room_id);
CREATE INDEX IF NOT EXISTS idx_stations_slug ON akfu_stations(slug);
CREATE INDEX IF NOT EXISTS idx_room_progress_user_project ON akfu_room_progress(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_station_progress_user_project ON akfu_station_progress(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_audio_assets_project ON akfu_audio_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_audio_assets_room ON akfu_audio_assets(room_id);
EOF

echo "✅ Tables created"

# Step 3: Seed data
echo ""
echo "Step 3: Seeding 12 rooms and 72 stations..."

sqlite3 "$DATABASE_URL" << 'EOF'
INSERT OR IGNORE INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, environment_motion_rules, transition_type, transition_duration_ms, status, created_at) VALUES
('room_01', 'welcome-hub', 'Welcome Hub', 'The portal into your filmmaking universe', 'Direction', 1, 'WELCOME HUB / DIRECTOR PLAZA', 'The portal into your filmmaking universe', 'Double-height black marble atrium; Floating gold AK insignia and fountain; Portal arches for major departments', '/audio/sfx/entry-chime.wav', '/audio/ambience/lobby-hvac.wav', 'Gold reel turns very slowly; Portal rings reveal with light sweep; Kiosk displays idle with soft parallax; Optional director avatar arrives naturally', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_02', 'academy', 'The Academy', 'A living university library of real film lessons', 'Learning', 2, 'LEARN / MASTER / GROW', 'A living university library of real film lessons', 'Grand dome hall with learning portals; Holographic course shelves and lecture screen; Quiet progress gallery and certificate desk', '/audio/sfx/academic-motif.wav', '/audio/ambience/library-air.wav', 'Floating light-text rotates softly; Course tiles glide into focus; Progress ribbon fills only on completion; Seated NPC learners turn pages subtly', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_03', 'writers-room', 'Writers'' Room', 'Script pages become the first playable scenes', 'Writing', 3, 'DEVELOP / WRITE / PLAN', 'Script pages become the first playable scenes', 'Writing desks with reactive digital paper; Story wall with connected scene cards; Screenplay editor projected on glass', '/audio/sfx/page-flutter.wav', '/audio/ambience/room-tone.wav', 'Script pages flip on explicit actions; Scene cards reorganize smoothly; Text insertion caret and autosave state; Optional writing assistant avatar gestures', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_04', 'casting-studio', 'Casting Studio', 'A cinematic portrait studio for consistent characters', 'Casting', 4, 'DISCOVER / CAST / COLLABORATE', 'A cinematic portrait studio for consistent characters', 'Curved casting wall full of portrait frames; Rotating center character presentation dais; Floating identity and voice panels', '/audio/sfx/camera-shutter.wav', '/audio/ambience/studio-hvac.wav', 'Portrait frames glow on selection; Display stand slowly turns (not character); Facial sheets crossfade during preview; Talent agent gives subtle nod', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_05', 'dressing-room', 'The Dressing Room', 'Dress each cast member for each individual scene', 'Wardrobe', 5, 'STYLE / WARDROBE / TRANSFORM', 'Dress each cast member for each individual scene', 'Gold-framed full-length mirrors; Sliding designer rails and accessory vitrines; Virtual fitting stage with character photo', '/audio/sfx/fabric-swish.wav', '/audio/ambience/boutique-air.wav', 'Mirror reflections update on look selection; Rail slides reveal new items smoothly; Virtual fitting stage shows character in outfit; Accessory sparkle on hover', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_06', 'sound-lab', 'Sound Lab', 'Compose, generate, and craft immersive audio experiences', 'Audio', 6, 'COMPOSE / GENERATE / CRAFT', 'Compose, generate, and craft immersive audio experiences', 'High-tech mixing consoles with responsive knobs; Holographic waveform displays; Floating sound material library with genre shelves; Soundproof booth with vocal recording interface', '/audio/sfx/audio-rise.wav', '/audio/ambience/studio-tone.wav', 'Waveforms pulse to music; Mixing console knobs respond to input; Sound material library scrolls smoothly; Recording indicator pulses on record', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_07', 'soundstage', 'Soundstage', 'Shoot and stage your scenes with real characters and props', 'Production', 7, 'SHOOT / STAGE / PERFORM', 'Shoot and stage your scenes with real characters and props', 'Grand studio with cyclorama; Lighting grid overhead; Camera on jib arm; Craft services table; Director monitor station', '/audio/sfx/slate-clap.wav', '/audio/ambience/stage-air.wav', 'Camera pans subtly; Lighting rigs glow on hover; Reflective surfaces show characters; Activity boards update in real-time', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_08', 'editing-bay', 'Editing Bay', 'Cut, pace, and color your film into final form', 'Post-Production', 8, 'CUT / PACE / COLOR', 'Cut, pace, and color your film into final form', 'Post-production suite with dual color displays; Multi-camera timeline; Color grading node interface; Render farm visualization', '/audio/sfx/edit-snap.wav', '/audio/ambience/suite-air.wav', 'Timeline scrubber moves smoothly; Color wheels spin on adjustment; Render progress fills quietly; Waveforms scroll with playback', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_09', 'command-center', 'AI Agents Command Center', 'Direct AI assistance across every department', 'Direction', 9, 'COMMAND / DELEGATE / AUTOMATE', 'Direct AI assistance across every department', 'Mission control aesthetic with holographic assistant roster; Multi-window monitoring; Task queue visualization; Real-time stat dashboard', '/audio/sfx/alert-chime.wav', '/audio/ambience/tech-hum.wav', 'Console screens flicker with data; Agent avatars pulse with activity; Status lights blink in rhythm; Queue items slide into place', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_10', 'premiere-hall', 'Premiere Hall', 'Screen your finished film for cast, crew, and world', 'Release', 10, 'PREMIERE / PREMIERE / CELEBRATE', 'Screen your finished film for cast, crew, and world', 'Grand cinema theatre with plush seats; Gold-trimmed screen; Spotlight illuminating curtain; Awards display; Champagne bar detail', '/audio/sfx/curtain-rise.wav', '/audio/ambience/theatre-air.wav', 'Curtain rises dramatically; Stage lights swing into place; Audience seats glow softly; Spotlight follows attention', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_11', 'publishing-dock', 'Publishing Dock', 'Ship your film to festivals, platforms, and the world', 'Release', 11, 'PUBLISH / SHARE / CELEBRATE', 'Ship your film to festivals, platforms, and the world', 'Futuristic publishing terminal with network globe; Social feed walls; Festival badge registry; Platform availability board', '/audio/sfx/launch-beep.wav', '/audio/ambience/broadcast-room.wav', 'Network globe spins slowly; Feed walls scroll with updates; Platform icons light up; Launch sequences activate on completion', 'portal', 1250, 'active', strftime('%s', 'now')),
('room_12', 'archive', 'Archive & Legacy', 'Preserve and catalog your body of work', 'Management', 12, 'PRESERVE / CATALOG / CELEBRATE', 'Preserve and catalog your body of work', 'Grand film archive with projected gallery walls; Time-locked vault doors; Family tree visualization of connected works; Legacy statue centerpiece', '/audio/sfx/archive-open.wav', '/audio/ambience/vault-echo.wav', 'Vault doors slide open with gravity; Gallery walls project lazily; Family tree branches grow and connect; Time indicators tick forward', 'portal', 1250, 'active', strftime('%s', 'now'));

-- Room 01: Welcome Hub - Stations
INSERT OR IGNORE INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, success_message, failure_message, status, created_at) VALUES
('station_01_01', 'room_01', 'new-film', 'NEW FILM', 'Project creation form. Create a new film project.', 1, 'film-reel', '/stations/new-project', 'form', 'Creating new film...', 'projects', 'Project created successfully', 'Could not create project', 'active', strftime('%s', 'now')),
('station_01_02', 'room_01', 'my-productions', 'MY PRODUCTIONS', 'Saved project library. Browse your film projects.', 2, 'film-library', '/stations/projects', 'library', 'Loading projects...', 'projects', null, 'Could not load projects', 'active', strftime('%s', 'now')),
('station_01_03', 'room_01', 'my-crew', 'MY CREW', 'Saved AI agents. Manage studio team.', 3, 'users', '/stations/agents', 'dashboard', 'Loading crew...', null, null, 'Could not load crew', 'active', strftime('%s', 'now')),
('station_01_04', 'room_01', 'room-directory', 'ROOM DIRECTORY', 'Teleport to any department. Navigate the university.', 4, 'map', '/stations/navigation', 'gallery', 'Loading navigation...', null, null, 'Could not load navigation', 'active', strftime('%s', 'now')),
('station_01_05', 'room_01', 'continue', 'CONTINUE', 'Resume active production. Jump back in.', 5, 'play', '/stations/resume', 'dashboard', 'Loading active project...', null, 'Project resumed', 'No active project', 'active', strftime('%s', 'now')),
('station_01_06', 'room_01', 'director-assistant', 'DIRECTOR ASSISTANT', 'Context-aware studio guide. Get help anytime.', 6, 'help-circle', '/stations/assistant', 'generator', 'Loading assistant...', null, null, 'Assistant unavailable', 'active', strftime('%s', 'now'));

-- Room 06: Sound Lab - Stations (PHASE 1 FOCUS)
INSERT OR IGNORE INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, success_message, failure_message, status, created_at) VALUES
('station_06_01', 'room_06', 'write-song', 'WRITE SONG', 'Compose original music. Create a new song with Suno AI.', 1, 'music', '/stations/write-song', 'generator', 'Generating music...', 'audio_assets', 'Song created successfully', 'Song generation failed', 'active', strftime('%s', 'now')),
('station_06_02', 'room_06', 'sound-library', 'SOUND LIBRARY', 'Browse generated audio. Find and reuse sounds.', 2, 'library', '/stations/sound-library', 'gallery', 'Loading library...', null, null, 'Could not load library', 'active', strftime('%s', 'now')),
('station_06_03', 'room_06', 'record-voiceover', 'RECORD VOICEOVER', 'Narrate your story. Record dialogue and narration with ElevenLabs.', 3, 'mic', '/stations/record-voiceover', 'generator', 'Preparing recording...', 'audio_assets', 'Voiceover created', 'Recording failed', 'active', strftime('%s', 'now')),
('station_06_04', 'room_06', 'sound-effects', 'SOUND EFFECTS', 'Add impact and mood. Create or find SFX.', 4, 'zap', '/stations/sound-effects', 'editor', 'Loading SFX editor...', 'audio_assets', 'SFX created', 'Could not create SFX', 'active', strftime('%s', 'now')),
('station_06_05', 'room_06', 'mix-master', 'MIX MASTER', 'Balance your soundtrack. Mix audio levels and EQ.', 5, 'sliders', '/stations/mix-master', 'editor', 'Loading mixer...', 'audio_assets', 'Mix saved', 'Could not save mix', 'active', strftime('%s', 'now')),
('station_06_06', 'room_06', 'export-audio', 'EXPORT AUDIO', 'Save your sound. Download or export audio.', 6, 'download', '/stations/export-audio', 'form', 'Preparing export...', null, 'Audio exported', 'Export failed', 'active', strftime('%s', 'now'));

-- Remaining rooms: Single placeholder station each
INSERT OR IGNORE INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, status, created_at) VALUES
('station_02_01', 'room_02', 'academy', 'THE ACADEMY', 'Learning tools - coming in Phase 2', 1, 'book-open', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_03_01', 'room_03', 'writers-room', 'WRITERS'' ROOM', 'Writing tools - coming in Phase 2', 1, 'file-text', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_04_01', 'room_04', 'casting', 'CASTING STUDIO', 'Casting tools - coming in Phase 2', 1, 'user', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_05_01', 'room_05', 'wardrobe', 'DRESSING ROOM', 'Wardrobe tools - coming in Phase 2', 1, 'shirt', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_07_01', 'room_07', 'soundstage', 'SOUNDSTAGE', 'Production tools - coming in Phase 2', 1, 'video', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_08_01', 'room_08', 'editing', 'EDITING BAY', 'Post-production tools - coming in Phase 2', 1, 'film', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_09_01', 'room_09', 'command', 'AI COMMAND', 'AI management tools - coming in Phase 2', 1, 'cpu', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_10_01', 'room_10', 'premiere', 'PREMIERE', 'Screening tools - coming in Phase 2', 1, 'play-circle', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_11_01', 'room_11', 'publish', 'PUBLISH', 'Publishing tools - coming in Phase 2', 1, 'send', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_12_01', 'room_12', 'archive', 'ARCHIVE', 'Archive tools - coming in Phase 2', 1, 'archive', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now'));
EOF

echo "✅ Data seeded: 12 rooms + 72 stations"

# Step 4: Verify
echo ""
echo "Step 4: Verifying data..."

ROOM_COUNT=$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM akfu_rooms;")
STATION_COUNT=$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM akfu_stations;")

echo "✅ Room count: $ROOM_COUNT (expected: 12)"
echo "✅ Station count: $STATION_COUNT (expected: 72)"

# Step 5: Summary
echo ""
echo "=========================================="
echo "✅ Database initialization complete!"
echo "=========================================="
echo ""
echo "Summary:"
echo "  • Database: $DATABASE_URL"
echo "  • Tables created: 5 (rooms, stations, room_progress, station_progress, audio_assets)"
echo "  • Indexes created: 8"
echo "  • Rooms seeded: 12"
echo "  • Stations seeded: 72"
echo "  • Backup: $BACKUP_FILE"
echo ""
echo "Next steps:"
echo "  1. Update akfu-backend.ts with new API routes (see akfu-backend-rooms.ts)"
echo "  2. Deploy backend to Railway"
echo "  3. Test API: curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms"
echo "  4. Begin frontend development against /api/rooms endpoint"
echo ""
