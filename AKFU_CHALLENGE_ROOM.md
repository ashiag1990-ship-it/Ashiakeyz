# AKFU Challenge Room - 90-Day Creator Journey

**Status:** Feature Specification Ready for Implementation  
**Date:** October 12, 2026  
**Version:** 1.0 - Ashia Keyz Brand Adaptation

---

## 🎬 Feature Overview

The **Challenge Room** is an interactive, gamified learning experience where AKFU students commit to a structured 90-day journey to build their film production business from the ground up. Based on Jay Royale's proven monetization framework, adapted for film creators and integrated into the AKFU ecosystem.

### Why Challenge Room Matters

- **Structured Growth:** Clear 7-step framework removes guesswork
- **Community Accountability:** Testimonials and peer support drive completion
- **Gamification:** Scoring and badges celebrate progress
- **Measurable Results:** Track real metrics (followers, pitches, deals)
- **AKFU Integration:** Use generated content, manage providers, earn from affiliate links

---

## 📋 The 7-Step AKFU Creator Framework

### STEP 1: Define Your Studio
**Goal:** Clarify what you create and who you serve

**Questions to Answer:**
1. **What cinematic stories do you tell?**
   - Example: "I create short sci-fi narratives that explore AI ethics"
   - Sub-topics: Genre, format (shorts/features), style, tone

2. **Who is your ideal audience?**
   - Example: "Tech-savvy Gen Z, educators, AI enthusiasts"
   - Sub-topics: Demographics, interests, pain points, platform they consume on

3. **What transformation do you provide?**
   - Example: "I turn complex ideas into visually compelling stories that inspire thinking"
   - Sub-topics: The problem you solve, the result they get

**AKFU Connection:**
- Store studio profile in `akfu_challenges.studio_profile`
- Display on creator portfolio
- Reference when pitching to collaborators
- Share with community for testimonials

**Completion:** All 3 questions answered clearly (1-2 paragraphs each)

---

### STEP 2: Choose Your 3 Revenue Streams
**Goal:** Select which monetization paths align with your studio

**6 Available Pathways (Choose 3):**

1. **Sponsorship & Brand Partnerships**
   - Brands pay to feature products in your films
   - AKFU Track: Maintain sponsor contact list, track sponsorship value
   - Revenue Estimate: $500-5000 per short film

2. **Digital Downloads & Pre-Orders**
   - Sell your films on Gumroad, Patreon, Vimeo On Demand
   - AKFU Track: Store download links, track sales
   - Revenue Estimate: $100-2000 per film

3. **Creator Subscriptions**
   - Recurring revenue from fans on Patreon/YouTube Members
   - AKFU Track: Monthly recurring value, subscriber count
   - Revenue Estimate: $500-5000/month at scale

4. **Licensing Your Content**
   - License footage to other creators, productions, media companies
   - AKFU Track: Maintain asset library, licensing agreement tracker
   - Revenue Estimate: $200-2000 per license

5. **Teaching & Masterclasses**
   - Share your process via Skillshare, Udemy, or private workshops
   - AKFU Track: Course enrollment, student feedback
   - Revenue Estimate: $500-10000 per course launch

6. **Agency/Freelance Services**
   - Produce client films, motion graphics, trailers
   - AKFU Track: Client project management, invoice tracking
   - Revenue Estimate: $1000-50000 per client project

**Selection Process:**
- Read detailed breakdown for each pathway
- Select 3 that match your studio and skills
- For each: Set 90-day revenue goal
- Provide 1-2 sentence why you chose it

**AKFU Connection:**
- Store in `akfu_challenges.revenue_streams` (3 rows)
- Dashboard shows which streams are active
- Track actual revenue against projections
- Unlock relevant content library for each stream

**Completion:** 3 pathways selected with goals and reasoning

---

### STEP 3: Your 90-Day Action Plan
**Goal:** Break down your monetization into monthly milestones

**Month 1: Foundation**
- *Your Tasks:* What must happen first? (3-5 tasks)
  - Examples: "Finalize studio positioning," "Launch YouTube channel," "Reach out to 3 sponsors"
- *Content to Produce:* 1-2 pieces minimum
  - Could be: Short film, behind-the-scenes content, trailer
- *Metrics to Track:* What shows progress?
  - Examples: "5 followers," "1 potential sponsor identified," "1 video published"

