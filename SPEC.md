# TubeFind — Application Spec Sheet

> **Single source of truth for all development agents.**
> Every agent working on TubeFind MUST read this document before making changes.
> Last updated: 2026-03-20

---

## 1. Product Overview

**TubeFind** is a client-side React SPA that helps users discover YouTube videos through a 6-level guided filter funnel. It learns from user behavior over time via a weighted scoring algorithm, offering smart auto-fill suggestions that improve with each session.

**Core Loop:** Open app → Walk through 6 filter levels → View personalized YouTube results → Give feedback → Next session is smarter.

---

## 2. Tech Stack

| Layer         | Technology                                    |
|---------------|-----------------------------------------------|
| Framework     | React 19.2.4                                  |
| Routing       | React Router DOM 7.13.1                       |
| Build         | Vite 8.0.1                                    |
| Styling       | Tailwind CSS 4.2.2 (via `@tailwindcss/vite`)  |
| Animation     | Framer Motion 12.38.0                         |
| Icons         | Lucide React 0.577.0                          |
| Font          | Space Grotesk (Google Fonts, 400/500/600/700) |
| State Mgmt    | React Context + `useReducer`                  |
| Persistence   | Browser `localStorage`                        |
| External API  | YouTube Data API v3                           |
| Backend       | None (client-side only)                       |

**Environment Variables:**
- `VITE_YOUTUBE_API_KEY` — YouTube Data API v3 key (loaded via `import.meta.env`)

---

## 3. Architecture

### 3.1 Directory Structure
```
src/
├── main.jsx                          # Entry point (StrictMode → App)
├── App.jsx                           # BrowserRouter + Routes
├── index.css                         # Tailwind imports + theme vars + starfield
├── context/
│   ├── FilterContext.jsx             # Funnel state (useReducer)
│   └── ThemeContext.jsx              # Dark/light theme toggle
├── pages/
│   ├── FunnelPage.jsx                # Main funnel wizard (/ route)
│   ├── ResultsPage.jsx              # YouTube results (/results route)
│   └── AnalyticsPage.jsx            # Usage analytics (/analytics route)
├── components/
│   ├── ProgressBar.jsx              # Funnel step indicator
│   ├── LevelShell.jsx               # Wrapper for each funnel level
│   ├── FilterSummary.jsx            # Summary view after level 6
│   ├── SavePresetDialog.jsx         # Modal to name & save a preset
│   ├── SavedPresets.jsx             # List/load saved presets
│   ├── SuggestionBanner.jsx         # Auto-fill suggestion UI
│   └── levels/
│       ├── Level1Mood.jsx           # Mood/Intent selection
│       ├── Level2Category.jsx       # Category multi-select (1-3)
│       ├── Level3Format.jsx         # Format/Style selection
│       ├── Level4Tone.jsx           # Tone & Energy selection
│       ├── Level5Freshness.jsx      # Freshness & Popularity selection
│       ├── Level6Creator.jsx        # Channel size + language
│       └── PlaceholderLevel.jsx     # Fallback placeholder
├── services/
│   ├── youtube.js                   # YouTube API integration
│   ├── sessionHistory.js           # Session CRUD + scoring engine
│   ├── analytics.js                # Analytics computation + export
│   └── shareLink.js                # URL encode/decode for sharing
└── data/
    └── filterOptions.js             # All filter option definitions
```

### 3.2 Provider Hierarchy
```
<BrowserRouter>
  <ThemeProvider>          ← data-theme attribute + localStorage
    <FilterProvider>       ← useReducer for funnel state
      <Routes />
    </FilterProvider>
  </ThemeProvider>
</BrowserRouter>
```

### 3.3 Routes
| Path         | Page Component   | Purpose                        |
|--------------|------------------|--------------------------------|
| `/`          | `FunnelPage`     | 6-level filter funnel wizard   |
| `/results`   | `ResultsPage`    | YouTube search results display |
| `/analytics` | `AnalyticsPage`  | Search history & statistics    |

---

## 4. Data Models

