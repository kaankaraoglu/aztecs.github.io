# Content Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add M+ leaderboard, fun raid stats, raid tier archive, and In Memoriam page to the guild website — all in a single PR.

**Architecture:** Four independent features share existing patterns: build-time data fetching (scripts write JSON consumed by components), Vue `<script setup>` with scoped SCSS, and `useScrollReveal` for animations. New home page sections stack below the existing progression box. Two new standalone pages get their own routes.

**Tech Stack:** Vue 3 (Composition API), Vite, SCSS, Raider.IO public API, WCL GraphQL API, Vitest

**Spec:** `docs/superpowers/specs/2026-03-21-content-features-design.md`

---

## File Map

### Feature 1: M+ Leaderboard

| Action | File                                    | Responsibility                                                    |
| ------ | --------------------------------------- | ----------------------------------------------------------------- |
| Create | `scripts/fetch-rio-data.js`             | Build-time script: fetch guild M+ data from Raider.IO, write JSON |
| Create | `src/data/rio-mythicplus.json`          | Empty default JSON (overwritten by script at build time)          |
| Create | `src/composables/useMythicPlus.js`      | Composable to read M+ JSON and expose reactive data               |
| Create | `src/components/MythicPlusBox.vue`      | Component: top runners leaderboard + per-dungeon bests grid       |
| Modify | `src/views/HomeView.vue`                | Add MythicPlusBox below RaidProgressionBox                        |
| Modify | `package.json:8`                        | Update prebuild to chain fetch-rio-data.js                        |
| Create | `src/data/__tests__/mythicplus.spec.js` | Data shape validation tests                                       |

### Feature 2: Fun Raid Stats

| Action | File                                   | Responsibility                                                   |
| ------ | -------------------------------------- | ---------------------------------------------------------------- |
| Create | `scripts/fetch-wcl-stats.js`           | Build-time script: fetch deaths/damage/iron raider from WCL      |
| Create | `src/data/wcl-stats.json`              | Empty default JSON                                               |
| Create | `src/composables/useRaidStats.js`      | Composable to read stats JSON                                    |
| Create | `src/components/RaidStatsBox.vue`      | Component: 3 award cards (Most Deaths, Iron Raider, Biggest Hit) |
| Modify | `src/views/HomeView.vue`               | Add RaidStatsBox below MythicPlusBox (extends Task 4 changes)    |
| Modify | `package.json:8`                       | Append fetch-wcl-stats.js to existing prebuild chain             |
| Create | `src/data/__tests__/wcl-stats.spec.js` | Data shape validation tests                                      |

### Feature 3: Raid Tier Archive

| Action | File                                      | Responsibility                                                    |
| ------ | ----------------------------------------- | ----------------------------------------------------------------- |
| Create | `scripts/fetch-wcl-history.js`            | One-time script (manual run): fetch historical zone data from WCL |
| Create | `src/data/tier-history.js`                | Static curated tier data grouped by expansion                     |
| Create | `src/views/RaidHistoryView.vue`           | Timeline page grouped by expansion                                |
| Modify | `src/router/index.js`                     | Add `/history` route                                              |
| Modify | `src/components/HeaderView.vue`           | Add "History" nav link                                            |
| Modify | `src/components/FooterView.vue`           | Add "History" footer link                                         |
| Create | `src/data/__tests__/tier-history.spec.js` | Data shape validation tests                                       |

### Feature 4: In Memoriam

| Action | File                                     | Responsibility                |
| ------ | ---------------------------------------- | ----------------------------- |
| Create | `src/data/in-memoriam.js`                | Static memorial data          |
| Create | `src/views/InMemoriamView.vue`           | Respectful memorial page      |
| Modify | `src/router/index.js`                    | Add `/in-memoriam` route      |
| Modify | `src/components/FooterView.vue`          | Add "In Memoriam" footer link |
| Create | `src/data/__tests__/in-memoriam.spec.js` | Data shape validation tests   |

---

## Task 1: Create empty default JSON files and branch

**Files:**

- Create: `src/data/rio-mythicplus.json`
- Create: `src/data/wcl-stats.json`

- [ ] **Step 1: Create feature branch**

```bash
git checkout -b feat/content-features
```

- [ ] **Step 2: Create empty default JSON for M+ data**

Create `src/data/rio-mythicplus.json`:

```json
{
  "season": null,
  "topRunners": [],
  "dungeonBests": []
}
```

- [ ] **Step 3: Create empty default JSON for raid stats**