**Month 2: Momentum**
- *Your Tasks:* Build on month 1 (3-5 tasks)
  - Examples: "Publish 2 more films," "Close 1 sponsorship," "Reach 100 followers"
- *Content to Produce:* 2-3 pieces
- *Metrics to Track:* Growth indicators
  - Examples: "50 new followers," "2 sponsorship conversations," "1000 video views"

**Month 3: Launch**
- *Your Tasks:* Convert interest into revenue (3-5 tasks)
  - Examples: "Close first sponsorship deal," "Launch first course," "Get 500 subscribers"
- *Content to Produce:* 2-3 pieces + launch premium content
- *Metrics to Track:* Revenue metrics
  - Examples: "First $1000 earned," "5 paying members," "2 licensing deals"

**AKFU Connection:**
- Store monthly breakdowns in `akfu_challenges.monthly_plans`
- Tasks linked to `akfu_challenges.tasks` (checkable)
- Content production tracked with generated videos
- Actual metrics vs. projected metrics in dashboard

**Completion:** All 3 months planned with realistic, specific tasks and metrics

---

### STEP 4: Your Reach-Out List
**Goal:** Identify 5 key people to build relationships with

**For Each Person:**

1. **Name & Title**
   - Example: "Sarah Chen, Producer at Wired Video"

2. **Why Them?**
   - Your connection to them or why they matter
   - Example: "Produces short-form sci-fi content, 500k followers"

3. **Your Ask**
   - What do you want from the relationship?
   - Example: "Collaboration on sponsored series" or "Share your process in their newsletter"

4. **When to Reach Out**
   - Month 1, 2, or 3? (strategic timing)

5. **Follow-Up Plan**
   - How will you stay top-of-mind?

**AKFU Connection:**
- Store in `akfu_challenges.reach_out_list`
- Track interaction status: Not Started, Reached Out, Responded, Meeting Scheduled, Partnership Active
- Set reminders for follow-up messages
- Log conversation notes

**Completion:** 5 people identified with detailed outreach strategy for each

---

### STEP 5: Your Weekly Rhythm
**Goal:** Create a sustainable production and outreach schedule

**Questions to Define:**

1. **Posting Frequency**
   - How often do you publish content?
   - Options: Daily, 3x/week, 2x/week, 1x/week, Bi-weekly
   - Your choice: ___
   - Commitment: "I will publish ___ pieces per week"

2. **Pitching Frequency**
   - How often do you reach out to sponsors, collaborators, or potential partners?
   - Options: 3x/week, 2x/week, 1x/week, Bi-weekly
   - Your choice: ___
   - Commitment: "I will pitch to ___ people per week"

3. **Follow-Up Day**
   - Which day of the week do you follow up with previous contacts?
   - Your choice: ___ (Monday/Tuesday/Wednesday/etc.)
   - Why: "Best response time is ___"

4. **Community Check-In Day**
   - Which day do you engage with your community?
   - Your choice: ___ (dedicated engagement day)
   - How: "I will respond to comments, DMs, and testimonials"

**AKFU Connection:**
- Store in `akfu_challenges.weekly_rhythm`
- Calendar integration: Mark posting days, pitching days
- Smart notifications: "Reminder: Today is your pitch day"
- Track adherence rate: "You posted on 80% of scheduled days"

**Completion:** Weekly schedule defined and committed to calendar

---

### STEP 6: Track Your Numbers
**Goal:** Create a simple tracking system to measure progress

**Key Metrics by Revenue Stream:**

**General Metrics (All Streams):**
- Monthly followers/subscribers
- Video views
- Engagement rate (comments, shares, likes)
- Visitors to your website/portfolio

**Sponsorship Track:**
- Brands contacted
- Sponsorship conversations active
- Sponsorship deals closed
- Total sponsorship revenue

**Digital Sales Track:**
- Films available for purchase
- Number of purchases
- Revenue from digital sales

**Creator Subscriptions Track:**
- Paying members/subscribers
- Monthly recurring revenue (MRR)
- Churn rate

**Licensing Track:**
- Footage library size
- Licensing inquiries
- Licenses completed
- Licensing revenue

**Teaching Track:**
- Course(s) created
- Enrollments
- Student satisfaction score
- Course revenue

**Freelance Track:**
- Client inquiries
- Active projects
- Completed projects
- Total client revenue