### 4.1 Filter State (FilterContext)
```js
{
  currentLevel: 1,              // 1–7 (7 = summary view)
  selections: {
    level_1: null | string,     // mood ID: learn|entertain|inform|inspire|chill|deep_dive
    level_2: string[],          // 1–3 category names from categoryOptions[mood]
    level_3: null | string,     // format ID: short|long_form|podcast|visual|tutorial|commentary|documentary
    level_4: null | string,     // tone ID: casual|serious|hype|calm|raw|polished
    level_5: null | string,     // freshness ID: trending|this_week|hidden_gems|classics|liked_channels|no_preference
    level_6: {                  // creator preferences
      channel_size?: string,    // indie|mid|large|mega|any_size
      language?: string         // en|es|fr|de|ja|ko|pt|hi|zh|any
    }
  }
}
```

**Reducer Actions:** `SET_SELECTION`, `GO_TO_LEVEL`, `NEXT_LEVEL`, `PREV_LEVEL`, `RESET`

### 4.2 Session Object (localStorage: `tubefind_sessions`)
```js
{
  id: string,                    // crypto.randomUUID()
  timestamp: string,             // ISO 8601
  selections: { ... },          // Copy of filter state selections
  videos_viewed: string[],      // Video IDs the user clicked
  feedback: {                   // Per-video ratings
    [videoId]: 'up' | 'down'
  },
  satisfaction: null | number   // Overall session rating (not yet implemented)
}
```

### 4.3 Preset Object (localStorage: `tubefind_presets`)
```js
{
  id: string,                   // crypto.randomUUID()
  name: string,                 // User-given name
  createdAt: string,            // ISO 8601
  selections: { ... }           // Copy of filter state selections
}
```

### 4.4 Enriched Video Object (returned by youtube.js)
```js
{
  id: string,                   // YouTube video ID
  title: string,                // HTML-decoded title
  description: string,          // HTML-decoded description
  thumbnail: string,            // High/medium thumbnail URL
  channelTitle: string,
  channelId: string,
  publishedAt: string,          // ISO 8601
  statistics: {                 // From videos.list API
    viewCount: string,
    likeCount: string,
    commentCount: string
  },
  channel: {                    // From channels.list API
    subscriberCount: number
  }
}
```

---

## 5. The 6-Level Funnel

### Level 1 — Mood / Intent
- **Component:** `Level1Mood.jsx`
- **Selection type:** Single select
- **Options:** 6 moods, each with icon, neonColor, glowColor
- **Data source:** `moodOptions` in `filterOptions.js`

| ID          | Label                    |
|-------------|--------------------------|
| `learn`     | Learn something new      |
| `entertain` | Be entertained           |
| `inform`    | Stay informed            |
| `inspire`   | Get inspired             |
| `chill`     | Background noise / chill |
| `deep_dive` | Deep dive into a topic   |

### Level 2 — Category / Domain
- **Component:** `Level2Category.jsx`
- **Selection type:** Multi-select (1–3 picks)
- **Options:** 12 categories, dynamically filtered by Level 1 mood
- **Data source:** `categoryOptions[mood]` in `filterOptions.js`

### Level 3 — Format / Style
- **Component:** `Level3Format.jsx`
- **Selection type:** Single select
- **Options:** 7 formats with icons

| ID           | Label                    | API Effect          |
|--------------|--------------------------|---------------------|
| `short`      | Short-form               | videoDuration=short |
| `long_form`  | Long-form deep dive      | videoDuration=long  |
| `podcast`    | Podcast / conversation   | videoDuration=long + "podcast" keyword |
| `visual`     | Visual / cinematic       | videoDuration=medium + "cinematic" keyword |
| `tutorial`   | Tutorial / step-by-step  | videoDuration=medium + "tutorial" keyword |
| `commentary` | Commentary / reaction    | videoDuration=medium + "commentary" keyword |
| `documentary`| Documentary style        | videoDuration=long + "documentary" keyword |

### Level 4 — Tone & Energy
- **Component:** `Level4Tone.jsx`
- **Selection type:** Single select
- **Options:** 6 tones, each mapped to query keyword modifiers

| ID         | Query Keywords           |
|------------|--------------------------|
| `casual`   | funny casual             |
| `serious`  | educational academic     |
| `hype`     | hype exciting            |
| `calm`     | calm relaxing            |
| `raw`      | raw unfiltered           |
| `polished` | professional high quality|

