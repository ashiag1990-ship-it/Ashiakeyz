// ============================================================================
// AKFU Room & Station Type Definitions
// ============================================================================

export interface AKFURoom {
  id: string;
  slug: string;
  title: string;
  description: string;
  department: string;
  order_index: number;

  // Visual/UX configuration
  exterior_name: string;
  design_goal: string;
  environment_art_direction: string;
  campus_region?: string;
  focus_point?: string;
  interior_asset_url?: string;

  // Audio configuration
  ambient_audio_url?: string;
  ambient_audio_duration?: number;
  entry_sound_url?: string;

  // Camera storyboard
  camera_storyboard?: string;
  camera_motion_rules?: string;
  environment_motion_rules?: string;

  // Navigation
  permissions?: string;
  prerequisite_room_id?: string;
  transition_type: 'portal' | 'fade' | 'slide' | 'dissolve';
  transition_duration_ms: number;

  // Status
  status: 'active' | 'inactive' | 'coming-soon';
  created_at: number;
  updated_at: number;
}

export interface AKFUStation {
  id: string;
  room_id: string;
  slug: string;
  title: string;
  description: string;
  station_order: number;

  // Visual representation
  icon_name: string;
  icon_url?: string;
  hotspot_region?: string;
  background_image_url?: string;

  // Station type & behavior
  station_type: 'form' | 'editor' | 'gallery' | 'generator' | 'library' | 'dashboard';
  action_route: string;
  action_endpoint?: string;
  loading_message: string;

  // Permissions & dependencies
  permissions?: string;
  prerequisite_station_id?: string;
  requires_project: boolean;

  // Output handling
  stores_to?: 'projects' | 'scripts' | 'characters' | 'wardrobe' | 'audio_assets';
  success_message?: string;
  failure_message?: string;

  // Status
  status: 'active' | 'inactive' | 'coming-soon';
  created_at: number;
  updated_at: number;
}

export interface RoomWithStations {
  room: AKFURoom;
  stations: AKFUStation[];
}

export interface RoomProgress {
  id: string;
  user_id: string;
  project_id: string;
  room_id: string;
  visit_count: number;
  first_visited_at: number;
  last_visited_at: number;
  time_spent_seconds: number;
  completion_status: 'incomplete' | 'in_progress' | 'completed';
  all_stations_visited: boolean;
  created_at: number;
  updated_at: number;
}

export interface StationProgress {
  id: string;
  user_id: string;
  project_id: string;
  room_id: string;
  station_id: string;
  visit_count: number;
  first_visited_at: number;
  last_visited_at: number;
  time_spent_seconds: number;
  completion_status: 'incomplete' | 'in_progress' | 'completed';
  station_data?: Record<string, any>;
  created_project_id?: string;
  created_script_id?: string;
  created_character_id?: string;
  created_wardrobe_id?: string;
  created_audio_asset_id?: string;
  error_state?: string;
  created_at: number;
  updated_at: number;
}

export interface AudioAsset {
  id: string;
  project_id: string;
  user_id: string;
  room_id?: string;
  station_id?: string;
  title: string;
  description?: string;
  audio_url: string;
  thumbnail_url?: string;
  audio_type: 'ambience' | 'song' | 'sfx' | 'dialogue' | 'voiceover';
  duration_seconds?: number;
  file_size_bytes?: number;
  mime_type?: string;
  generator_type?: 'suno' | 'elevenlabs' | 'openai_tts' | 'custom_upload';
  generation_prompt?: string;
  generation_job_id?: string;
  status: 'active' | 'inactive';
  created_at: number;
  updated_at: number;
}

export interface StationData {
  [key: string]: any;
}

// Room constants
export const ROOM_IDS = {
  WELCOME_HUB: 'room_01',
  ACADEMY: 'room_02',
  WRITERS_ROOM: 'room_03',
  CASTING_STUDIO: 'room_04',
  DRESSING_ROOM: 'room_05',
  SOUND_LAB: 'room_06',
  SOUNDSTAGE: 'room_07',
  EDITING_BAY: 'room_08',
  COMMAND_CENTER: 'room_09',
  PREMIERE_HALL: 'room_10',
  PUBLISHING_DOCK: 'room_11',
  ARCHIVE: 'room_12',
} as const;

export const ROOM_SLUGS = {
  WELCOME_HUB: 'welcome-hub',
  ACADEMY: 'academy',
  WRITERS_ROOM: 'writers-room',
  CASTING_STUDIO: 'casting-studio',
  DRESSING_ROOM: 'dressing-room',
  SOUND_LAB: 'sound-lab',
  SOUNDSTAGE: 'soundstage',
  EDITING_BAY: 'editing-bay',
  COMMAND_CENTER: 'command-center',
  PREMIERE_HALL: 'premiere-hall',
  PUBLISHING_DOCK: 'publishing-dock',
  ARCHIVE: 'archive',
} as const;

// Station types
export const STATION_TYPES = {
  FORM: 'form',
  EDITOR: 'editor',
  GALLERY: 'gallery',
  GENERATOR: 'generator',
  LIBRARY: 'library',
  DASHBOARD: 'dashboard',
} as const;

export const AUDIO_TYPES = {
  AMBIENCE: 'ambience',
  SONG: 'song',
  SFX: 'sfx',
  DIALOGUE: 'dialogue',
  VOICEOVER: 'voiceover',
} as const;

export const COMPLETION_STATUS = {
  INCOMPLETE: 'incomplete',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;
