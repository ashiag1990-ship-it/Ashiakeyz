# AKFU Phase 1: Deployment Quick Reference

**Status:** Ready to integrate and deploy (Oct 13, 2026)  
**Time to launch:** ~2 hours

---

## 🚀 Three Steps to Production

### 1️⃣ Initialize Database (5 min)

```bash
chmod +x /home/claude/ashiakeyz/scripts/init-rooms-database.sh
/home/claude/ashiakeyz/scripts/init-rooms-database.sh
```

**Verify:** 
```bash
sqlite3 /data/akfu.db "SELECT COUNT(*) FROM akfu_rooms;"
# Output: 12 ✅
```

---

### 2️⃣ Integrate API Routes (30 min)

**File to edit:** `/home/claude/ashiakeyz/akfu-backend.ts`

**Find this line (near end):**
```typescript
// ============================================================================
// ERROR HANDLING
// ============================================================================
```

**Copy everything from `/home/claude/ashiakeyz/akfu-backend-rooms.ts`**  
**Paste it BEFORE that error handling comment**

**Test locally:**
```bash
bun run akfu-backend.ts
# Should start without errors
# Ctrl+C to stop
```

---

### 3️⃣ Deploy to Production (10 min)

```bash
cd /home/claude/ashiakeyz
git add -A
git commit -m "feat: room system - 12 rooms × 6 stations"
git push origin main
# Railway auto-deploys
# Wait 2-3 minutes...
```

**Test production:**
```bash
curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms | jq '.rooms | length'
# Output: 12 ✅
```

---

## 📊 What You Get

| Item | Count |
|------|-------|
| Rooms | 12 |
| Stations per room | 6 |
| Total stations | 72 |
| Database tables | 5 new |
| API endpoints | 11 new |
| Type definitions | Yes |

---

## 🔗 API Endpoints Available

```
GET  /api/rooms                          # List all 12 rooms
GET  /api/rooms/:roomId                  # Get room with 6 stations
POST /api/room-progress                  # Track room visit
GET  /api/room-progress/:projectId       # Get visit history

POST /api/station-progress               # Save station work
GET  /api/station-progress/:projectId    # Get work history

POST /api/audio-assets                   # Create audio file
GET  /api/audio-assets/:projectId        # List audio files
```

---

## 🎬 Test Before Frontend Starts

```bash
# Test 1: All rooms exist
curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms

# Test 2: Welcome Hub ready
curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms/room_01

# Test 3: Sound Lab accessible
curl https://ashiakeyz-akfu-production.up.railway.app/api/rooms/sound-lab/by-slug

# Test 4: Station endpoint working
curl https://ashiakeyz-akfu-production.up.railway.app/api/stations/station_06_01
```

All should return 200 OK with JSON data.

---

## 📁 Where Everything Is

```
Database setup:
  /home/claude/ashiakeyz/migrations/001_add_room_system.sql
  /home/claude/ashiakeyz/migrations/002_seed_rooms_and_stations.sql
  /home/claude/ashiakeyz/scripts/init-rooms-database.sh

API code to integrate:
  /home/claude/ashiakeyz/akfu-backend-rooms.ts → copy endpoints

Type definitions:
  /home/claude/ashiakeyz/types/rooms.ts

Documentation:
  /home/claude/ashiakeyz/PHASE_1_BACKEND_SETUP_SUMMARY.md (detailed)
  /home/claude/ashiakeyz/WEEK_1_IMPLEMENTATION_GUIDE.md (day-by-day)
```

---

## ⚠️ Common Issues & Fixes

| Problem | Fix |
|---------|-----|
| Database locked | `killall sqlite3` then retry |
| Tables already exist | Script is safe to rerun (uses IF NOT EXISTS) |
| API returns 404 | Verify seeding: `SELECT COUNT(*) FROM akfu_rooms;` |
| "Unauthorized" error | Normal for endpoints requiring auth (add `-H "Authorization: Bearer token"`) |
| Can't find akfu-backend-rooms.ts | File created in same dir as akfu-backend.ts |

---

## ✅ Success Checklist

When all are green, you're ready for Week 2 frontend work:

- [ ] Database initialized (12 rooms verified)
- [ ] Endpoints integrated into akfu-backend.ts
- [ ] Backend deployed to Railway
- [ ] GET /api/rooms returns 12 rooms
- [ ] GET /api/rooms/room_06 returns Sound Lab
- [ ] All 5 test curls above return 200 OK
- [ ] No errors in Railway logs

---

## 📞 Key Contacts

**Backend deployed at:**  
`https://ashiakeyz-akfu-production.up.railway.app/`

**Current routes working:**
- `/api/projects` (existing)
- `/api/scripts` (existing)
- `/api/characters` (existing)
- `/api/rooms` ← NEW
- `/api/stations` ← NEW
- `/api/audio-assets` ← NEW

**Recommended testing order:**
1. Local test with `bun run akfu-backend.ts`
2. Deploy to Railway
3. Test production endpoints with curl
4. Signal frontend team that API is ready

---

## 🎯 Frontend Integration Points

Frontend needs to call:
1. `GET /api/rooms` on app load → get all 12 rooms
2. `GET /api/rooms/:roomId` when user clicks building → get room + 6 stations
3. `POST /api/room-progress` when entering room → record visit
4. `POST /api/station-progress` when completing station → save work
5. `POST /api/audio-assets` when audio generated → store asset reference

All require `Authorization: Bearer <JWT_TOKEN>` except rooms/stations read endpoints.

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Database init | 5 min |
| Integrate endpoints | 30 min |
| Deploy to Railway | 10 min |
| Test production | 5 min |
| **Total** | **~50 min** |

---

## 📋 After Deployment: Next Actions

1. Signal to frontend team: "API ready for integration"
2. Frontend team starts Week 2:
   - Next.js migration
   - Campus map component
   - Welcome Hub stations
   - Sound Lab + Suno/ElevenLabs
3. Daily sync on integration progress
4. Launch Phase 1 demo by end of Week 2

---

**🟢 Ready to go. Execute steps 1-3 above.**