### Level 5 — Freshness & Popularity
- **Component:** `Level5Freshness.jsx`
- **Selection type:** Single select
- **Options:** 6 options affecting `order` and `publishedAfter` API params

| ID              | API order    | publishedAfter      | Post-filter      |
|-----------------|--------------|---------------------|------------------|
| `trending`      | `viewCount`  | 7 days ago          | —                |
| `this_week`     | `date`       | 7 days ago          | —                |
| `hidden_gems`   | `relevance`  | —                   | viewCount < 10K  |
| `classics`      | `viewCount`  | —                   | —                |
| `liked_channels`| —            | —                   | (history-based)  |
| `no_preference` | `relevance`  | —                   | —                |

### Level 6 — Creator Preferences
- **Component:** `Level6Creator.jsx`
- **Selection type:** Two sub-selections (channel size + language)

**Channel sizes** (post-filter by subscriber count):
| ID        | Range              |
|-----------|--------------------|
| `indie`   | 0–100K             |
| `mid`     | 100K–1M            |
| `large`   | 1M–10M             |
| `mega`    | 10M+               |
| `any_size`| No filter           |

**Languages** (maps to `relevanceLanguage` API param):
`en`, `es`, `fr`, `de`, `ja`, `ko`, `pt`, `hi`, `zh`, `any`

### Level 7 — Summary (FilterSummary)
- **Component:** `FilterSummary.jsx`
- Shows all selections with edit buttons per level
- "Find Videos" triggers search and navigates to `/results`
- Option to save selections as a preset

---

## 6. YouTube API Integration (`youtube.js`)

### Endpoints Used
1. **`search.list`** — Primary video search
   - `part=snippet`, `type=video`, `maxResults=12`
   - Query built from mood keywords + categories + format keyword + tone keyword
   - Filtered by `videoDuration`, `order`, `publishedAfter`, `relevanceLanguage`

2. **`videos.list`** — Fetch video statistics
   - `part=statistics` for viewCount, likeCount, commentCount

3. **`channels.list`** — Fetch channel statistics
   - `part=statistics` for subscriberCount

### Search Flow
1. Build query string from levels 1–4 selections
2. Build search params including levels 3, 5, 6 API filters
3. Execute search → if 0 results, retry with **broad mode** (drops format/tone keywords, removes date/duration filters)
4. Fetch video stats + channel details in parallel
5. Merge into enriched video objects
6. Apply **post-filters**: hidden gems (< 10K views), channel size (subscriber range)
7. If post-filtering removes everything, return unfiltered results

### Error Handling
- Missing/invalid API key → throws descriptive error
- API HTTP errors → throws with YouTube error message
- Supports `AbortSignal` for request cancellation

---

## 7. Smart Suggestion Engine (`sessionHistory.js`)

### Scoring Algorithm
For each past session matching current selections:
```
score = frequency × recencyWeight × engagementWeight
```

**Recency weight** (exponential decay, 14-day half-life):
```
recencyWeight = 0.5 ^ (ageDays / 14)
```

**Engagement weight** (based on user interactions):
```
weight = 1.0 + (clicks × 0.1) + (thumbsUp × 0.3) - (thumbsDown × 0.2)
minimum = 0.1
```

### Matching Logic
- Filters past sessions that match all preceding level selections
- Level 2: requires at least one overlapping category
- Level 6: scored independently for channel_size and language
- Returns highest-scoring option for the current level

### Quick Start
- Finds the most common complete filter set (levels 1–5)
- Grouped by fingerprint, scored by recency + engagement
- Allows instant replay of favorite filter combos

---

## 8. Persistence Layer

### localStorage Keys
| Key                 | Data Type   | Purpose                    |
|---------------------|-------------|----------------------------|
| `tubefind_sessions` | JSON array  | All completed sessions     |
| `tubefind_presets`  | JSON array  | Saved filter presets       |
| `tubefind_theme`    | string      | `"dark"` or `"light"`     |

### Quota Handling
- On `localStorage` full: auto-trims to most recent 10 sessions
- If still full: fails silently (no data loss of existing data)

---

## 9. Sharing System (`shareLink.js`)