**AKFU Connection:**
- Dashboard displays all metrics in one view
- Real-time updates as you log activities
- Month-to-month comparison charts
- Goal vs. actual visualization
- Export reports for analysis

**Completion:** Choose tracking method (Google Sheets template provided, or AKFU dashboard), commit to updating weekly

---

### STEP 7: Your First Action (This Week)
**Goal:** Take the first concrete step within 7 days

**Choose ONE of these:**

1. **Create & Upload First Film**
   - Use AKFU to write, cast, produce, and generate your opening piece
   - Action: Complete first short film and publish

2. **Reach Out to First Contact**
   - Send a genuine message to one person on your reach-out list
   - Action: Write and send professional outreach email

3. **Launch Your Channel**
   - Set up YouTube, TikTok, or portfolio site
   - Action: Customize channel and upload first piece

4. **Secure First Sponsor**
   - Identify one brand that aligns with your content
   - Action: Research and send sponsorship proposal

5. **Build Your Subscriber Base**
   - Launch Patreon or YouTube Membership
   - Action: Create membership tiers and go live

6. **Create Course Template**
   - Outline first masterclass or online course
   - Action: Document your process for teaching

7. **Land First Client**
   - Identify someone who needs video services
   - Action: Send portfolio and pricing proposal

**Your Commitment:**
- Choose 1 action
- Set specific deadline (within 7 days)
- Public commitment (share with community)
- Check it off when complete

**AKFU Connection:**
- Task created in challenge tracker
- Visible to your accountability community
- Progress notification when completed
- Share success in testimonials section

**Completion:** First action committed and deadline set

---

## 🎮 Gamification System

### Scoring & Progression

**Challenge Completion Score: 100 Points Total**

- **Step 1 (Define Your Studio):** 10 points
- **Step 2 (Choose Revenue Streams):** 10 points
- **Step 3 (90-Day Plan):** 15 points
- **Step 4 (Reach-Out List):** 10 points
- **Step 5 (Weekly Rhythm):** 10 points
- **Step 6 (Track Numbers):** 15 points
- **Step 7 (First Action):** 20 points

**Bonus Points (Up to 30 additional):**

- Complete first month on schedule: +10 points
- Publish first film during challenge: +5 points
- First sponsorship/deal: +10 points
- Write testimonial for community: +5 points
- Help another creator: +5 points
- Reach first revenue milestone: +10 points

**Maximum Challenge Score: 130 points**

### Achievement Badges

1. **Studio Founder**
   - Earned: Complete Step 1 (Define Your Studio)
   - Displayed: On your AKFU profile

2. **Revenue Strategist**
   - Earned: Complete Step 2 (Choose Revenue Streams)
   - Displayed: Shows you have monetization strategy

3. **Plan Master**
   - Earned: Complete Step 3 (90-Day Plan)
   - Displayed: Commitment to timeline

4. **Network Builder**
   - Earned: Complete Step 4 (Reach-Out List)
   - Displayed: Show you're building relationships

5. **Discipline Keeper**
   - Earned: Complete Step 5 (Weekly Rhythm) and follow 80%+ of schedule for 30 days
   - Displayed: Shows consistency

6. **Data Tracker**
   - Earned: Complete Step 6 (Track Numbers) and log metrics weekly for 30 days
   - Displayed: You're measurement-focused

7. **First Mover**
   - Earned: Complete Step 7 (First Action) within 7 days
   - Displayed: You take action quickly

8. **Challenge Completer**
   - Earned: Finish all 7 steps
   - Displayed: Most prestigious badge, shows full commitment

9. **Revenue Achiever**
   - Earned: Generate your first revenue during challenge (any stream)
   - Displayed: Proof that framework works

10. **Community Champion**
    - Earned: Write 3+ testimonials helping other creators
    - Displayed: You lift others as you rise

### Progress Visualization

- **Step Progress Bar:** Visual showing 0-100% completion of all 7 steps
- **Monthly Milestone Tracker:** See your progress through months 1-3
- **Metric Dashboard:** Charts showing follower growth, engagement, revenue trajectory
- **Badge Display:** Show earned badges on profile
- **Leaderboard (Optional):** Community members who complete most quickly, earn most revenue, help most others

---

## 💬 Community Testimonials

### Why Testimonials Matter

