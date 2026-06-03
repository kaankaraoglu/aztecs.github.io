# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guild website for "Aztecs", a WoW Horde guild on Al'Akir (EU). Built with Vue 3 + Vite, deployed to GitHub Pages at **aztecs.se** via the `gh-pages` branch.

## Commands

```bash
npm run dev          # Start dev server (auto-fetches data first via predev hook)
npm run build        # Production build (copies index.html → 404.html for SPA routing)
npm run lint         # ESLint with auto-fix
npm run format       # Prettier format all files
npm run format:check # Check formatting (used in CI)
npm test             # Run all tests (vitest run)
npm run test:watch   # Watch mode
npx vitest run src/data/__tests__/kills.spec.js  # Run a single test file

npm run fetch-data   # Manually fetch all WCL/RIO data (writes JSON to src/data/)
```

CI enforces zero ESLint warnings: `npx eslint . --max-warnings=0`

Pre-commit hook runs lint-staged (Prettier + ESLint) on staged files.

Set `SKIP_DATA_FETCH=true` to skip the prebuild data fetch (done automatically in CI).

## Architecture

**Vue components use `<script setup>` (Composition API)** with SCSS scoped styles. No TypeScript — data files use JSDoc type annotations instead.

Path alias: `@` → `src/` (configured in both `vite.config.js` and `jsconfig.json`).

### Directory Structure

```
src/
├── assets/
│   ├── images/kills/       # Boss kill screenshots
│   └── styles/             # _variables.scss, _tokens.scss, _theme.scss, _info-box.scss
├── components/
│   ├── icons/              # RoleIcon.vue, DiscordIcon.vue
│   ├── next-tier/          # Signup feature: TierHeader, SignupForm, SignupTable,
│   │                       #   BuffCoverage, RoleBalance, FlexMythicReadiness
│   ├── ui/                 # Shadcn/Reka UI primitives (Alert, Dialog, Button,
│   │                       #   Card, Badge, Input, Progress, Switch, Table,
│   │                       #   Select, HoverCard, Skeleton)
│   ├── __tests__/          # Component unit tests
│   └── *.vue               # Layout/feature components (see list below)
├── composables/
│   ├── __tests__/          # Composable unit tests
│   └── *.js                # 9 composables (see list below)
├── data/
│   ├── __tests__/          # Data validation tests
│   ├── *.js                # Hand-written static data
│   └── *.json              # Build-time fetched data (git-committed)
├── lib/                    # Utility functions (e.g. cn() for class merging)
├── router/
│   ├── __tests__/          # Router tests
│   └── index.js            # Vue Router config
├── test/
│   └── setup.js            # Vitest global setup (stubs missing JSON files)
├── views/
│   ├── __tests__/          # View tests
│   └── *.vue               # 8 page-level views
├── App.vue                 # Root layout + page transitions + EmberParticles
├── firebase.js             # Firebase initialization
└── main.js                 # App entry point, lazy Firebase in prod

scripts/
├── load-env.js             # Lightweight .env loader (no deps)
├── wcl-api.js              # Shared WCL OAuth + GraphQL client, constants
├── fetch-wcl-data.js       # Raid progression from WCL → wcl-progression.json
├── fetch-rio-data.js       # M+ data from Raider.IO → rio-mythicplus.json
├── fetch-wcl-stats.js      # Raid stats from WCL → wcl-stats.json
└── fetch-wcl-history.js    # One-time manual script: historical kills to stdout

workers/
├── signup/                 # Discord OAuth + signup form API (signup.aztecs.se)
└── refresh/                # Rate-limited workflow dispatch trigger (refresh.aztecs.se)

.github/workflows/
├── ci.yml                  # PR: lint + test + build (parallel jobs)
├── deploy.yml              # Push to main: build → gh-pages
├── fetch-data.yml          # Cron every 30 min: fetch WCL/RIO data, commit if changed
└── refresh-data.yml        # Manual dispatch: re-triggers fetch-data.yml
```

