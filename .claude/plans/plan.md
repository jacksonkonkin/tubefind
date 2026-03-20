# TubeFind — YouTube Recommendation Filter App

## Requirements Spec (for ~8–9 Claude Code Sessions)

---

## Vision

A guided, 6-level filter funnel that narrows YouTube's massive catalog down to a personalized subset of videos. As users select filters at each level, the system **auto-suggests** the next filters based on patterns — the user just hits **Accept** or tweaks. The more someone uses it, the smarter those suggestions become, surfacing preferred options earlier in each list.

---

## Core Concept: The 6-Level Funnel

Each level asks one category of question. Selecting an answer at Level 1 reshapes what's offered at Level 2, and so on. By Level 6 the user has a tight, curated feed.

### Level 1 — Mood / Intent
> "What are you in the mood for?"

- Learn something new
- Be entertained
- Stay informed
- Get inspired / motivated
- Background noise / chill
- Deep dive into a topic

### Level 2 — Category / Domain
> Auto-suggested based on Level 1. Example: "Learn something new" → suggests Technology, Science, History, Cooking, Finance, Languages...

- 10–15 broad categories
- User picks 1–3
- System ranks suggestions by past usage

### Level 3 — Format / Style
> "How do you want it delivered?"

- Short-form (< 10 min)
- Long-form deep dive (30+ min)
- Podcast / conversation style
- Visual / cinematic
- Tutorial / step-by-step
- Commentary / reaction
- Documentary style

### Level 4 — Tone & Energy
> "What vibe?"

- Casual / funny
- Serious / academic
- Hype / high-energy
- Calm / meditative
- Raw / unfiltered
- Polished / professional

### Level 5 — Freshness & Popularity
> "New or proven?"

- Trending right now
- Published this week
- Hidden gems (< 10K views)
- All-time classics (high view count, older)
- From channels I've liked before
- No preference

### Level 6 — Creator Preferences
> "Any channel preferences?"

- Specific channels to include
- Specific channels to exclude
- Channel size preference (indie → mega)
- Language / region
- Subscriber range filter

---

## Smart Auto-Fill System

### How It Works
1. User picks a filter at the current level
2. System immediately **pre-selects** the most likely choice at the next level
3. Pre-selection is highlighted with an "Accept" button and a "Change" option
4. If user accepts → moves to next level instantly
5. If user changes → their new choice updates the learning model

### Learning / Priority Algorithm
- Store every completed funnel path as a session record
- Count frequency of each filter combination
- Weight recent sessions higher (exponential decay)
- On each level, sort options by: `score = frequency × recency_weight`
- Top-scored option becomes the auto-fill suggestion
- **Storage**: localStorage initially → optional account sync later

### Data Model (per session)
```json
{
  "id": "session_uuid",
  "timestamp": "2026-03-19T10:30:00Z",
  "selections": {
    "level_1": "learn",
    "level_2": ["technology", "science"],
    "level_3": "long_form",
    "level_4": "serious",
    "level_5": "hidden_gems",
    "level_6": { "channel_size": "indie", "language": "en" }
  },
  "videos_viewed": ["video_id_1", "video_id_2"],
  "satisfaction": null
}
```

---

## Results Page

After Level 6 the user sees a curated video feed:

- Grid or list of YouTube video cards (thumbnail, title, channel, views, duration)
- Pulled via YouTube Data API v3 search + filters
- "Refresh" to get new results with same filters
- "Tweak" to go back and adjust any single level
- "Save this filter set" to reuse later
- Optional: thumbs up/down on individual videos to refine future suggestions

---

## Technical Architecture

### Frontend
- **React** (single-page app)
- Tailwind CSS for styling
- Framer Motion for smooth level transitions
- Mobile-first responsive design

### State Management
- React Context or Zustand for filter state
- localStorage for learning data + saved filter sets

### API Integration
- **YouTube Data API v3** for video search
  - `search.list` with query, category, duration, order, publishedAfter
  - `videos.list` for detailed metadata