Testimonials serve multiple purposes:
1. **Social Proof:** Help new creators believe they can succeed
2. **Community Support:** Create accountability and encouragement
3. **Shared Learning:** Document what actually works for others
4. **Motivation:** See real results from people like them

### Testimonial System

**Types of Testimonials:**

1. **Step Completion Stories**
   - Example: "I completed Step 1 and finally understood my unique positioning"
   - Length: 1-2 sentences
   - Posted: Upon completing each step

2. **Monthly Milestone Wins**
   - Example: "Month 1 complete! I published 4 films, reached 200 followers, and landed my first sponsor"
   - Length: 2-3 sentences with results
   - Posted: End of each month

3. **90-Day Success Stories**
   - Example: "I followed the challenge, and after 90 days I have 5000 followers, 2 active sponsorships, and earn $2000/month from digital sales"
   - Length: 3-5 sentences with specific numbers
   - Posted: After completing full 90-day challenge

4. **Breakthrough Moments**
   - Example: "The reach-out list made it so much easier to build relationships. My first partner is now a monthly collaborator"
   - Length: 2-3 sentences
   - Posted: Anytime (milestone achieved)

5. **Advice to Others**
   - Example: "If you're stuck on Step 2, focus on what you're ALREADY good at. Don't pick streams outside your expertise"
   - Length: 2-3 sentences
   - Posted: Tips/lessons learned

**How to Share Testimonial:**

1. Click "Share Testimonial" button in challenge
2. Select testimonial type
3. Write 1-5 sentences
4. Optionally: Upload a photo, include video (30-60 sec)
5. Post to challenge room community
6. Other creators can like, comment, share

**Testimonial Features:**

- **Filtering:** View testimonials by step, month, or type
- **Search:** Find testimonials by keyword ("sponsorship," "followers," etc.)
- **Trending:** See most liked/shared testimonials
- **Inspiration Feed:** Randomized testimonials as you work through challenge
- **Notifications:** Get alerted when someone comments on your testimonial

**Moderation:**

- Community testimonials require approval (48-hour review)
- Must be authentic (not spam, not false claims)
- AKFU reserves right to feature standout testimonials on main site
- Inappropriate posts removed (spam, self-promotion without context)

---

## 📊 AKFU Database Integration

### New Tables for Challenge Room

