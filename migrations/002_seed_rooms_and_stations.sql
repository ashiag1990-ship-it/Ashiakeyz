-- ============================================================================
-- AKFU ROOM & STATION SEED DATA
-- Populates 12 rooms with 6 stations each (72 total stations)
-- ============================================================================

-- ============================================================================
-- ROOM 01: WELCOME HUB / DIRECTOR'S GRAND LOBBY
-- ============================================================================
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, camera_motion_rules, environment_motion_rules, transition_type, transition_duration_ms, status, created_at) VALUES
('room_01', 'welcome-hub', 'Welcome Hub', 'The portal into your filmmaking universe', 'Direction', 1, 'WELCOME HUB / DIRECTOR PLAZA', 'The portal into your filmmaking universe', 'Double-height black marble atrium; Floating gold AK insignia and fountain; Portal arches for major departments', '/audio/sfx/entry-chime.wav', '/audio/ambience/lobby-hvac.wav', 'Gold reel turns very slowly; Portal rings reveal with light sweep; Kiosk displays idle with soft parallax; Optional director avatar arrives naturally', 'Selection glow immediately; Gentle parallax on interactive elements', 'portal', 1250, 'active', strftime('%s', 'now'));

-- ROOM 01: Stations
INSERT INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, success_message, failure_message, status, created_at) VALUES
('station_01_01', 'room_01', 'new-film', 'NEW FILM', 'Project creation form. Create a new film project.', 1, 'film-reel', '/stations/new-project', 'form', 'Creating new film...', 'projects', 'Project created successfully', 'Could not create project', 'active', strftime('%s', 'now')),
('station_01_02', 'room_01', 'my-productions', 'MY PRODUCTIONS', 'Saved project library. Browse your film projects.', 2, 'film-library', '/stations/projects', 'library', 'Loading projects...', 'projects', null, 'Could not load projects', 'active', strftime('%s', 'now')),
('station_01_03', 'room_01', 'my-crew', 'MY CREW', 'Saved AI agents. Manage studio team.', 3, 'users', '/stations/agents', 'dashboard', 'Loading crew...', null, null, 'Could not load crew', 'active', strftime('%s', 'now')),
('station_01_04', 'room_01', 'room-directory', 'ROOM DIRECTORY', 'Teleport to any department. Navigate the university.', 4, 'map', '/stations/navigation', 'gallery', 'Loading navigation...', null, null, 'Could not load navigation', 'active', strftime('%s', 'now')),
('station_01_05', 'room_01', 'continue', 'CONTINUE', 'Resume active production. Jump back in.', 5, 'play', '/stations/resume', 'dashboard', 'Loading active project...', null, 'Project resumed', 'No active project', 'active', strftime('%s', 'now')),
('station_01_06', 'room_01', 'director-assistant', 'DIRECTOR ASSISTANT', 'Context-aware studio guide. Get help anytime.', 6, 'help-circle', '/stations/assistant', 'generator', 'Loading assistant...', null, null, 'Assistant unavailable', 'active', strftime('%s', 'now'));

-- ============================================================================
-- ROOM 02: THE ACADEMY
-- ============================================================================
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, environment_motion_rules, transition_type, transition_duration_ms, status, created_at) VALUES
('room_02', 'academy', 'The Academy', 'A living university library of real film lessons', 'Learning', 2, 'LEARN / MASTER / GROW', 'A living university library of real film lessons', 'Grand dome hall with learning portals; Holographic course shelves and lecture screen; Quiet progress gallery and certificate desk', '/audio/sfx/academic-motif.wav', '/audio/ambience/library-air.wav', 'Floating light-text rotates softly; Course tiles glide into focus; Progress ribbon fills only on completion; Seated NPC learners turn pages subtly', 'portal', 1250, 'active', strftime('%s', 'now'));