- API key stored in env variable
- Rate limit handling (quota: 10,000 units/day on free tier)

### Optional Backend (later sessions)
- Supabase or Firebase for user accounts + cross-device sync
- Store session history server-side for heavier ML-based recommendations
- Could add a simple collaborative filtering layer

---

## Claude Code Session Breakdown

### Session 1 — Project Setup + Level 1 UI
- Scaffold React + Tailwind + routing
- Build the funnel layout shell (progress bar, level container, transitions)
- Implement Level 1 (Mood/Intent) with card-based selection
- Mobile-responsive from the start

### Session 2 — Levels 2–4 UI
- Build Levels 2, 3, 4 with dynamic option rendering
- Wire up filter state so each level feeds into the next
- Add transition animations between levels

### Session 3 — Levels 5–6 UI + Filter Summary
- Build Levels 5 and 6
- Create a "Review Your Filters" summary step before results
- Add the ability to tap any level in the summary to jump back and edit

### Session 4 — YouTube API Integration
- Set up YouTube Data API v3 calls
- Map the 6-level filter selections → API query parameters
- Build the results page with video cards
- Handle loading, empty states, and API errors

### Session 5 — Auto-Fill / Smart Suggestion Engine
- Implement the session storage model (localStorage)
- Build the scoring algorithm (frequency × recency)
- Wire auto-suggestions into each level's UI
- Add the "Accept" / "Change" interaction pattern

### Session 6 — Learning Loop + Refinement
- Track which videos users actually click
- Add thumbs up/down on results to feed back into suggestions
- Improve scoring with engagement signals
- Add "Save filter set" feature

### Session 7 — Polish + Edge Cases
- Empty state designs
- Error handling and retry logic
- Keyboard navigation and accessibility
- Performance optimization (lazy loading, memoization)
- Smooth out all animations and transitions

### Session 8 — Analytics Dashboard
- Personal usage stats page (total sessions, videos viewed, feedback given)
- Filter preference breakdown (most-used moods, categories, formats)
- Feedback trends (thumbs up/down ratio over time)
- Suggestion accuracy metrics (how often auto-fill is accepted vs changed)
- Visual charts/graphs for key metrics
- Clear history / export data options

### Session 9 — Advanced Features
- "Quick Start" — one-tap to rerun your most common filter set
- Filter set sharing (URL-encoded or shareable link)
- Dark mode / light mode toggle
- Optional: channel search/autocomplete in Level 6

### Session 10 — Testing + Launch Prep
- End-to-end testing of the full funnel
- Cross-browser and mobile testing
- README and setup docs
- Deploy to Vercel / Netlify
- (Optional) Add Supabase auth for account-based sync

---

## Key UX Principles

1. **Speed over completeness** — Auto-fill means most sessions take < 30 seconds
2. **No dead ends** — Every filter combination must produce results; fall back to broader queries if needed
3. **Visible learning** — Show users that the app is getting smarter ("Based on your last 5 sessions...")
4. **Escape hatches** — Skip any level, reset all, or jump to results early
5. **Progressive disclosure** — Power users can expand more filters; casual users flow through quickly

---

## YouTube API Query Mapping (Reference)

| Filter Level | API Parameter(s) |
|---|---|
| Mood/Intent | `q` (search terms), `topicId` |
| Category | `videoCategoryId`, `q` refinement |
| Format/Style | `videoDuration` (short/medium/long) |
| Tone/Energy | `q` keyword modifiers |
| Freshness | `publishedAfter`, `order` (viewCount/date/relevance) |
| Creator Prefs | `channelId`, `relevanceLanguage`, `regionCode` |

---

## Future Ideas (Post-MVP)

- Collaborative filtering ("People with your taste also watch...")
- YouTube playlist export
- Watch history import to bootstrap learning
- Browser extension that adds a "TubeFind" button to youtube.com
- Integration with YouTube's Topics/Hashtags API
- AI-powered query generation (use an LLM to build better search queries from the filter set)