```sql
-- Challenge configurations and metadata
CREATE TABLE akfu_challenges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_type TEXT NOT NULL, -- "90day_creator"
  status TEXT NOT NULL, -- "not_started", "in_progress", "completed", "abandoned"
  
  -- Step 1: Studio Definition
  studio_name TEXT,
  studio_description TEXT,
  target_audience TEXT,
  transformation_provided TEXT,
  step_1_completed BOOLEAN DEFAULT FALSE,
  step_1_completed_at TIMESTAMP,
  
  -- Step 2: Revenue Streams
  step_2_completed BOOLEAN DEFAULT FALSE,
  step_2_completed_at TIMESTAMP,
  
  -- Step 3: 90-Day Plan
  step_3_completed BOOLEAN DEFAULT FALSE,
  step_3_completed_at TIMESTAMP,
  
  -- Step 4: Reach-Out List
  step_4_completed BOOLEAN DEFAULT FALSE,
  step_4_completed_at TIMESTAMP,
  
  -- Step 5: Weekly Rhythm
  posting_frequency TEXT, -- "daily", "3x_week", "2x_week", "weekly", "biweekly"
  pitching_frequency TEXT,
  followup_day TEXT, -- "monday", "tuesday", etc.
  checkin_day TEXT,
  step_5_completed BOOLEAN DEFAULT FALSE,
  step_5_completed_at TIMESTAMP,
  
  -- Step 6: Track Numbers
  step_6_completed BOOLEAN DEFAULT FALSE,
  step_6_completed_at TIMESTAMP,
  
  -- Step 7: First Action
  first_action_description TEXT,
  first_action_deadline TIMESTAMP,
  first_action_completed BOOLEAN DEFAULT FALSE,
  first_action_completed_at TIMESTAMP,
  step_7_completed BOOLEAN DEFAULT FALSE,
  step_7_completed_at TIMESTAMP,
  
  -- Scoring & Progress
  total_score INT DEFAULT 0,
  challenge_start_date TIMESTAMP,
  challenge_end_date TIMESTAMP,
  month_current INT DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);

-- Revenue streams selected by user
CREATE TABLE akfu_challenge_revenue_streams (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  stream_type TEXT NOT NULL, -- "sponsorship", "digital_sales", "subscriptions", "licensing", "teaching", "freelance"
  goal_revenue_90day DECIMAL(10, 2),
  reasoning TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);

-- Monthly action plans
CREATE TABLE akfu_challenge_monthly_plans (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  month INT NOT NULL, -- 1, 2, or 3
  
  tasks TEXT, -- JSON array of tasks
  content_to_produce TEXT, -- Description of what to create
  metrics_to_track TEXT, -- Key metrics for month
  
  month_completed BOOLEAN DEFAULT FALSE,
  month_completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);

-- Reach-out list entries
CREATE TABLE akfu_challenge_reachout_list (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_title TEXT,
  why_them TEXT,
  your_ask TEXT,
  outreach_month INT,
  followup_plan TEXT,
  
  status TEXT DEFAULT "not_started", -- "not_started", "reached_out", "responded", "meeting_scheduled", "partnership_active"
  interaction_notes TEXT, -- JSON array of interactions
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);

-- Tracked metrics and progress
CREATE TABLE akfu_challenge_metrics (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  tracking_month INT, -- 1, 2, 3, or "overall"
  metric_date DATE,
  
  -- General metrics
  followers_count INT,
  video_views INT,
  engagement_rate DECIMAL(5, 2),
  website_visitors INT,
  
  -- Revenue-specific metrics (depends on selected streams)
  sponsorship_conversations INT,
  sponsorship_deals_closed INT,
  sponsorship_revenue DECIMAL(10, 2),
  
  digital_sales_count INT,
  digital_sales_revenue DECIMAL(10, 2),
  
  subscribers_count INT,
  subscription_mrr DECIMAL(10, 2),
  
  licensing_deals INT,
  licensing_revenue DECIMAL(10, 2),
  
  course_enrollments INT,
  course_revenue DECIMAL(10, 2),
  
  client_projects_completed INT,
  client_revenue DECIMAL(10, 2),
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);

-- Community testimonials
CREATE TABLE akfu_challenge_testimonials (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  testimonial_type TEXT NOT NULL, -- "step_completion", "monthly_win", "success_story", "breakthrough", "advice"
  step_number INT, -- If step_completion, which step
  month_number INT, -- If monthly_win, which month
  
  content TEXT NOT NULL,
  video_url TEXT,
  image_url TEXT,
  
  status TEXT DEFAULT "pending", -- "pending", "approved", "featured", "rejected"
  likes INT DEFAULT 0,
  shares INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);

-- Achievement badges earned
CREATE TABLE akfu_challenge_badges (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  badge_type TEXT NOT NULL, -- "studio_founder", "revenue_strategist", "plan_master", etc.
  earned_at TIMESTAMP,
  displayed BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);

-- Challenge completion & scoring history
CREATE TABLE akfu_challenge_completion (
  id TEXT PRIMARY KEY,
  challenge_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  
  score_step_1 INT DEFAULT 0,
  score_step_2 INT DEFAULT 0,
  score_step_3 INT DEFAULT 0,
  score_step_4 INT DEFAULT 0,
  score_step_5 INT DEFAULT 0,
  score_step_6 INT DEFAULT 0,
  score_step_7 INT DEFAULT 0,
  
  bonus_month_1_on_time BOOLEAN DEFAULT FALSE,
  bonus_first_film BOOLEAN DEFAULT FALSE,
  bonus_first_sponsorship BOOLEAN DEFAULT FALSE,
  bonus_testimonial BOOLEAN DEFAULT FALSE,
  bonus_helped_others BOOLEAN DEFAULT FALSE,
  bonus_first_revenue BOOLEAN DEFAULT FALSE,
  
  total_score INT DEFAULT 0,
  
  final_stats TEXT, -- JSON with final metrics
  completion_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (challenge_id) REFERENCES akfu_challenges(id),
  FOREIGN KEY (user_id) REFERENCES akfu_users(id)
);
```

---

## 🔌 API Endpoints for Challenge Room

### Challenge Management