### Views & Routing

All routes are lazy-loaded. Vue Router 5 with hash-based page transitions (fade + slide-up enter, fade exit).

| Route               | View              | Page Title                      |
| ------------------- | ----------------- | ------------------------------- |
| `/`                 | HomeView          | Aztecs - Horde Guild on Al'Akir |
| `/contact`          | ContactView       | Aztecs - Contact & Roster       |
| `/raiding`          | RaidingView       | Aztecs - Raiding                |
| `/achievements`     | AchievementsView  | Aztecs - Achievements           |
| `/about`            | AboutView         | Aztecs - About Us               |
| `/in-memoriam`      | InMemoriamView    | Aztecs - In Memoriam            |
| `/next-tier`        | NextTierView      | Aztecs - Next Tier Signups      |
| `/wow-kills`        | → `/achievements` | (redirect)                      |
| `/:pathMatch(.*)* ` | NotFoundView      | —                               |

The router also sets `<title>`, meta description, Open Graph tags, Twitter cards, and canonical URL on each navigation, and fires `page_view` analytics events.

### Components

**Layout**: `HeaderView.vue`, `FooterView.vue`, `App.vue`

**Home page**: `RaidProgressionBox.vue`, `MythicPlusBox.vue`, `RaidStatsBox.vue`, `MissingClassesBox.vue`, `KillCard.vue`, `RecruitmentBox.vue`

**Utility**: `InfoBox.vue` (card container), `ImageLightbox.vue` (kill screenshot modal), `RosterList.vue`, `FadingDivider.vue`, `EmberParticles.vue` (canvas animation), `RefreshDataButton.vue` (Turnstile + worker)

**Next-tier signup** (`components/next-tier/`): `TierHeader.vue`, `SignupForm.vue`, `SignupTable.vue`, `BuffCoverage.vue`, `RoleBalance.vue`, `FlexMythicReadiness.vue`

### Composables

| File                    | Purpose                                                                           |
| ----------------------- | --------------------------------------------------------------------------------- |
| `useProgression.js`     | Raid progression — reads `wcl-progression.json`, falls back to `progression.js`   |
| `useMythicPlus.js`      | M+ season/dungeon data from `rio-mythicplus.json`                                 |
| `useRaidStats.js`       | Deaths/DPS/healing records from `wcl-stats.json`                                  |
| `useBuffAnalysis.js`    | Computes covered vs. missing raid buffs + role counts from signups                |
| `useNextTierSignups.js` | Full signup flow: Discord OAuth, JWT, CRUD via signup worker API                  |
| `useAnalytics.js`       | Firebase Analytics wrapper — lazy, silent, no-ops outside production              |
| `useTheme.js`           | Dark/light theme toggle — persists to localStorage, sets `data-theme` on `<html>` |
| `useScrollReveal.js`    | IntersectionObserver-based scroll-triggered reveal animations                     |
| `useTiltEffect.js`      | 3D mouse-tilt effect (desktop only, respects `prefers-reduced-motion`)            |

### Data Flow for Raid Progression

Primary source is **Warcraft Logs**, fetched every 30 minutes by the `fetch-data.yml` GitHub Actions workflow (independent of deploy):

1. **`fetch-data.yml`** runs on a 30-minute cron schedule. Executes `scripts/fetch-wcl-data.js`, `scripts/fetch-rio-data.js`, and `scripts/fetch-wcl-stats.js`. If any data JSON files changed, commits and pushes to `main`, which triggers a deploy.
2. **`scripts/fetch-wcl-data.js`** authenticates with WCL OAuth2 (`WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` env vars), fetches zone encounters and guild reports, writes `src/data/wcl-progression.json`. Per boss: kill status per difficulty, kill date, pull count, best %, and full kill roster with player names/classes.
3. **`useProgression` composable** (`src/composables/useProgression.js`) reads the WCL JSON. Falls back to `src/data/progression.js` if WCL data is empty.

