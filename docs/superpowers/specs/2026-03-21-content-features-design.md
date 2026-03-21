# Content Features Design Spec

**Date:** 2026-03-21
**Scope:** 4 new content features, each delivered as a separate PR in order

---

## Feature 1: M+ Leaderboard & Stats

### Overview

A Mythic+ leaderboard displayed on the home page alongside the raid progression box. Shows top runners with scores and per-dungeon best keys.

### Data Pipeline

- **New script:** `scripts/fetch-rio-data.js`
- **API:** Raider.IO public endpoints (no auth required)
  - Guild profile with M+ score data for members
  - Per-dungeon best keys derived from member runs
- **Output:** `src/data/rio-mythicplus.json`
- **Prebuild:** `node scripts/fetch-wcl-data.js && node scripts/fetch-rio-data.js`

### JSON Shape

```json
{
  "season": "TWW Season 2",
  "topRunners": [
    {
      "name": "Valorite",
      "class": "death-knight",
      "score": 2450,
      "topKeys": ["+12 Stonevault", "+11 Ara-Kara"]
    }
  ],
  "dungeonBests": [
    {
      "dungeon": "Stonevault",
      "level": 12,
      "timed": true,
      "team": ["Valorite", "Kiyanne"]
    }
  ]
}
```

### Component

- **`MythicPlusBox.vue`** — matches `RaidProgressionBox` info-box styling
- Top section: leaderboard of top ~10 runners, class-colored names, score badges
- Bottom section: per-dungeon grid with best timed key level
- Skeleton loader when data is empty (existing pattern)

### Placement

- Home page, below `RaidProgressionBox`, separated by `FadingDivider`

### Graceful Degradation

- Script writes empty JSON on API failure; component does not render if data is empty

---

## Feature 2: Fun Raid Stats (Most Deaths, Iron Raider, Biggest Hit)

### Overview

Three "award" cards on the home page showing fun stats derived from WCL data for the current raid tier.

### Data Pipeline

- **New script:** `scripts/fetch-wcl-stats.js`
- **Auth:** Reuses `WCL_CLIENT_ID` / `WCL_CLIENT_SECRET` env vars
- **WCL GraphQL queries:**
  - `table(dataType: Deaths)` per report — aggregates deaths per player
  - `table(dataType: DamageDone)` per report — finds highest single-hit damage
  - Iron Raider derived from players with 0 deaths across all attended reports
- **Output:** `src/data/wcl-stats.json`
- **Prebuild:** `node scripts/fetch-wcl-data.js && node scripts/fetch-rio-data.js && node scripts/fetch-wcl-stats.js`

### JSON Shape

```json
{
  "zone": "The Voidspire / The Dreamrift / March on Quel'Danas",
  "stats": {
    "mostDeaths": { "name": "Rhysanatic", "class": "warlock", "count": 47 },
    "ironRaider": { "name": "Valorite", "class": "death-knight", "raidsAttended": 12 },
    "biggestHit": {
      "name": "Snyxx",
      "class": "mage",
      "amount": 4520000,
      "ability": "Pyroblast",
      "boss": "Crown of the Cosmos"
    }
  }
}
```

### Component

- **`RaidStatsBox.vue`** — 3 compact award cards in a row
- Each card: label ("Most Deaths", "Iron Raider", "Biggest Hit"), player name in class color, stat value
- Styled consistently with info-box pattern

### Placement

- Home page, below M+ box, above "Latest Achievements", separated by `FadingDivider`

### Graceful Degradation

- Empty JSON on failure; component does not render

---

## Feature 3: Raid Tier Archive

### Overview

A historical timeline of past raid tiers grouped by expansion, showing progression summaries.

### Data

- **One-time script:** Fetches historical zone/report data from WCL to populate the static file
- **Static file:** `src/data/tier-history.js` — hand-curated from WCL one-time fetch output, sorted newest-first
- Current tier excluded (already shown live via progression box)

### Data Shape

```js
export const tierHistory = [
  {
    tier: 'Liberation of Undermine',
    expansion: 'The War Within',
    season: 'Season 1',
    dates: { start: '2025-03-04', end: '2025-09-01' },
    bosses: 8,
    progress: '8/8 Heroic',
    notable: 'AOTC + Glory of the Liberation Raider',
  },
]
```

### Component & Page

- **New route:** `/history`
- **`RaidHistoryView.vue`** — timeline grouped by expansion
- Expansion headers as section dividers, tiers listed with progress badges
- Difficulty colors reused from existing SCSS variables (rare/epic/legendary)

### Navigation

- Added to header nav and footer links

---

## Feature 4: In Memoriam

### Overview

A standalone, respectful memorial page for fallen guildmates.

### Data

- **Static file:** `src/data/in-memoriam.js`

### Data Shape

```js
export const memorials = [
  {
    name: 'Deamonflare',
    class: 'demon-hunter',
    server: 'Burning Legion',
  },
]
```

### Component & Page

- **New route:** `/in-memoriam`
- **`InMemoriamView.vue`** — minimal, respectful layout
- Dark, quiet styling — no hover effects, no flashy animations
- Character name in Demon Hunter class color, server name below
- Heading: "In Loving Memory", subtle divider
- Gentle fade-only scroll reveal (no slide)

### Navigation

- Footer only (not in header nav) — respectful, not competing with main sections

---

## PR Order

1. PR #1: M+ Leaderboard (script + component + home page integration)
2. PR #2: Fun Raid Stats (script + component + home page integration)
3. PR #3: Raid Tier Archive (one-time WCL fetch + static data + page + nav)
4. PR #4: In Memoriam (data file + page + footer link)

## Shared Patterns

- All build-time scripts follow the existing `fetch-wcl-data.js` pattern: write JSON, log summary, graceful empty fallback
- All components use `<script setup>`, scoped SCSS, existing design tokens
- All new pages use `useScrollReveal` composable
- No TypeScript — JSDoc annotations where needed