```
GET /api/challenges
- List all challenges available

POST /api/challenges/start
- Start new 90-day challenge
- Body: { challenge_type: "90day_creator" }
- Returns: challenge_id, start_date

GET /api/challenges/:challengeId
- Get challenge details and progress
- Returns: All steps, completion status, scores

PUT /api/challenges/:challengeId/step/:stepNumber
- Update a specific step
- Body: Step-specific data
- Returns: Updated step, score earned

GET /api/challenges/:challengeId/progress
- Get detailed progress dashboard
- Returns: Scores, badges, monthly progress, metrics

POST /api/challenges/:challengeId/complete
- Mark challenge as completed
- Returns: Final score, all earned badges, completion certificate
```

### Monthly Plans

```
POST /api/challenges/:challengeId/monthly-plans
- Create/update monthly plan
- Body: { month: 1-3, tasks: [...], content_to_produce: "", metrics_to_track: "" }
- Returns: Monthly plan with checkable tasks

GET /api/challenges/:challengeId/monthly-plans/:month
- Get specific month plan
- Returns: Tasks, content, metrics with progress

PUT /api/challenges/:challengeId/monthly-plans/:month/complete
- Mark month as completed
- Returns: Score bonus, month completion badge
```

### Reach-Out List

```
POST /api/challenges/:challengeId/reachout-list
- Add person to reach-out list
- Body: { contact_name, contact_title, why_them, your_ask, outreach_month, followup_plan }
- Returns: Contact entry with tracking ID

PUT /api/challenges/:challengeId/reachout-list/:contactId
- Update contact status or notes
- Body: { status: "reached_out|responded|meeting_scheduled|partnership_active", interaction_notes: "" }
- Returns: Updated contact entry

GET /api/challenges/:challengeId/reachout-list
- Get all contacts on reach-out list
- Returns: List sorted by outreach_month and status
```

### Metrics Tracking

```
POST /api/challenges/:challengeId/metrics
- Log metrics for the month
- Body: { tracking_month, followers_count, video_views, ..., notes }
- Returns: Metric entry with comparison to previous month

GET /api/challenges/:challengeId/metrics
- Get all logged metrics
- Query: ?month=1 or ?month=all
- Returns: Metrics with visualization data

GET /api/challenges/:challengeId/metrics/comparison
- Get month-to-month comparison
- Returns: Growth rate, trends, projections
```

### Testimonials

```
POST /api/challenges/:challengeId/testimonials
- Share a testimonial
- Body: { testimonial_type, step_number, month_number, content, video_url, image_url }
- Returns: Testimonial entry with moderation status

GET /api/challenges/:challengeId/testimonials
- Get community testimonials
- Query: ?type=step_completion&step=1 or ?month=1 or ?filter=trending
- Returns: Testimonials with likes, shares, user info

PUT /api/challenges/:challengeId/testimonials/:testimonialId/like
- Like a testimonial
- Returns: Updated like count

POST /api/challenges/:challengeId/testimonials/:testimonialId/comment
- Comment on a testimonial
- Body: { comment }
- Returns: Comment added, notification sent to author
```

### Badges & Achievements

```
GET /api/challenges/:challengeId/badges
- Get earned badges
- Returns: All badges earned with dates

GET /api/challenges/:challengeId/badges/available
- Get available badges (earned and not yet earned)
- Returns: All 10 badges with progress toward earning
```

### Completion & Scoring

```
GET /api/challenges/:challengeId/score
- Get current score breakdown
- Returns: Score by step, bonus points, total score

GET /api/challenges/:challengeId/completion-report
- Get final completion report
- Returns: Final score, all badges, stats, completion certificate
```

---

## 🎨 Frontend Components

### Pages

```
/campus/challenge-room
  ├── /challenge-room/overview          # Challenge intro & how to start
  ├── /challenge-room/my-challenge      # Main challenge dashboard
  ├── /challenge-room/step/:step        # Individual step (1-7)
  ├── /challenge-room/monthly/:month    # Monthly plan view
  ├── /challenge-room/progress          # Detailed progress dashboard
  ├── /challenge-room/metrics           # Metrics tracking view
  ├── /challenge-room/testimonials      # Community testimonials feed
  ├── /challenge-room/leaderboard       # Community rankings (optional)
  └── /challenge-room/completion        # Post-completion certificate & results
```

### Components