**When a new raid tier launches**, update `CURRENT_ZONE_ID` and `RAID_INSTANCE_ENCOUNTERS` in `scripts/fetch-wcl-data.js`. The zone ID can be found via the WCL GraphQL API: `{ worldData { expansion(id: N) { zones { id name } } } }`. If the new tier uses the **Mythic Flex** difficulty, also set `MYTHIC_FLEX = true` in the same file — this relabels the mythic tier as "MX" / "Mythic Flex" in the UI (same legendary colour) for that tier only; the underlying data still uses the `mythic` field.

The **RefreshDataButton** component in the progression header lets users trigger an on-demand data refresh via a Cloudflare Worker (`workers/refresh/`) that dispatches the `fetch-data.yml` GitHub Actions workflow. Requires `VITE_REFRESH_WORKER_URL` and `VITE_TURNSTILE_SITE_KEY` env vars.

### Data Flow for Kill Cards

`src/data/kills.js` is a static array of historical raid achievements with screenshots and rosters. Entries must be sorted newest-first (a test enforces this). Kill images are in `src/assets/images/kills/`.

### Static Data Files

| File                            | Purpose                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| `src/data/wow-classes.js`       | `WOW_CLASSES` (specs, buffs per class) and `RAID_BUFFS` catalog       |
| `src/data/progression.js`       | Static fallback raid data (used if WCL JSON is empty)                 |
| `src/data/kills.js`             | Historical boss kills with dates, rosters, screenshots (newest-first) |
| `src/data/in-memoriam.js`       | Memorial entries for departed guild members                           |
| `src/data/wcl-progression.json` | Build-time fetched — full WCL raid data                               |
| `src/data/rio-mythicplus.json`  | Build-time fetched — RIO M+ season data                               |
| `src/data/wcl-stats.json`       | Build-time fetched — aggregated raid statistics                       |

### Cloudflare Workers

#### Signup Worker (`workers/signup/`, deployed to `signup.aztecs.se`)

Discord OAuth + signup CRUD backed by Cloudflare KV (`SIGNUPS` namespace).

| Endpoint                     | Description                             |
| ---------------------------- | --------------------------------------- |
| `GET /auth/discord`          | Redirect to Discord OAuth               |
| `GET /auth/discord/callback` | Callback — issues JWT                   |
| `GET /api/config`            | Current tier config (id, name, isOpen)  |
| `PUT /api/admin/config`      | Update config (requires `ADMIN_SECRET`) |
| `GET /api/submissions`       | List all signups for current tier       |
| `PUT /api/submissions`       | Create/update signup (requires JWT)     |
| `DELETE /api/submissions`    | Remove signup (requires JWT)            |

