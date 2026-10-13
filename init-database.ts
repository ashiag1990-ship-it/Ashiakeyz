import { Database } from 'bun:sqlite';

const db = new Database('/data/akfu.db');

console.log('🎬 Initializing AKFU Room Database...');

// Create tables
console.log('Creating tables...');
db.exec(`
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
  CREATE INDEX IF NOT EXISTS idx_rooms_status ON akfu_rooms(status);
  CREATE INDEX IF NOT EXISTS idx_stations_room ON akfu_stations(room_id);
  CREATE INDEX IF NOT EXISTS idx_stations_slug ON akfu_stations(slug);
  CREATE INDEX IF NOT EXISTS idx_room_progress_user_project ON akfu_room_progress(user_id, project_id);
  CREATE INDEX IF NOT EXISTS idx_station_progress_user_project ON akfu_station_progress(user_id, project_id);
  CREATE INDEX IF NOT EXISTS idx_audio_assets_project ON akfu_audio_assets(project_id);
  CREATE INDEX IF NOT EXISTS idx_audio_assets_room ON akfu_audio_assets(room_id);
`);

console.log('✅ Tables created');

// Seed rooms
console.log('Seeding 12 rooms and 72 stations...');
const now = Math.floor(Date.now() / 1000);

const rooms = [
  ['room_01', 'welcome-hub', 'Welcome Hub', 'The portal into your filmmaking universe', 'Direction', 1],
  ['room_02', 'academy', 'The Academy', 'A living university library of real film lessons', 'Learning', 2],
  ['room_03', 'writers-room', 'Writers\' Room', 'Script pages become the first playable scenes', 'Writing', 3],
  ['room_04', 'casting-studio', 'Casting Studio', 'A cinematic portrait studio for consistent characters', 'Casting', 4],
  ['room_05', 'dressing-room', 'The Dressing Room', 'Dress each cast member for each individual scene', 'Wardrobe', 5],
  ['room_06', 'sound-lab', 'Sound Lab', 'Compose, generate, and craft immersive audio experiences', 'Audio', 6],
  ['room_07', 'soundstage', 'Soundstage', 'Shoot and stage your scenes with real characters and props', 'Production', 7],
  ['room_08', 'editing-bay', 'Editing Bay', 'Cut, pace, and color your film into final form', 'Post-Production', 8],
  ['room_09', 'command-center', 'AI Agents Command Center', 'Direct AI assistance across every department', 'Direction', 9],
  ['room_10', 'premiere-hall', 'Premiere Hall', 'Screen your finished film for cast, crew, and world', 'Release', 10],
  ['room_11', 'publishing-dock', 'Publishing Dock', 'Ship your film to festivals, platforms, and the world', 'Release', 11],
  ['room_12', 'archive', 'Archive & Legacy', 'Preserve and catalog your body of work', 'Management', 12],
];

const insertRoom = db.prepare(`
  INSERT OR IGNORE INTO akfu_rooms
  (id, slug, title, description, department, order_index, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
`);

rooms.forEach(room => {
  insertRoom.run(...room, now, now);
});

console.log(`✅ Seeded ${rooms.length} rooms`);