INSERT INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, success_message, failure_message, status, created_at) VALUES
('station_02_01', 'room_02', 'my-courses', 'MY COURSES', 'Resume enrolled course. Continue learning.', 1, 'book-open', '/stations/courses', 'library', 'Loading courses...', null, null, 'Could not load courses', 'active', strftime('%s', 'now')),
('station_02_02', 'room_02', 'catalog', 'CATALOG', 'Browse actual stored lessons. Explore content.', 2, 'search', '/stations/lesson-catalog', 'gallery', 'Loading catalog...', null, null, 'Could not load catalog', 'active', strftime('%s', 'now')),
('station_02_03', 'room_02', 'classroom', 'CLASSROOM', 'Play lesson + notes. Take a lesson.', 3, 'video', '/stations/lesson-player', 'editor', 'Loading lesson...', null, 'Lesson completed', 'Could not load lesson', 'active', strftime('%s', 'now')),
('station_02_04', 'room_02', 'practice', 'PRACTICE', 'Launch linked studio activity. Practice skills.', 4, 'zap', '/stations/practice', 'form', 'Starting practice...', null, 'Practice saved', 'Practice failed', 'active', strftime('%s', 'now')),
('station_02_05', 'room_02', 'assignments', 'ASSIGNMENTS', 'Submit graded work. Hand in assignments.', 5, 'clipboard', '/stations/assignments', 'editor', 'Loading assignments...', null, 'Assignment submitted', 'Could not submit assignment', 'active', strftime('%s', 'now')),
('station_02_06', 'room_02', 'certificates', 'CERTIFICATES', 'View verified completions. See achievements.', 6, 'award', '/stations/certificates', 'gallery', 'Loading certificates...', null, null, 'Could not load certificates', 'active', strftime('%s', 'now'));

-- ============================================================================
-- ROOM 03: WRITERS' ROOM
-- ============================================================================
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, environment_motion_rules, transition_type, transition_duration_ms, status, created_at) VALUES
('room_03', 'writers-room', 'Writers\' Room', 'Script pages become the first playable scenes', 'Writing', 3, 'DEVELOP / WRITE / PLAN', 'Script pages become the first playable scenes', 'Writing desks with reactive digital paper; Story wall with connected scene cards; Screenplay editor projected on glass', '/audio/sfx/page-flutter.wav', '/audio/ambience/room-tone.wav', 'Script pages flip on explicit actions; Scene cards reorganize smoothly; Text insertion caret and autosave state; Optional writing assistant avatar gestures', 'portal', 1250, 'active', strftime('%s', 'now'));

INSERT INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, success_message, failure_message, status, created_at) VALUES
('station_03_01', 'room_03', 'new-script', 'NEW SCRIPT', 'Create screenplay. Start a new script.', 1, 'file-text', '/stations/new-script', 'form', 'Creating script...', 'scripts', 'Script created', 'Could not create script', 'active', strftime('%s', 'now')),
('station_03_02', 'room_03', 'ai-cowriter', 'AI CO-WRITER', 'Brainstorm and rewrite. Write with AI assistance.', 2, 'pen-tool', '/stations/cowriter', 'generator', 'Generating suggestions...', 'scripts', 'Suggestions generated', 'Generation failed', 'active', strftime('%s', 'now')),
('station_03_03', 'room_03', 'scene-wall', 'SCENE WALL', 'Organize acts and scenes. Structure your story.', 3, 'layout', '/stations/scene-wall', 'editor', 'Loading scene wall...', 'scripts', 'Scenes organized', 'Could not load scene wall', 'active', strftime('%s', 'now')),
('station_03_04', 'room_03', 'dialogue', 'DIALOGUE', 'Assign lines to characters. Write dialogue.', 4, 'message-circle', '/stations/dialogue', 'editor', 'Loading dialogue editor...', 'scripts', 'Dialogue saved', 'Could not save dialogue', 'active', strftime('%s', 'now')),
('station_03_05', 'room_03', 'versions', 'VERSIONS', 'Diff and restore drafts. Manage versions.', 5, 'git-branch', '/stations/versions', 'gallery', 'Loading versions...', null, null, 'Could not load versions', 'active', strftime('%s', 'now')),
('station_03_06', 'room_03', 'send-to-set', 'SEND TO SET', 'Approve scene breakdown. Send to production.', 6, 'send', '/stations/approve-breakdown', 'form', 'Submitting breakdown...', 'scripts', 'Scene sent to set', 'Could not send scene', 'active', strftime('%s', 'now'));