### URL Parameter Mapping
| Selection   | URL Param | Example                 |
|-------------|-----------|-------------------------|
| `level_1`   | `mood`    | `?mood=learn`          |
| `level_2`   | `cats`    | `&cats=Science,History`|
| `level_3`   | `format`  | `&format=tutorial`     |
| `level_4`   | `tone`    | `&tone=casual`         |
| `level_5`   | `fresh`   | `&fresh=trending`      |
| `level_6.channel_size` | `size` | `&size=mid`    |
| `level_6.language`     | `lang` | `&lang=en`     |

Shareable URLs point to `/results?<params>` and reconstruct selections on load.

---

## 10. Analytics Dashboard (`analytics.js` + `AnalyticsPage.jsx`)

### Computed Metrics
- **Overview:** total sessions, total videos viewed, total feedback count, thumbs up/down counts, thumbs-up rate %
- **Preference breakdowns:** frequency counts for moods, categories, formats, tones, freshness
- **Feedback trend:** 14-day daily buckets of thumbs up/down counts
- **Session activity:** 14-day daily session counts
- **Export:** Download all session data as `tubefind-history-{date}.json`

---

## 11. Theming & Visual Design

### Theme System
- **Default:** Dark theme with deep space aesthetic
- **Toggle:** Sun/Moon button in header, persisted to `tubefind_theme`
- **Mechanism:** `data-theme` attribute on `<html>`, CSS variable overrides

### Design Language
- **Surface:** Dark mode `#0b0e1a`, glassmorphism cards (`.glass-card`)
- **Starfield:** CSS box-shadow dots on body (hidden in light mode)
- **Neon accents:** 6 colors used on filter option cards (blue, pink, orange, purple, green, cyan)
- **Each option** has `neonColor` (border/text) and `glowColor` (hover shadow)
- **Animations:** Framer Motion for page transitions, card interactions, level transitions
- **Font:** Space Grotesk (400/500/600/700)
- **Responsive:** Mobile-first design

---

## 12. Header & Navigation

- **Logo:** Play icon + "TubeFind" text
- **Theme toggle:** Sun/Moon icon button
- **Analytics link:** Bar chart icon, navigates to `/analytics`
- **Start over:** Reset button, visible when past level 1, dispatches `RESET` action

---

## 13. Component Contracts

### LevelShell
Wrapper for every funnel level. Provides consistent layout, back button, and level label.

### ProgressBar
Visual indicator of funnel progress (current level out of 6).

### SuggestionBanner
Shown when the suggestion engine has a recommendation. Displays suggested option with "Accept" (instant advance) and "Change" (manual selection) actions.

### SavePresetDialog
Modal dialog: text input for preset name + save/cancel buttons. Calls `savePreset()` from sessionHistory.

### SavedPresets
Displayed on Level 1. Lists saved presets with load and delete actions. Loading a preset populates all selections and jumps to summary.

### FilterSummary
Shown at level 7 (after all 6 levels). Displays all selections grouped by level with edit buttons. Contains "Find Videos" CTA and "Save as Preset" option.

---

# Agent Work Sections

The spec above is divided into the following independent work domains.
Each section can be tackled by a separate agent with the appropriate skill set.

---

## AGENT DOMAIN A: Funnel UI & Interactions
**Scope:** Everything the user sees and touches during the 6-level filter flow.

**Files owned:**
- `src/pages/FunnelPage.jsx`
- `src/components/ProgressBar.jsx`
- `src/components/LevelShell.jsx`
- `src/components/FilterSummary.jsx`
- `src/components/SuggestionBanner.jsx`
- `src/components/SavePresetDialog.jsx`
- `src/components/SavedPresets.jsx`
- `src/components/levels/Level1Mood.jsx`
- `src/components/levels/Level2Category.jsx`
- `src/components/levels/Level3Format.jsx`
- `src/components/levels/Level4Tone.jsx`
- `src/components/levels/Level5Freshness.jsx`
- `src/components/levels/Level6Creator.jsx`
- `src/components/levels/PlaceholderLevel.jsx`

**Skills required:** React components, Framer Motion animations, Tailwind CSS, UX/accessibility
**Depends on:** Domain C (FilterContext API), Domain D (filter option data)
**Key constraints:** Mobile-first, < 30 sec session target, glassmorphism + neon design system

---

