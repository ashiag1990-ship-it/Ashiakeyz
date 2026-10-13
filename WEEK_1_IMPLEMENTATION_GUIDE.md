# AKFU Week 1 Implementation Guide: Foundation
## Backend Infrastructure & Room System Setup

**Timeline:** Days 1-7 (Development week)  
**Goal:** Complete backend infrastructure for rooms, stations, and progress tracking  
**Deliverable:** Production-ready API with seeded data deployed to Railway

---

## Overview: What Gets Built This Week

By end of Week 1, the backend will:
- ✅ Store 12 rooms, 72 stations in database
- ✅ Track user progress per room and station
- ✅ Serve complete room/station data to frontend
- ✅ Accept audio asset creation requests
- ✅ Be deployed and publicly accessible

The frontend can then build against stable APIs that already return real data.

---

## Day 1-2: Backend Database Setup

### Task 1.1: Backup Current Database (30 min)
```bash
# On your local machine or Railway
cp /data/akfu.db /data/akfu-backup-$(date +%Y%m%d).db
echo "Database backed up"
```

### Task 1.2: Add New Database Tables to `akfu-backend.ts`

**File:** `/home/claude/ashiakeyz/akfu-backend.ts`

1. Open the existing backend file
2. Locate the `setupDatabase()` function (around line 47)
3. Add the following table definitions **inside** the `db.exec()` call:

```typescript
// Copy all CREATE TABLE statements from:
// /home/claude/ashiakeyz/migrations/001_add_room_system.sql
```

**Tables to add:**
- `akfu_rooms` (core room definitions)
- `akfu_stations` (6 stations per room)
- `akfu_room_progress` (user visit tracking)
- `akfu_station_progress` (individual station progress)
- `akfu_audio_assets` (generated audio storage)

**Important:** Add indexes for performance:
```sql
CREATE INDEX IF NOT EXISTS idx_rooms_slug ON akfu_rooms(slug);
CREATE INDEX IF NOT EXISTS idx_stations_room ON akfu_stations(room_id);
CREATE INDEX IF NOT EXISTS idx_room_progress_user_project ON akfu_room_progress(user_id, project_id);
```

### Task 1.3: Validate Database Schema Changes

After editing backend, test locally:

```bash
# Option A: If using local database
deno run --allow-read --allow-write akfu-backend.ts

# Option B: If using Railway remote database
# Deploy after next task
```

Expected output: Server starts without errors, no SQL syntax errors in console.

---

## Day 2-3: Add API Routes

### Task 2.1: Integrate Room API Endpoints

**Source:** `/home/claude/ashiakeyz/akfu-backend-rooms.ts`

Copy ALL endpoint definitions and add them to `/home/claude/ashiakeyz/akfu-backend.ts` **before** the final `export default app;` statement.

**Routes to add (11 endpoints total):**

#### Room Endpoints (3)
```
GET /api/rooms                     → List all 12 rooms
GET /api/rooms/:roomId             → Get room with stations
GET /api/rooms/:roomSlug/by-slug   → Get by slug identifier
```

#### Room Progress Endpoints (2)
```
POST /api/room-progress                → Record room visit
GET /api/room-progress/:projectId      → Get all room visits for project
```

#### Station Endpoints (2)
```
GET /api/stations/:stationId           → Get station details
GET /api/stations/:stationSlug/by-slug/:roomId → Get station by slug in room
```

#### Station Progress Endpoints (2)
```
POST /api/station-progress             → Save station visit & data
GET /api/station-progress/:projectId   → Get all station progress for project
```

#### Audio Assets Endpoints (5)
```
POST /api/audio-assets                 → Create audio asset
GET /api/audio-assets/:projectId       → List assets for project
GET /api/audio-assets/room/:roomId/:projectId → Assets by room
PUT /api/audio-assets/:assetId         → Update asset metadata
```

### Task 2.2: Add TypeScript Type Imports

At the top of `akfu-backend.ts`, add:

```typescript
import type {
  AKFURoom,
  AKFUStation,
  RoomWithStations,
  RoomProgress,
  StationProgress,
  AudioAsset
} from './types/rooms';
```

(This improves code IDE support; optional for Bun/Hono apps)

---

## Day 3-4: Seed Initial Data

### Task 3.1: Create Seed Script

Create `/home/claude/ashiakeyz/seeds/01_rooms_and_stations.sql`:
- Copy from: `/home/claude/ashiakeyz/migrations/002_seed_rooms_and_stations.sql`
- This populates all 12 rooms with 6 stations each

### Task 3.2: Run Seed Locally (Testing)

```bash
# Option 1: SQLite CLI (if you have local database)
sqlite3 /path/to/akfu.db < migrations/001_add_room_system.sql
sqlite3 /path/to/akfu.db < migrations/002_seed_rooms_and_stations.sql

# Option 2: Bun + Hono (recommended)
# The setupDatabase() function runs migrations automatically on startup
# Just redeploy the backend
```

### Task 3.3: Validate Seeded Data

Once backend is running, test with:

```bash
# Test 1: Get all rooms
curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms

# Expected response:
# {
#   "rooms": [
#     {
#       "id": "room_01",
#       "slug": "welcome-hub",
#       "title": "Welcome Hub",
#       ...
#     },
#     ...
#   ]
# }

# Test 2: Get Welcome Hub with stations
curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms/room_01

# Expected: 1 room + 6 stations
```

---

## Day 4-5: Testing & Validation

### Task 4.1: Functional API Testing

Create `/home/claude/ashiakeyz/tests/room-api.test.ts`:

```typescript
import { describe, it, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3001'; // Update for production

describe('Room API', () => {
  it('GET /api/rooms returns all 12 rooms', async () => {
    const response = await fetch(`${BASE_URL}/api/rooms`);
    const data = await response.json();
    expect(data.rooms).toHaveLength(12);
    expect(data.rooms[0]).toHaveProperty('id');
    expect(data.rooms[0]).toHaveProperty('slug');
  });

  it('GET /api/rooms/:roomId returns room with stations', async () => {
    const response = await fetch(`${BASE_URL}/api/rooms/room_01`);
    const data = await response.json();
    expect(data.room).toHaveProperty('id', 'room_01');
    expect(data.stations).toHaveLength(6);
  });

  it('GET /api/rooms/:roomSlug/by-slug returns correct room', async () => {
    const response = await fetch(`${BASE_URL}/api/rooms/sound-lab/by-slug`);
    const data = await response.json();
    expect(data.room.slug).toBe('sound-lab');
  });
});

describe('Station Progress API', () => {
  it('POST /api/station-progress creates progress record', async () => {
    // Test with authenticated user + project
    const response = await fetch(`${BASE_URL}/api/station-progress`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        project_id: 'test-project-id',
        room_id: 'room_01',
        station_id: 'station_01_01'
      })
    });
    expect(response.status).toBeOneOf([201, 200]);
  });
});
```

Run tests:
```bash
bun test tests/room-api.test.ts
```

### Task 4.2: Database Integrity Check

```bash
# If using SQLite, verify data
sqlite3 akfu.db << 'EOF'
SELECT COUNT(*) as total_rooms FROM akfu_rooms;
SELECT COUNT(*) as total_stations FROM akfu_stations;
SELECT room_id, COUNT(*) as station_count FROM akfu_stations GROUP BY room_id;
EOF
```

Expected output:
```
total_rooms
12

total_stations
72

room_id|station_count
room_01|6
room_02|6
... (all 12 rooms with 6 stations each)
```

### Task 4.3: Performance Testing

Test concurrent requests:
```bash
# Simulate 10 concurrent requests to /api/rooms
for i in {1..10}; do
  curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms &
done
wait

# All should return 200 OK within 500ms
```

---

## Day 5-6: Deploy to Railway

### Task 5.1: Update Railway Environment Variables

In Railway dashboard, set:

```
DATABASE_URL=/data/akfu.db
PORT=3001
ENCRYPTION_KEY=your-strong-encryption-key
TOKEN_SECRET=your-jwt-secret
ADMIN_KEY=AdminKey2026!
```

### Task 5.2: Deploy Updated Backend

```bash
# Commit changes
cd /home/claude/ashiakeyz
git add -A
git commit -m "feat: add room and station system with 12 rooms × 6 stations

- Add akfu_rooms, akfu_stations database tables
- Add room/station progress tracking
- Add 11 new API endpoints for room navigation
- Seed 72 stations across 12 departments
- Support phase 1 implementation (Welcome Hub + Sound Lab focus)"

# Push to Railway (if using GitHub integration)
git push origin main

# Or deploy directly:
railway deploy
```

Monitor deployment:
```bash
railway logs --watch
```

Expected output:
```
[INFO] Database setup complete
[INFO] Created tables: akfu_rooms, akfu_stations, akfu_room_progress...
[INFO] Server listening on port 3001
[INFO] Hono app ready
```

### Task 5.3: Verify Deployed API

```bash
# Test production endpoints
curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms | jq '.'

# Should return:
# {
#   "rooms": [ { 12 room objects } ]
# }
```

---

## Day 6-7: Documentation & Frontend Handoff

### Task 6.1: Generate API Documentation

Create `/home/claude/ashiakeyz/API_ROUTES_REFERENCE.md`:

```markdown
# AKFU API Routes - Complete Reference

## Rooms
- GET /api/rooms
  - Returns: { rooms: AKFURoom[] }
  - Auth: None required
  
- GET /api/rooms/:roomId
  - Returns: { room: AKFURoom, stations: AKFUStation[] }
  - Auth: None required

- GET /api/rooms/:roomSlug/by-slug
  - Returns: { room: AKFURoom, stations: AKFUStation[] }
  - Auth: None required

## Room Progress
- POST /api/room-progress
  - Body: { project_id, room_id }
  - Returns: { id, status, visit_count }
  - Auth: Bearer token required

- GET /api/room-progress/:projectId
  - Returns: { progress: RoomProgress[] }
  - Auth: Bearer token required

## Stations
- GET /api/stations/:stationId
  - Returns: { station: AKFUStation }
  - Auth: None required

- GET /api/stations/:stationSlug/by-slug/:roomId
  - Returns: { station: AKFUStation }
  - Auth: None required

## Station Progress
- POST /api/station-progress
  - Body: { project_id, room_id, station_id, station_data?, completion_status? }
  - Returns: { id, status, visit_count, completion_status }
  - Auth: Bearer token required

- GET /api/station-progress/:projectId
  - Returns: { progress: StationProgress[] }
  - Auth: Bearer token required

## Audio Assets
- POST /api/audio-assets
  - Body: { project_id, room_id, station_id, title, audio_url, audio_type, ... }
  - Returns: { id, project_id, title, audio_url, created_at }
  - Auth: Bearer token required

- GET /api/audio-assets/:projectId
  - Returns: { assets: AudioAsset[] }
  - Auth: Bearer token required

- GET /api/audio-assets/room/:roomId/:projectId
  - Returns: { assets: AudioAsset[] }
  - Auth: Bearer token required

- PUT /api/audio-assets/:assetId
  - Body: { title?, description?, audio_url?, duration_seconds?, status? }
  - Returns: { id, status, updated_at }
  - Auth: Bearer token required
```

### Task 6.2: Prepare for Frontend Integration

Create `/home/claude/ashiakeyz/FRONTEND_INTEGRATION_CHECKLIST.md`:

```markdown
# Frontend Integration Checklist

## Backend Ready
- [x] 12 rooms seeded in database
- [x] 72 stations seeded in database
- [x] All API routes deployed to Railway
- [x] Room/station progress tracking working
- [x] Audio asset endpoints ready

## Frontend Must Implement
- [ ] Campus map with 12 building hotspots
- [ ] Room view with 6 interactive stations per room
- [ ] Room entry transition animation (1250ms)
- [ ] Station modal/drawer with action route
- [ ] Audio manager with Web Audio API
- [ ] Progress persistence via API calls

## Test Before Merging
1. Can click building on campus
2. Room loads with correct 6 stations
3. Click station opens workstation UI
4. Complete action saves via /api/station-progress
5. Progress persists across page reloads
6. Audio plays with volume controls

## Phase 1 Critical Path
1. Welcome Hub (Room 01) - 6 stations working
2. Sound Lab (Room 06) - with Suno/ElevenLabs integration
3. Remaining rooms as placeholders with "Coming Soon"
```

### Task 6.3: Create Example API Requests

Create `/home/claude/ashiakeyz/examples/api-requests.sh`:

```bash
#!/bin/bash

# Set base URL
BASE_URL="https://ashiakeyz-akfu-production.up.railway.app"
AUTH_TOKEN="your-jwt-token-here"

# 1. Get all rooms
curl -s "$BASE_URL/api/rooms" | jq '.rooms | length'

# 2. Get Welcome Hub with stations
curl -s "$BASE_URL/api/rooms/room_01" | jq '.stations | length'

# 3. Get Sound Lab by slug
curl -s "$BASE_URL/api/rooms/sound-lab/by-slug" | jq '.room.title'

# 4. Record room visit
curl -X POST "$BASE_URL/api/room-progress" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project-123",
    "room_id": "room_01"
  }'

# 5. Get room progress for project
curl -s "$BASE_URL/api/room-progress/project-123" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.progress'

# 6. Create audio asset
curl -X POST "$BASE_URL/api/audio-assets" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "project-123",
    "room_id": "room_06",
    "station_id": "station_06_01",
    "title": "My Song",
    "audio_type": "song",
    "audio_url": "https://example.com/song.mp3",
    "generator_type": "suno",
    "duration_seconds": 180
  }'
```

---

## Checklist: Week 1 Complete

- [ ] Database schema updated with 5 new tables
- [ ] 12 rooms seeded (all with metadata)
- [ ] 72 stations seeded (6 per room)
- [ ] 11 API endpoints implemented
- [ ] Type definitions created (TypeScript)
- [ ] Endpoints tested locally
- [ ] Backend deployed to Railway
- [ ] Production API verified working
- [ ] Documentation complete
- [ ] Frontend team has API reference ready

---

## Next: Week 2 - Frontend Foundation

Once this is complete, frontend development can begin:
- Next.js migration from single HTML
- Campus map component with SVG hotspots
- Room/Station container components
- Audio manager implementation
- Integration with backend APIs
- Phase 1 stations (Welcome Hub + Sound Lab)

---

## Support & Troubleshooting

**Issue: Database errors on startup**
```
Solution: Check DATABASE_URL environment variable
Check permissions on /data directory
Run migration SQL manually if needed
```

**Issue: API returns 404 for rooms**
```
Solution: Verify seeding script ran
Check akfu_rooms table: SELECT COUNT(*) FROM akfu_rooms;
Restart backend server
```

**Issue: Progress not saving**
```
Solution: Verify Authorization header with Bearer token
Check user_id and project_id exist
Check database constraints (FOREIGN KEYS)
```

For more help, consult CLAUDE_MASTER_IMPLEMENTATION_BRIEF.md.