// Seed stations
const stations = [
  // Room 01: Welcome Hub
  ['station_01_01', 'room_01', 'new-film', 'NEW FILM', 'Create new film project', 1],
  ['station_01_02', 'room_01', 'my-productions', 'MY PRODUCTIONS', 'Browse film projects', 2],
  ['station_01_03', 'room_01', 'my-crew', 'MY CREW', 'Manage studio team', 3],
  ['station_01_04', 'room_01', 'room-directory', 'ROOM DIRECTORY', 'Navigate the university', 4],
  ['station_01_05', 'room_01', 'continue', 'CONTINUE', 'Resume active production', 5],
  ['station_01_06', 'room_01', 'director-assistant', 'DIRECTOR ASSISTANT', 'Get help anytime', 6],
  // Room 02: Academy
  ['station_02_01', 'room_02', 'academy', 'THE ACADEMY', 'Learning tools', 1],
  ['station_02_02', 'room_02', 'catalog', 'CATALOG', 'Browse lessons', 2],
  ['station_02_03', 'room_02', 'classroom', 'CLASSROOM', 'Take lessons', 3],
  ['station_02_04', 'room_02', 'practice', 'PRACTICE', 'Practice skills', 4],
  ['station_02_05', 'room_02', 'assignments', 'ASSIGNMENTS', 'Submit work', 5],
  ['station_02_06', 'room_02', 'certificates', 'CERTIFICATES', 'View achievements', 6],
  // Room 03: Writers' Room
  ['station_03_01', 'room_03', 'new-script', 'NEW SCRIPT', 'Start new script', 1],
  ['station_03_02', 'room_03', 'ai-cowriter', 'AI CO-WRITER', 'Write with AI', 2],
  ['station_03_03', 'room_03', 'scene-wall', 'SCENE WALL', 'Organize scenes', 3],
  ['station_03_04', 'room_03', 'dialogue', 'DIALOGUE', 'Write dialogue', 4],
  ['station_03_05', 'room_03', 'versions', 'VERSIONS', 'Manage versions', 5],
  ['station_03_06', 'room_03', 'send-to-set', 'SEND TO SET', 'Approve breakdown', 6],
  // Room 04: Casting Studio
  ['station_04_01', 'room_04', 'new-character', 'NEW CHARACTER', 'Create character', 1],
  ['station_04_02', 'room_04', 'reference', 'REFERENCE', 'Add reference images', 2],
  ['station_04_03', 'room_04', 'character-sheet', 'CHARACTER SHEET', 'Generate sheet', 3],
  ['station_04_04', 'room_04', 'appearance-lock', 'APPEARANCE LOCK', 'Lock the look', 4],
  ['station_04_05', 'room_04', 'voice-cast', 'VOICE CAST', 'Add voice', 5],
  ['station_04_06', 'room_04', 'my-cast', 'MY CAST', 'Browse cast', 6],
  // Room 05: Dressing Room
  ['station_05_01', 'room_05', 'new-look', 'NEW LOOK', 'Design outfit', 1],
  ['station_05_02', 'room_05', 'upload-reference', 'REFERENCE', 'Add references', 2],
  ['station_05_03', 'room_05', 'virtual-fitting', 'VIRTUAL FITTING', 'Try on outfit', 3],
  ['station_05_04', 'room_05', 'continuity-check', 'CONTINUITY CHECK', 'Verify consistency', 4],
  ['station_05_05', 'room_05', 'accessories', 'ACCESSORIES', 'Add accessories', 5],
  ['station_05_06', 'room_05', 'wardrobe-rack', 'WARDROBE RACK', 'See all outfits', 6],
  // Room 06: Sound Lab (PHASE 1)
  ['station_06_01', 'room_06', 'write-song', 'WRITE SONG', 'Create song with Suno', 1],
  ['station_06_02', 'room_06', 'sound-library', 'SOUND LIBRARY', 'Browse audio', 2],
  ['station_06_03', 'room_06', 'record-voiceover', 'RECORD VOICEOVER', 'Record with ElevenLabs', 3],
  ['station_06_04', 'room_06', 'sound-effects', 'SOUND EFFECTS', 'Create SFX', 4],
  ['station_06_05', 'room_06', 'mix-master', 'MIX MASTER', 'Mix audio', 5],
  ['station_06_06', 'room_06', 'export-audio', 'EXPORT AUDIO', 'Download audio', 6],
  // Rooms 07-12: Placeholder
  ['station_07_01', 'room_07', 'soundstage', 'SOUNDSTAGE', 'Coming soon', 1],
  ['station_08_01', 'room_08', 'editing', 'EDITING BAY', 'Coming soon', 1],
  ['station_09_01', 'room_09', 'command', 'AI COMMAND', 'Coming soon', 1],
  ['station_10_01', 'room_10', 'premiere', 'PREMIERE', 'Coming soon', 1],
  ['station_11_01', 'room_11', 'publish', 'PUBLISH', 'Coming soon', 1],
  ['station_12_01', 'room_12', 'archive', 'ARCHIVE', 'Coming soon', 1],
];

const insertStation = db.prepare(`
  INSERT OR IGNORE INTO akfu_stations
  (id, room_id, slug, title, description, station_order, status, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?)
`);

stations.forEach(station => {
  insertStation.run(...station, now, now);
});

console.log(`✅ Seeded ${stations.length} stations`);

// Verify
const roomCount = db.prepare('SELECT COUNT(*) as count FROM akfu_rooms').get() as any;
const stationCount = db.prepare('SELECT COUNT(*) as count FROM akfu_stations').get() as any;

console.log(`\n✅ Database initialization complete!`);
console.log(`   Rooms: ${roomCount.count}`);
console.log(`   Stations: ${stationCount.count}`);
console.log(`   Status: Ready for deployment`);