## AGENT DOMAIN B: YouTube API & Search
**Scope:** All YouTube Data API integration, query building, result enrichment, and post-filtering.

**Files owned:**
- `src/services/youtube.js`

**Skills required:** REST API integration, query optimization, error handling, AbortController
**Depends on:** Domain D (filter option mappings for query construction)
**Key constraints:** Max 12 results per search, broad fallback on 0 results, graceful post-filter fallback, HTML entity decoding

---

## AGENT DOMAIN C: State Management & Data Flow
**Scope:** React Context providers, reducer logic, and application-wide state.

**Files owned:**
- `src/context/FilterContext.jsx`
- `src/context/ThemeContext.jsx`
- `src/App.jsx`
- `src/main.jsx`

**Skills required:** React Context, useReducer, React Router, provider composition
**Depends on:** Nothing (foundational layer)
**Key constraints:** Level range 1–7 (7 = summary), reducer must be pure, memoized callbacks

---

## AGENT DOMAIN D: Data & Configuration
**Scope:** All filter option definitions, mappings, and static data that drives the funnel.

**Files owned:**
- `src/data/filterOptions.js`
- `src/services/shareLink.js`

**Skills required:** Data modeling, URL encoding/decoding, icon mapping
**Depends on:** Lucide React icon library
**Key constraints:** Category options keyed by mood, all options need id/label/description/icon/neonColor, URL params must round-trip losslessly

---

## AGENT DOMAIN E: Persistence & Intelligence Engine
**Scope:** localStorage CRUD, session tracking, scoring algorithm, suggestion engine, preset management.

**Files owned:**
- `src/services/sessionHistory.js`

**Skills required:** Algorithm design, localStorage management, statistical scoring
**Depends on:** Nothing (pure data layer)
**Key constraints:** 14-day recency half-life, engagement weighting formula, localStorage quota handling, Quick Start fingerprinting

---

## AGENT DOMAIN F: Analytics & Reporting
**Scope:** Analytics computation, dashboard UI, data export.

**Files owned:**
- `src/services/analytics.js`
- `src/pages/AnalyticsPage.jsx`

**Skills required:** Data aggregation, chart/visualization rendering, file download API
**Depends on:** Domain E (loadSessions), Domain D (option labels for display)
**Key constraints:** 14-day rolling window for trends, export as JSON, preference breakdowns sorted by frequency

---

## AGENT DOMAIN G: Results Page & Video Display
**Scope:** Search results display, video cards, feedback UI, sharing.

**Files owned:**
- `src/pages/ResultsPage.jsx`

**Skills required:** React components, video card design, feedback interactions, clipboard API
**Depends on:** Domain B (searchVideos API), Domain E (session tracking, feedback), Domain D (shareLink)
**Key constraints:** Grid/list layout, video click tracking, thumbs up/down feedback, share URL generation

---

## AGENT DOMAIN H: Theming & Global Styles
**Scope:** CSS architecture, theme variables, starfield effect, glassmorphism, responsive design.

**Files owned:**
- `src/index.css`
- `index.html`

**Skills required:** Tailwind CSS 4, CSS custom properties, responsive design, accessibility
**Depends on:** Nothing (foundational layer)
**Key constraints:** Dark-first design, `data-theme` toggle mechanism, Space Grotesk font, neon color palette, `.glass-card` pattern

---

## Cross-Domain Dependency Graph
```
        ┌─────────┐
        │ H: Theme│
        └────┬────┘
             │ (CSS vars)
     ┌───────┼───────────────────┐
     ▼       ▼                   ▼
┌─────────┐ ┌──────────┐  ┌──────────┐
│C: State │ │D: Data   │  │E: Persist│
└────┬────┘ └────┬─────┘  └────┬─────┘
     │           │              │
     ▼           ▼              ▼
┌─────────┐ ┌──────────┐  ┌──────────┐
│A: Funnel│ │B: YouTube│  │F: Analtic│
│   UI    │ │   API    │  │ Dashboard│
└─────────┘ └────┬─────┘  └──────────┘
                  │
                  ▼
            ┌──────────┐
            │G: Results│
            │   Page   │
            └──────────┘
```

**Build order (if starting from scratch):** H → C → D → E → B → A → G → F