Create `src/data/wcl-stats.json`:

```json
{
  "zone": null,
  "stats": {
    "mostDeaths": null,
    "ironRaider": null,
    "biggestHit": null
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add src/data/rio-mythicplus.json src/data/wcl-stats.json
git commit -m "chore: add empty default JSON for M+ and raid stats data"
```

---

## Task 2: Raider.IO fetch script

**Files:**

- Create: `scripts/fetch-rio-data.js`
- Modify: `package.json:8`

- [ ] **Step 1: Write fetch-rio-data.js**

Create `scripts/fetch-rio-data.js`. The script should:

1. Fetch `https://raider.io/api/v1/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=members` (no auth)
2. Extract members with `mythic_plus_scores_by_season[0].scores.all` > 0
3. Map each member to `{ name, class (kebab-case), score, topKeys (formatted strings) }`
4. Sort by score descending, take top 10 for `topRunners`
5. Iterate all members' best runs to find highest key per dungeon for `dungeonBests`
6. Write to `src/data/rio-mythicplus.json`
7. On failure, write the empty default and log warning (same pattern as `fetch-wcl-data.js`)

Class name mapping from Raider.IO format (e.g., `"Death Knight"`) to kebab-case (`"death-knight"`): `name.toLowerCase().replace(/\s+/g, '-')`

- [ ] **Step 2: Update prebuild in package.json**

Change line 8 in `package.json`:

```
"prebuild": "node scripts/fetch-wcl-data.js && node scripts/fetch-rio-data.js",
```

- [ ] **Step 3: Test locally**

```bash
node scripts/fetch-rio-data.js
```

Expected: `[rio] Wrote M+ data: N runners, N dungeons` or `[rio] Wrote empty M+ data (API unavailable)`

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-rio-data.js package.json
git commit -m "feat: add Raider.IO M+ data fetch script"
```

---

## Task 3: M+ composable and component

**Files:**

- Create: `src/composables/useMythicPlus.js`
- Create: `src/components/MythicPlusBox.vue`
- Create: `src/data/__tests__/mythicplus.spec.js`

- [ ] **Step 1: Write test for M+ data shape**

Create `src/data/__tests__/mythicplus.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import data from '../rio-mythicplus.json'