-- ============================================================================
-- ROOM 04: CASTING STUDIO
-- ============================================================================
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, environment_motion_rules, transition_type, transition_duration_ms, status, created_at) VALUES
('room_04', 'casting-studio', 'Casting Studio', 'A cinematic portrait studio for consistent characters', 'Casting', 4, 'DISCOVER / CAST / COLLABORATE', 'A cinematic portrait studio for consistent characters', 'Curved casting wall full of portrait frames; Rotating center character presentation dais; Floating identity and voice panels', '/audio/sfx/camera-shutter.wav', '/audio/ambience/studio-hvac.wav', 'Portrait frames glow on selection; Display stand slowly turns (not character); Facial sheets crossfade during preview; Talent agent gives subtle nod', 'portal', 1250, 'active', strftime('%s', 'now'));

INSERT INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, success_message, failure_message, status, created_at) VALUES
('station_04_01', 'room_04', 'new-character', 'NEW CHARACTER', 'Save identity profile. Create a character.', 1, 'user', '/stations/new-character', 'form', 'Creating character...', 'characters', 'Character created', 'Could not create character', 'active', strftime('%s', 'now')),
('station_04_02', 'room_04', 'reference', 'REFERENCE', 'Upload permitted photos. Add reference images.', 2, 'image', '/stations/upload-reference', 'form', 'Uploading reference...', 'characters', 'Reference uploaded', 'Upload failed', 'active', strftime('%s', 'now')),
('station_04_03', 'room_04', 'character-sheet', 'CHARACTER SHEET', 'Generate reference angles. Create character sheet.', 3, 'camera', '/stations/character-sheet', 'generator', 'Generating sheet...', 'characters', 'Sheet generated', 'Generation failed', 'active', strftime('%s', 'now')),
('station_04_04', 'room_04', 'appearance-lock', 'APPEARANCE LOCK', 'Approve continuity refs. Lock the look.', 4, 'lock', '/stations/approve-appearance', 'form', 'Approving appearance...', null, 'Appearance locked', 'Could not approve appearance', 'active', strftime('%s', 'now')),
('station_04_05', 'room_04', 'voice-cast', 'VOICE CAST', 'Assign authorized voice. Add voice to character.', 5, 'headphones', '/stations/voice-cast', 'generator', 'Assigning voice...', 'characters', 'Voice assigned', 'Could not assign voice', 'active', strftime('%s', 'now')),
('station_04_06', 'room_04', 'my-cast', 'MY CAST', 'Reuse character across scenes. Browse cast.', 6, 'users', '/stations/cast-list', 'gallery', 'Loading cast...', null, null, 'Could not load cast', 'active', strftime('%s', 'now'));

-- ============================================================================
-- ROOM 05: THE DRESSING ROOM
-- ============================================================================
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, environment_motion_rules, transition_type, transition_duration_ms, status, created_at) VALUES
('room_05', 'dressing-room', 'The Dressing Room', 'Dress each cast member for each individual scene', 'Wardrobe', 5, 'STYLE / WARDROBE / TRANSFORM', 'Dress each cast member for each individual scene', 'Gold-framed full-length mirrors; Sliding designer rails and accessory vitrines; Virtual fitting stage with character photo', '/audio/sfx/fabric-swish.wav', '/audio/ambience/boutique-air.wav', 'Mirror reflections update on look selection; Rail slides reveal new items smoothly; Virtual fitting stage shows character in outfit; Accessory sparkle on hover', 'portal', 1250, 'active', strftime('%s', 'now'));

INSERT INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, success_message, failure_message, status, created_at) VALUES
('station_05_01', 'room_05', 'new-look', 'NEW LOOK', 'Create outfit. Design a new wardrobe piece.', 1, 'shirt', '/stations/new-look', 'form', 'Creating look...', 'wardrobe', 'Look created', 'Could not create look', 'active', strftime('%s', 'now')),
('station_05_02', 'room_05', 'upload-reference', 'UPLOAD REFERENCE', 'Pin inspiration. Add reference images.', 2, 'pin', '/stations/wardrobe-reference', 'form', 'Uploading reference...', null, 'Reference saved', 'Upload failed', 'active', strftime('%s', 'now')),
('station_05_03', 'room_05', 'virtual-fitting', 'VIRTUAL FITTING', 'Try on outfit. See outfit on character.', 3, 'eye', '/stations/virtual-fitting', 'editor', 'Loading fitting room...', null, 'Outfit fitted', 'Could not load fitting room', 'active', strftime('%s', 'now')),
('station_05_04', 'room_05', 'continuity-check', 'CONTINUITY CHECK', 'Compare across scenes. Verify outfit consistency.', 4, 'check-square', '/stations/continuity', 'editor', 'Loading continuity...', null, 'Continuity checked', 'Could not check continuity', 'active', strftime('%s', 'now')),
('station_05_05', 'room_05', 'accessories', 'ACCESSORIES', 'Add finishing touches. Select accessories.', 5, 'sparkles', '/stations/accessories', 'editor', 'Loading accessories...', 'wardrobe', 'Accessories added', 'Could not add accessories', 'active', strftime('%s', 'now')),
('station_05_06', 'room_05', 'wardrobe-rack', 'WARDROBE RACK', 'Browse all looks. See all outfits.', 6, 'layers', '/stations/wardrobe-library', 'gallery', 'Loading wardrobe...', null, null, 'Could not load wardrobe', 'active', strftime('%s', 'now'));

