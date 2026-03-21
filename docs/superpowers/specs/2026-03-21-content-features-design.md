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
  - `GET /api/v1/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=members` — returns guild members with `mythic_plus_scores_by_season` (includes `scores.all`, class, name, realm)
  - Per-member best runs are included in the guild members response when using `fields=members`
  - Per-dungeon bests derived by iterating members and tracking highest key per dungeon
- **Output:** `src/data/rio-mythicplus.json`
- **Prebuild:** Update `package.json` prebuild to: `node scripts/fetch-wcl-data.js && node scripts/fetch-rio-data.js`
- **Batching:** Raider.IO guild members endpoint returns all members in one call (no pagination needed for guilds under 500 members)

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
- **WCL GraphQL queries per report:**
  - `table(dataType: Deaths, fightIDs: [...])` — returns deaths per player with count
  - `table(dataType: DamageDone, viewBy: Source)` — returns damage events; filter for highest single-hit
  - Iron Raider: players appearing in kill rosters with 0 entries in the Deaths table
- **Batching:** Process reports in batches of 3 (2 queries per report = 6 calls/batch) to stay within WCL rate limit (~120 calls/min). Reuse the same OAuth token from `getToken()` pattern in existing script.
- **Scope:** Current zone only (same `CURRENT_ZONE_ID` / `GUILD_ID` as fetch-wcl-data.js)
- **Output:** `src/data/wcl-stats.json`
- **Prebuild:** Update to: `node scripts/fetch-wcl-data.js && node scripts/fetch-rio-data.js && node scripts/fetch-wcl-stats.js`

### JSON Shape

```json
{
  "zone": "The Voidspire / The Dreamrift / March on Quel'Danas",
  "stats": {
    "mostDeaths": { "name": "Rhysanatic", "class": "warlock", "count": 47 },
    "ironRaider": { "name": "Valorite", "class": "death-knight", "killsAttended": 12 },
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

### Stat Definitions

- **Most Deaths:** Player with highest total death count across all boss fights (kills and wipes) in current zone reports
- **Iron Raider:** Player with 0 deaths across ALL fights (kills and wipes) who appeared in the most boss kill fights. Determined by: (1) collect all player names from Deaths tables across all reports — these players are disqualified, (2) from remaining players, count how many kill fights each appeared in via playerDetails, (3) player with highest kill count wins. Minimum 3 kills to qualify.
- **Biggest Hit:** Highest single damage event by a player across all fights. Extracted from DamageDone table sorted by amount descending.

### Component

- **`RaidStatsBox.vue`** — 3 compact award cards in a row (stacks vertically on mobile)
- Each card: label ("Most Deaths", "Iron Raider", "Biggest Hit"), player name in class color, stat value
- Damage amounts formatted human-readable (e.g., "4.5M")
- Styled consistently with info-box pattern, responsive grid matching existing breakpoints

### Placement

- Home page, below M+ box, above "Latest Achievements", separated by `FadingDivider`

### Graceful Degradation

- Empty JSON on failure; component does not render

---

## Feature 3: Raid Tier Archive

### Overview

A historical timeline of past raid tiers grouped by expansion, showing progression summaries.

### Data

- **One-time script:** `scripts/fetch-wcl-history.js` (NOT run at build time, run manually once)
  - Uses WCL GraphQL: `worldData { expansion(id: N) { zones { id name encounters { id name } } } }` for each expansion ID (1–5)
  - For each zone found, queries `reportData.reports(guildID, zoneID, limit: 5)` to check if the guild raided there
  - For zones with reports, queries fights to determine kill counts per difficulty
  - Outputs raw JSON to stdout; implementer curates into static file
- **Static file:** `src/data/tier-history.js` — curated from one-time script output, sorted newest-first
- Current tier excluded (already shown live via progression box)
- Expansion names are hardcoded strings in the data file (not dynamically resolved)

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
- No TypeScript — JSDoc annotations for all new data types
- Player objects use consistent shape: `{ name, class }` minimum, with `class` in kebab-case matching `CLASS_MAP` in fetch-wcl-data.js
- New home page sections use `FadingDivider` between them and `.reveal` class for scroll animations
- Responsive breakpoints follow existing `@include tablet` / `@include mobile` pattern from tokens