describe('M+ data', () => {
  it('has required top-level fields', () => {
    expect(data).toHaveProperty('season')
    expect(data).toHaveProperty('topRunners')
    expect(data).toHaveProperty('dungeonBests')
    expect(Array.isArray(data.topRunners)).toBe(true)
    expect(Array.isArray(data.dungeonBests)).toBe(true)
  })

  it('each runner has name, class, and score', () => {
    for (const runner of data.topRunners) {
      expect(runner).toHaveProperty('name')
      expect(runner).toHaveProperty('class')
      expect(runner).toHaveProperty('score')
    }
  })

  it('each dungeon best has dungeon and level', () => {
    for (const best of data.dungeonBests) {
      expect(best).toHaveProperty('dungeon')
      expect(best).toHaveProperty('level')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it passes with empty data**

```bash
npx vitest run src/data/__tests__/mythicplus.spec.js
```

Expected: PASS (empty arrays satisfy the for-loop tests)

- [ ] **Step 3: Write useMythicPlus composable**

Create `src/composables/useMythicPlus.js`:

```js
import mpData from '@/data/rio-mythicplus.json'

/**
 * @typedef {{ name: string, class: string, score: number, topKeys: string[] }} MpRunner
 * @typedef {{ dungeon: string, level: number, timed: boolean, team: string[] }} DungeonBest
 */

export function useMythicPlus() {
  const hasData = mpData.topRunners && mpData.topRunners.length > 0

  return {
    season: mpData.season,
    topRunners: mpData.topRunners,
    dungeonBests: mpData.dungeonBests,
    hasData,
  }
}
```

- [ ] **Step 4: Write MythicPlusBox.vue**

Create `src/components/MythicPlusBox.vue`. The component should:

- Accept no props (reads from composable)
- Render nothing if `!hasData`
- Top section: "Mythic+" heading, season label, list of top runners with class-colored names and score badges
- Bottom section: dungeon grid showing best key level per dungeon, with timed/untimed indicator
- Use `.info-box` and `.info-box--no-hover` classes
- Use SkeletonLoader pattern for loading state (not needed here since data is static JSON, but keep conditional render)
- Responsive: runners list is single column; dungeon grid uses `repeat(auto-fill, minmax(min(200px, 100%), 1fr))`
- Follow existing SCSS patterns: `@use '@/assets/styles/_variables.scss' as *`, `@use '@/assets/styles/_info-box.scss'`, `@use '@/assets/styles/tokens' as *`

- [ ] **Step 5: Commit**

```bash
git add src/data/__tests__/mythicplus.spec.js src/composables/useMythicPlus.js src/components/MythicPlusBox.vue
git commit -m "feat: add M+ leaderboard composable and component"
```

---

## Task 4: Integrate MythicPlusBox into HomeView

**Files:**

- Modify: `src/views/HomeView.vue`

- [ ] **Step 1: Add MythicPlusBox to HomeView**

In `src/views/HomeView.vue`:

1. Import `MythicPlusBox` component
2. Import `useMythicPlus` composable
3. Add between `RaidProgressionBox` and the "LATEST ACHIEVEMENTS" section:
   - `<FadingDivider />` (if M+ has data)
   - `<p class="section-label">MYTHIC+</p>` (if M+ has data)
   - `<MythicPlusBox />` wrapped in a `reveal` div

- [ ] **Step 2: Verify dev server renders correctly**

```bash
npm run dev
```

Open browser, verify M+ section appears below progression box (or doesn't if JSON is empty). Note: Raid Stats section won't exist yet — it's added in Task 6.

- [ ] **Step 3: Run lint and tests**

```bash
npx eslint . --max-warnings=0 && npm test
```

Expected: All pass, 0 warnings

- [ ] **Step 4: Commit**

```bash
git add src/views/HomeView.vue
git commit -m "feat: integrate M+ leaderboard into home page"
```

---

## Task 5: WCL stats fetch script

**Files:**

- Create: `scripts/fetch-wcl-stats.js`
- Modify: `package.json:8`

- [ ] **Step 1: Write fetch-wcl-stats.js**

Create `scripts/fetch-wcl-stats.js`. The script should:

1. Reuse auth pattern from `fetch-wcl-data.js`: same `getToken()`, `graphql()` helpers, same `GUILD_ID`, `CURRENT_ZONE_ID`, `TOKEN_URL`, `API_URL`, `CLASS_MAP` constants
2. Fetch all reports for the current zone (same query as fetch-wcl-data.js phase 1, `limit: 50`)
3. For each report, in batches of 3:
   a. Query `table(dataType: Deaths)` — accumulate per-player death counts
   b. Query `table(dataType: DamageDone)` — track highest single hit (amount, ability name, source name, source class)
4. For Iron Raider:
   a. Collect all player names that appear in ANY Deaths table (disqualified set)
   b. From kill fight rosters (fetched via `playerDetails` for kill fights), count appearances of players NOT in disqualified set
   c. Player with most kill appearances wins (min 3 kills to qualify)
5. Write to `src/data/wcl-stats.json`
6. On failure, write empty default

- [ ] **Step 2: Extend prebuild in package.json (append to Task 2's value)**

Change the prebuild line (already modified in Task 2) to add the stats script:

```
"prebuild": "node scripts/fetch-wcl-data.js && node scripts/fetch-rio-data.js && node scripts/fetch-wcl-stats.js",
```

- [ ] **Step 3: Test locally (requires WCL credentials)**

```bash
WCL_CLIENT_ID=xxx WCL_CLIENT_SECRET=xxx node scripts/fetch-wcl-stats.js
```

Expected: `[wcl-stats] Wrote stats: mostDeaths=X, ironRaider=X, biggestHit=X` or empty fallback

- [ ] **Step 4: Commit**

```bash
git add scripts/fetch-wcl-stats.js package.json
git commit -m "feat: add WCL fun raid stats fetch script"
```

---

## Task 6: Raid stats composable and component

**Files:**

- Create: `src/composables/useRaidStats.js`
- Create: `src/components/RaidStatsBox.vue`

- [ ] **Step 1: Write test for WCL stats data shape**

Create `src/data/__tests__/wcl-stats.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import data from '../wcl-stats.json'

describe('WCL stats data', () => {
  it('has required top-level fields', () => {
    expect(data).toHaveProperty('zone')
    expect(data).toHaveProperty('stats')
    expect(data.stats).toHaveProperty('mostDeaths')
    expect(data.stats).toHaveProperty('ironRaider')
    expect(data.stats).toHaveProperty('biggestHit')
  })

  it('mostDeaths has name, class, and count when present', () => {
    if (data.stats.mostDeaths) {
      expect(data.stats.mostDeaths).toHaveProperty('name')
      expect(data.stats.mostDeaths).toHaveProperty('class')
      expect(data.stats.mostDeaths).toHaveProperty('count')
    }
  })

  it('biggestHit has name, class, amount, ability, and boss when present', () => {
    if (data.stats.biggestHit) {
      expect(data.stats.biggestHit).toHaveProperty('name')
      expect(data.stats.biggestHit).toHaveProperty('amount')
      expect(data.stats.biggestHit).toHaveProperty('ability')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it passes with empty data**

```bash
npx vitest run src/data/__tests__/wcl-stats.spec.js
```

Expected: PASS (null stats skip conditional checks)

- [ ] **Step 3: Write useRaidStats composable**

Create `src/composables/useRaidStats.js` (follows same pattern as `useMythicPlus.js`):

```js
import statsData from '@/data/wcl-stats.json'

/**
 * @typedef {{ name: string, class: string, count: number }} DeathStat
 * @typedef {{ name: string, class: string, killsAttended: number }} IronRaiderStat
 * @typedef {{ name: string, class: string, amount: number, ability: string, boss: string }} BiggestHitStat
 * @typedef {{ mostDeaths: DeathStat|null, ironRaider: IronRaiderStat|null, biggestHit: BiggestHitStat|null }} RaidStats
 */

export function useRaidStats() {
  const stats = statsData.stats
  const hasData = !!(stats.mostDeaths || stats.ironRaider || stats.biggestHit)

  return {
    zone: statsData.zone,
    stats,
    hasData,
  }
}
```

- [ ] **Step 4: Write RaidStatsBox.vue**

Create `src/components/RaidStatsBox.vue`. The component should:

- Read from `useRaidStats()` composable
- Render nothing if `!hasData`
- 3 cards in a grid row (`grid-template-columns: repeat(3, 1fr)`, stacks to 1 column on tablet)
- Each card: `.info-box` styled, contains:
  - Label text ("Most Deaths", "Iron Raider", "Biggest Hit") in `$color-text-subtle`
  - Player name with dynamic `:class="stat.class"` for class color
  - Stat value: death count, kills attended, formatted damage amount
- Damage formatting helper: `formatDamage(n)` — returns "4.5M", "120K", etc.
- No hover effects on the cards (use `.info-box--no-hover`)

- [ ] **Step 5: Integrate into HomeView**

In `src/views/HomeView.vue` (already modified in Task 4 — extend below MythicPlusBox, before "LATEST ACHIEVEMENTS"):

1. Import `RaidStatsBox`
2. Import `useRaidStats` for `hasData` check
3. Add `<FadingDivider />` + `<p class="section-label">TIER STATS</p>` + `<RaidStatsBox />` (all conditional on `hasData`)

- [ ] **Step 6: Run lint and tests**

```bash
npx eslint . --max-warnings=0 && npm test
```

Expected: All pass

- [ ] **Step 7: Commit**

```bash
git add src/data/__tests__/wcl-stats.spec.js src/composables/useRaidStats.js src/components/RaidStatsBox.vue src/views/HomeView.vue
git commit -m "feat: add fun raid stats component to home page"
```

---

## Task 7: One-time WCL history fetch script

**Files:**

- Create: `scripts/fetch-wcl-history.js`

- [ ] **Step 1: Write fetch-wcl-history.js**

Create `scripts/fetch-wcl-history.js`. This is a one-time manual script (NOT run at build time). It should:

1. Reuse auth pattern from `fetch-wcl-data.js`
2. For expansion IDs 1–5 (Classic through TWW), query:
   ```graphql
   {
     worldData {
       expansion(id: N) {
         name
         zones {
           id
           name
           encounters {
             id
             name
           }
         }
       }
     }
   }
   ```
3. For each zone, query `reportData.reports(guildID: 18606, zoneID: Z, limit: 5)` to check if guild has reports
4. For zones with reports, count boss kills per difficulty from fight data
5. Output structured JSON to stdout:
   ```json
   { "expansion": "...", "zone": "...", "zoneId": N, "bossCount": N, "normalKills": N, "heroicKills": N, "mythicKills": N }
   ```
6. Implementer manually curates output into `src/data/tier-history.js`

- [ ] **Step 2: Test locally (requires WCL credentials)**

```bash
WCL_CLIENT_ID=xxx WCL_CLIENT_SECRET=xxx node scripts/fetch-wcl-history.js
```

Expected: JSON output to stdout showing historical zones and progression

- [ ] **Step 3: Commit**

```bash
git add scripts/fetch-wcl-history.js
git commit -m "feat: add one-time WCL history fetch script"
```

---

## Task 8: Tier history data file and tests

**Files:**

- Create: `src/data/tier-history.js`
- Create: `src/data/__tests__/tier-history.spec.js`

- [ ] **Step 1: Write test for tier history data shape**

Create `src/data/__tests__/tier-history.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { tierHistory } from '../tier-history.js'

describe('tier history data', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(tierHistory)).toBe(true)
    expect(tierHistory.length).toBeGreaterThan(0)
  })

  it('each tier has required fields', () => {
    for (const tier of tierHistory) {
      expect(tier).toHaveProperty('tier')
      expect(tier).toHaveProperty('expansion')
      expect(tier).toHaveProperty('bosses')
      expect(tier).toHaveProperty('progress')
    }
  })

  it('tiers are sorted newest first', () => {
    for (let i = 1; i < tierHistory.length; i++) {
      const prev = new Date(tierHistory[i - 1].dates.start)
      const curr = new Date(tierHistory[i].dates.start)
      expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime())
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/data/__tests__/tier-history.spec.js
```

Expected: FAIL — module not found

- [ ] **Step 3: Create tier-history.js with curated data**

Create `src/data/tier-history.js`. Populate with data from:

- Known kills in `src/data/kills.js` (Liberation of Undermine, Manaforge Omega, Ulduar, Obsidian Sanctum)
- Output from `fetch-wcl-history.js` if available
- At minimum, include the tiers that have kill screenshots as evidence

Each entry follows the spec shape:

```js
/**
 * @typedef {{
 *   tier: string,
 *   expansion: string,
 *   season?: string,
 *   dates: { start: string, end?: string },
 *   bosses: number,
 *   progress: string,
 *   notable?: string,
 * }} TierEntry
 */

/** @type {TierEntry[]} */
export const tierHistory = [
  // Sorted newest-first
]
```

Include entries for all tiers where the guild has documented activity. Use kills.js dates as reference points.

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/data/__tests__/tier-history.spec.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/tier-history.js src/data/__tests__/tier-history.spec.js
git commit -m "feat: add tier history data file with tests"
```

---

## Task 9: Raid History page and routing

**Files:**

- Create: `src/views/RaidHistoryView.vue`
- Modify: `src/router/index.js`
- Modify: `src/components/HeaderView.vue`
- Modify: `src/components/FooterView.vue`

- [ ] **Step 1: Create RaidHistoryView.vue**

Create `src/views/RaidHistoryView.vue`. The page should:

- Import `tierHistory` from `@/data/tier-history.js`
- Use `useScrollReveal` composable
- Group tiers by expansion using a computed property
- Render grouped timeline:
  - Each expansion as a section with heading styled like `.page-heading` from AboutView
  - Each tier as a card with: tier name, date range, progress badge, notable text (if any)
  - Progress badge uses difficulty colors: if progress includes "Mythic" → `$quality-legendary`, "Heroic" → `$quality-epic`, else → `$quality-rare`
- Use scoped SCSS with `@use` for variables, tokens, info-box
- Responsive: single column on mobile, cards can use the about-card pattern

- [ ] **Step 2: Add route to router**

In `src/router/index.js`:

1. Add lazy import: `const RaidHistoryView = () => import('@/views/RaidHistoryView.vue')`
2. Add route before the catch-all: `{ path: '/history', component: RaidHistoryView, meta: { title: 'Aztecs - Raid History' } }`

- [ ] **Step 3: Add nav links**

In `src/components/HeaderView.vue`, add a "History" `RouterLink` to the nav-links (between "Achievements" and "Raiding"):

```html
<RouterLink class="nav-link" to="/history" @click="menuOpen = false">History</RouterLink>
```

In `src/components/FooterView.vue`, add "History" link in the Quick Links nav:

```html
<RouterLink to="/history">History</RouterLink>
```

- [ ] **Step 4: Run lint and tests**

```bash
npx eslint . --max-warnings=0 && npm test
```

Expected: All pass

- [ ] **Step 5: Verify in dev server**

```bash
npm run dev
```

Navigate to `/history`, verify page renders with timeline content.

- [ ] **Step 6: Commit**

```bash
git add src/views/RaidHistoryView.vue src/router/index.js src/components/HeaderView.vue src/components/FooterView.vue
git commit -m "feat: add raid tier history page with navigation"
```

---

## Task 10: In Memoriam data file and tests

**Files:**

- Create: `src/data/in-memoriam.js`
- Create: `src/data/__tests__/in-memoriam.spec.js`

- [ ] **Step 1: Write test for In Memoriam data shape**

Create `src/data/__tests__/in-memoriam.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { memorials } from '../in-memoriam.js'

describe('in memoriam data', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(memorials)).toBe(true)
    expect(memorials.length).toBeGreaterThan(0)
  })

  it('each memorial has required fields', () => {
    for (const memorial of memorials) {
      expect(memorial).toHaveProperty('name')
      expect(memorial).toHaveProperty('class')
      expect(memorial).toHaveProperty('server')
      expect(typeof memorial.name).toBe('string')
      expect(typeof memorial.class).toBe('string')
      expect(typeof memorial.server).toBe('string')
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/data/__tests__/in-memoriam.spec.js
```

Expected: FAIL — module not found

- [ ] **Step 3: Create in-memoriam.js**

Create `src/data/in-memoriam.js`:

```js
/**
 * @typedef {{ name: string, class: string, server: string }} Memorial
 */

/** @type {Memorial[]} */
export const memorials = [
  {
    name: 'Deamonflare',
    class: 'demon-hunter',
    server: 'Burning Legion',
  },
]
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npx vitest run src/data/__tests__/in-memoriam.spec.js
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/in-memoriam.js src/data/__tests__/in-memoriam.spec.js
git commit -m "feat: add In Memoriam data file with tests"
```

---

## Task 11: In Memoriam page and routing

**Files:**

- Create: `src/views/InMemoriamView.vue`
- Modify: `src/router/index.js`
- Modify: `src/components/FooterView.vue`

- [ ] **Step 1: Create InMemoriamView.vue**

Create `src/views/InMemoriamView.vue`. The page should:

- Import `memorials` from `@/data/in-memoriam.js`
- Use `useScrollReveal` composable
- Layout:
  - Centered content, max-width similar to ContactView (~780px)
  - Heading: "In Loving Memory" — styled subtly, `$accent-color` but dimmer (lower opacity or use `$color-text-muted`)
  - Subtle `FadingDivider` below heading
  - Each memorial entry: character name in class color (`:class="memorial.class"`), server name below in `$color-text-subtle`
  - Generous whitespace (`$space-12` padding)
- Styling rules:
  - NO hover effects anywhere on the page
  - NO flashy animations — fade-only reveal (`opacity` transition, no `transform`)
  - Background: transparent (inherits page background)
  - No `.info-box` — use custom minimal styling
- Scoped SCSS with standard imports

- [ ] **Step 2: Add route to router**

In `src/router/index.js`:

1. Add lazy import: `const InMemoriamView = () => import('@/views/InMemoriamView.vue')`
2. Add route before the catch-all: `{ path: '/in-memoriam', component: InMemoriamView, meta: { title: 'Aztecs - In Memoriam' } }`

- [ ] **Step 3: Add footer link only**

In `src/components/FooterView.vue`, add "In Memoriam" link in the Quick Links nav (at the end):

```html
<RouterLink to="/in-memoriam">In Memoriam</RouterLink>
```

Do NOT add to HeaderView — this link lives in the footer only.

- [ ] **Step 4: Run lint and tests**

```bash
npx eslint . --max-warnings=0 && npm test
```

Expected: All pass

- [ ] **Step 5: Verify in dev server**

```bash
npm run dev
```

Navigate to `/in-memoriam`, verify page renders respectfully with Deamonflare's name in Demon Hunter purple.

- [ ] **Step 6: Commit**

```bash
git add src/views/InMemoriamView.vue src/router/index.js src/components/FooterView.vue
git commit -m "feat: add In Memoriam page with footer navigation"
```

---

## Task 12: Final verification and PR

- [ ] **Step 1: Run full lint**

```bash
npx eslint . --max-warnings=0
```

Expected: 0 warnings, 0 errors

- [ ] **Step 2: Run full test suite**

```bash
npm test
```

Expected: All tests pass

- [ ] **Step 3: Run production build**

```bash
npm run build
```

Expected: Build succeeds (prebuild scripts will run; M+ and WCL stats may write empty JSON if no credentials, which is fine)

- [ ] **Step 4: Push and create PR**

```bash
git push -u origin feat/content-features
gh pr create --title "Add M+ leaderboard, raid stats, tier history, and In Memoriam" --body "..."
```