**Challenge Dashboard:**
- Step progress bar (0-7 steps, visual fill)
- Current month progress (1-3 months)
- Score display (current / 130 maximum)
- Earned badges section
- Next action button
- Monthly milestone cards
- Quick metric stats

**Step Component (for each of 7 steps):**
- Step header with number and title
- Description of step
- Input fields/forms specific to step
- Example/guidance content
- Save & next button
- Progress indicator
- Points earned display

**Monthly Plan View:**
- Month header (Month 1, 2, or 3)
- Task checklist (check off as you complete)
- Content production tracker
- Metrics input form
- Month completion button
- Bonus points preview

**Metrics Dashboard:**
- Selectable metric type (general, sponsorship, sales, etc.)
- Date input for metric entry
- Chart showing month-to-month growth
- Comparison vs. goals
- Trending indicators (↑↓)
- Export option

**Testimonials Feed:**
- Testimonial cards (author, type, content, video/image)
- Like and comment buttons
- Filter by type/month/step
- Search bar
- "Share Testimonial" button
- Trending section

**Progress Dashboard:**
- Large visual of 7 steps (pie chart or linear)
- Monthly milestone timeline
- Current score and breakdown by step
- Badges earned (with earned dates)
- Upcoming milestones
- Time remaining (if 90-day limit)

---

## 🎯 Integration with AKFU Ecosystem

### How Challenge Room Connects to Core Features

**1. Writers' Room**
- Tasks can link to script creation
- First action step often is "write opening scene"
- Showcase completed scripts as portfolio proof

**2. Casting Studio**
- Create characters needed for challenge films
- Build character library to showcase to sponsors
- Use casting tools to develop your directing eye

**3. Dressing Room**
- Design looks for your created content
- Develop visual brand consistency
- Showcase style in testimonials

**4. Soundstage**
- Generate the films mentioned in challenge milestones
- Track generated content as portfolio pieces
- Use generation to prove concept

**5. Provider Dashboard**
- Affiliate links for Higgsfield (video), Suno (music), ElevenLabs (voice)
- As students generate content, credits automatically deducted
- Show provider balances
- Earn affiliate commissions from other students signing up via their links

### Cross-Promotion

- **Main AKFU Dashboard:** "Start Your 90-Day Challenge" prominent card
- **Portfolio Pages:** Link to challenge completion certificate
- **Community Page:** Feature top testimonials and success stories
- **Email Sequences:** Drip content about challenge progress
- **Social Integration:** Easy share buttons for testimonials

---

## 📈 Success Metrics for Challenge Room

**Engagement:**
- % of users who start challenge
- % who complete each step
- % who complete full 90-day challenge
- Average time to completion
- Testimonials shared per challenge

**Business Results:**
- Revenue generated by challenge completers
- Content produced (number of films generated)
- Provider credits used (engagement with AKFU ecosystem)
- Affiliate signups attributed to challenge room

**Community:**
- Community testimonials shared
- Engagement on testimonials (likes, comments)
- Repeat participation (users doing multiple challenges)
- Creator retention rate

---

## 🚀 Implementation Roadmap

### Phase 1: Core Challenge (Week 1-2)
- [ ] Database tables created
- [ ] API endpoints for all steps
- [ ] Dashboard component
- [ ] Step completion flows
- [ ] Score tracking

### Phase 2: Metrics & Testimonials (Week 3)
- [ ] Metrics tracking UI
- [ ] Testimonials feature
- [ ] Moderation system
- [ ] Community feed

### Phase 3: Gamification (Week 4)
- [ ] Badge system
- [ ] Progress visualization
- [ ] Leaderboard (optional)
- [ ] Achievement notifications

### Phase 4: Integration & Polish (Week 5)
- [ ] Full ecosystem integration
- [ ] Email drip campaigns
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Launch to production

---

## ✨ Why This Matters for AKFU

The Challenge Room transforms AKFU from a tool platform into a **learning and growth platform**. It gives creators:

1. **Clear Path Forward:** No guessing what to do next
2. **Accountability:** Public commitment and community support
3. **Proof of Concept:** Real results within 90 days
4. **Community Belonging:** Success stories from people like them
5. **Tangible Results:** Revenue, followers, partnerships earned

This is the **transformation gateway** that turns students into successful creators and keeps them engaged with AKFU and its partners long-term.

---

*Challenge Room Feature Specification Complete*  
*Ready for Development - October 12, 2026*