-- ============================================================================
-- ROOM 06: SOUND LAB (PHASE 1 FOCUS)
-- ============================================================================
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, environment_motion_rules, transition_type, transition_duration_ms, status, created_at) VALUES
('room_06', 'sound-lab', 'Sound Lab', 'Compose, generate, and craft immersive audio experiences', 'Audio', 6, 'COMPOSE / GENERATE / CRAFT', 'Compose, generate, and craft immersive audio experiences', 'High-tech mixing consoles with responsive knobs; Holographic waveform displays; Floating sound material library with genre shelves; Soundproof booth with vocal recording interface', '/audio/sfx/audio-rise.wav', '/audio/ambience/studio-tone.wav', 'Waveforms pulse to music; Mixing console knobs respond to input; Sound material library scrolls smoothly; Recording indicator pulses on record', 'portal', 1250, 'active', strftime('%s', 'now'));

INSERT INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, success_message, failure_message, status, created_at) VALUES
('station_06_01', 'room_06', 'write-song', 'WRITE SONG', 'Compose original music. Create a new song with Suno AI.', 1, 'music', '/stations/write-song', 'generator', 'Generating music...', 'audio_assets', 'Song created successfully', 'Song generation failed', 'active', strftime('%s', 'now')),
('station_06_02', 'room_06', 'sound-library', 'SOUND LIBRARY', 'Browse generated audio. Find and reuse sounds.', 2, 'library', '/stations/sound-library', 'gallery', 'Loading library...', null, null, 'Could not load library', 'active', strftime('%s', 'now')),
('station_06_03', 'room_06', 'record-voiceover', 'RECORD VOICEOVER', 'Narrate your story. Record dialogue and narration with ElevenLabs.', 3, 'mic', '/stations/record-voiceover', 'generator', 'Preparing recording...', 'audio_assets', 'Voiceover created', 'Recording failed', 'active', strftime('%s', 'now')),
('station_06_04', 'room_06', 'sound-effects', 'SOUND EFFECTS', 'Add impact and mood. Create or find SFX.', 4, 'zap', '/stations/sound-effects', 'editor', 'Loading SFX editor...', 'audio_assets', 'SFX created', 'Could not create SFX', 'active', strftime('%s', 'now')),
('station_06_05', 'room_06', 'mix-master', 'MIX MASTER', 'Balance your soundtrack. Mix audio levels and EQ.', 5, 'sliders', '/stations/mix-master', 'editor', 'Loading mixer...', 'audio_assets', 'Mix saved', 'Could not save mix', 'active', strftime('%s', 'now')),
('station_06_06', 'room_06', 'export-audio', 'EXPORT AUDIO', 'Save your sound. Download or export audio.', 6, 'download', '/stations/export-audio', 'form', 'Preparing export...', null, 'Audio exported', 'Export failed', 'active', strftime('%s', 'now'));

-- ============================================================================
-- REMAINING ROOMS (Placeholders for Phase 2+)
-- ============================================================================

-- ROOM 07: SOUNDSTAGE
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, transition_type, transition_duration_ms, status, created_at) VALUES
('room_07', 'soundstage', 'Soundstage', 'Shoot and stage your scenes with real characters and props', 'Production', 7, 'SHOOT / STAGE / PERFORM', 'Shoot and stage your scenes with real characters and props', 'Grand studio with cyclorama; Lighting grid overhead; Camera on jib arm; Craft services table; Director monitor station', '/audio/sfx/slate-clap.wav', '/audio/ambience/stage-air.wav', 'portal', 1250, 'active', strftime('%s', 'now'));