Secrets (via `wrangler secret`): `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `JWT_SECRET`, `ADMIN_SECRET`, `FRONTEND_URL`

#### Refresh Worker (`workers/refresh/`, deployed to `refresh.aztecs.se`)

Rate-limited (600s) endpoint that verifies a Turnstile CAPTCHA then dispatches the `fetch-data.yml` workflow.

Secrets: `GITHUB_TOKEN` (fine-grained PAT with Actions:write), `TURNSTILE_SECRET`

### Styling

- Global SCSS variables and WoW class colors: `src/assets/styles/_variables.scss`
- Design tokens (transitions, easing, spacing): `src/assets/styles/_tokens.scss`
- Dark/light theme CSS custom properties: `src/assets/styles/_theme.scss`
- Shared card pattern: `src/assets/styles/_info-box.scss` (imported via `@use` in views that need it)
- WoW class colors (`.death-knight`, `.paladin`, etc.) and item quality colors (`.quality-epic`, `.quality-legendary`, etc.) are global classes defined in `_variables.scss`, used via dynamic `:class` bindings on player names
- Tailwind CSS 4 used alongside SCSS; scoped SCSS inside `.vue` files is the primary styling approach
- Theme controlled by `useTheme` composable: sets `data-theme` attribute on `<html>`, persists to localStorage, default is `dark`

### Firebase

Firebase Analytics is initialized in `src/main.js`, lazy-loaded only in production (via `requestIdleCallback`). Config comes from `VITE_FIREBASE_*` env vars (stored as GitHub secrets for CI). The `useAnalytics` composable wraps all calls — it silently no-ops in dev/test and never throws.

### Build & Bundle

- **Vite 8** with `@vitejs/plugin-vue`
- Firebase code split into its own chunk (`firebase.js`) to keep the main bundle lean
- Image optimization at build time: PNG/JPEG at 80%, WebP at 82% (via `vite-plugin-image-optimizer` + `sharp`)
- Bundle analysis: `dist/stats.html` generated by `rollup-plugin-visualizer`
- `postbuild` copies `dist/index.html` → `dist/404.html` for GitHub Pages SPA routing

### Testing

- **Framework**: Vitest 4 with jsdom environment
- **Setup**: `src/test/setup.js` stubs missing JSON data files so tests work without a data fetch
- 24 `.spec.js` files total:
  - `src/components/__tests__/` — 9 component tests
  - `src/composables/__tests__/` — 7 composable tests
  - `src/data/__tests__/` — 6 data validation tests (including sort-order enforcement for `kills.js`)
  - `src/router/__tests__/router.spec.js`
  - `src/views/__tests__/views.spec.js`

### Environment Variables

Build-time only (not exposed to browser):

- `WCL_CLIENT_ID`, `WCL_CLIENT_SECRET` — Warcraft Logs API credentials

Runtime (Vite `VITE_` prefix, exposed to browser):

- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_SIGNUP_WORKER_URL` — base URL for the signup Cloudflare Worker
- `VITE_REFRESH_WORKER_URL` — base URL for the refresh Cloudflare Worker
- `VITE_TURNSTILE_SITE_KEY` — Cloudflare Turnstile public key

CI build flag:

- `SKIP_DATA_FETCH=true` — skips the prebuild fetch (data already in repo)

### Deployment

PRs trigger `ci.yml` which runs lint, test, and build as 3 parallel jobs. Push to `main` triggers `deploy.yml` which builds (using committed data, no re-fetch) and pushes to `gh-pages`. Data is fetched independently by `fetch-data.yml` every 30 minutes — if data changed, it commits to `main` which triggers a deploy. Branch protection requires PRs for all changes to `main`; the `fetch-data.yml` workflow pushes data commits directly using a PAT.

### Key Dependencies

| Package                  | Version  | Purpose                               |
| ------------------------ | -------- | ------------------------------------- |
| vue                      | ^3.5.34  | Framework                             |
| vue-router               | ^5.0.7   | Routing                               |
| reka-ui                  | ^2.9.6   | Headless UI primitives (Shadcn-style) |
| @vueuse/core             | ^14.2.1  | Vue utility composables               |
| @lucide/vue              | ^1.16.0  | Icon library                          |
| tailwindcss              | ^4.2.4   | Utility CSS                           |
| firebase                 | ^12.13.0 | Analytics                             |
| class-variance-authority | ^0.7.1   | Component variant helpers             |
| tailwind-merge           | ^3.5.0   | Merge Tailwind classes safely         |

## Custom Instructions

Always check before you push to a branch to see if it is already merged or not. If so, open a new branch and PR.
Always open links with Firefox.

### PR Description Template

Use this exact format when creating pull requests via `gh pr create`:

```
## What

<one or two sentences: what changed and why>

## Type

- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Data / content update
- [ ] Docs
- [ ] CI / tooling

## How to verify

<numbered steps to confirm the change works — include route, component, or command>

1.
2.

## Notes

<trade-offs, follow-ups, caveats — omit section if nothing to add>
```

The same template lives in `.github/pull_request_template.md` and auto-populates GitHub's PR UI.