-- ROOM 08: EDITING BAY
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, transition_type, transition_duration_ms, status, created_at) VALUES
('room_08', 'editing-bay', 'Editing Bay', 'Cut, pace, and color your film into final form', 'Post-Production', 8, 'CUT / PACE / COLOR', 'Cut, pace, and color your film into final form', 'Post-production suite with dual color displays; Multi-camera timeline; Color grading node interface; Render farm visualization', '/audio/sfx/edit-snap.wav', '/audio/ambience/suite-air.wav', 'portal', 1250, 'active', strftime('%s', 'now'));

-- ROOM 09: AI AGENTS COMMAND CENTER
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, transition_type, transition_duration_ms, status, created_at) VALUES
('room_09', 'command-center', 'AI Agents Command Center', 'Direct AI assistance across every department', 'Direction', 9, 'COMMAND / DELEGATE / AUTOMATE', 'Direct AI assistance across every department', 'Mission control aesthetic with holographic assistant roster; Multi-window monitoring; Task queue visualization; Real-time stat dashboard', '/audio/sfx/alert-chime.wav', '/audio/ambience/tech-hum.wav', 'portal', 1250, 'active', strftime('%s', 'now'));

-- ROOM 10: PREMIERE HALL
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, transition_type, transition_duration_ms, status, created_at) VALUES
('room_10', 'premiere-hall', 'Premiere Hall', 'Screen your finished film for cast, crew, and world', 'Release', 10, 'PREMIERE / PREMIERE / CELEBRATE', 'Screen your finished film for cast, crew, and world', 'Grand cinema theatre with plush seats; Gold-trimmed screen; Spotlight illuminating curtain; Awards display; Champagne bar detail', '/audio/sfx/curtain-rise.wav', '/audio/ambience/theatre-air.wav', 'portal', 1250, 'active', strftime('%s', 'now'));

-- ROOM 11: PUBLISHING DOCK
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, transition_type, transition_duration_ms, status, created_at) VALUES
('room_11', 'publishing-dock', 'Publishing Dock', 'Ship your film to festivals, platforms, and the world', 'Release', 11, 'PUBLISH / SHARE / CELEBRATE', 'Ship your film to festivals, platforms, and the world', 'Futuristic publishing terminal with network globe; Social feed walls; Festival badge registry; Platform availability board', '/audio/sfx/launch-beep.wav', '/audio/ambience/broadcast-room.wav', 'portal', 1250, 'active', strftime('%s', 'now'));

-- ROOM 12: ARCHIVE & LEGACY
INSERT INTO akfu_rooms (id, slug, title, description, department, order_index, exterior_name, design_goal, environment_art_direction, entry_sound_url, ambient_audio_url, transition_type, transition_duration_ms, status, created_at) VALUES
('room_12', 'archive', 'Archive & Legacy', 'Preserve and catalog your body of work', 'Management', 12, 'PRESERVE / CATALOG / CELEBRATE', 'Preserve and catalog your body of work', 'Grand film archive with projected gallery walls; Time-locked vault doors; Family tree visualization of connected works; Legacy statue centerpiece', '/audio/sfx/archive-open.wav', '/audio/ambience/vault-echo.wav', 'portal', 1250, 'active', strftime('%s', 'now'));

-- Add placeholder stations for rooms 07-12 (can be expanded later)
INSERT INTO akfu_stations (id, room_id, slug, title, description, station_order, icon_name, action_route, station_type, loading_message, stores_to, status, created_at) VALUES
('station_07_01', 'room_07', 'coming-soon', 'SOUNDSTAGE', 'Production tools - coming in Phase 2', 1, 'video', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_08_01', 'room_08', 'coming-soon', 'EDITING BAY', 'Post-production tools - coming in Phase 2', 1, 'film', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_09_01', 'room_09', 'coming-soon', 'AI COMMAND', 'AI management tools - coming in Phase 2', 1, 'cpu', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_10_01', 'room_10', 'coming-soon', 'PREMIERE', 'Screening tools - coming in Phase 2', 1, 'play-circle', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_11_01', 'room_11', 'coming-soon', 'PUBLISH', 'Publishing tools - coming in Phase 2', 1, 'send', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now')),
('station_12_01', 'room_12', 'coming-soon', 'ARCHIVE', 'Archive tools - coming in Phase 2', 1, 'archive', '/stations/coming-soon', 'form', 'Loading...', null, 'active', strftime('%s', 'now'));
