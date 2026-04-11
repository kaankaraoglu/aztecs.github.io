# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Guild website for "Aztecs", a WoW Horde guild on Al'Akir (EU). Built with Vue 3 + Vite, deployed to GitHub Pages at **aztecs.se** via the `gh-pages` branch.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build (also copies index.html → 404.html for SPA routing)
npm run lint         # ESLint with auto-fix
npm run format       # Prettier format all files
npm test             # Run all tests (vitest run)
npm run test:watch   # Watch mode
npx vitest run src/data/__tests__/kills.spec.js  # Run a single test file
```

CI enforces zero ESLint warnings: `npx eslint . --max-warnings=0`

Pre-commit hook runs lint-staged (Prettier + ESLint) on staged files.

## Architecture

**Vue components use `<script setup>` (Composition API)** with SCSS scoped styles. No TypeScript — data files use JSDoc type annotations instead.

### Data flow for raid progression

Primary source is **Warcraft Logs**, fetched at build time:

1. **`scripts/fetch-wcl-data.js`** runs as `prebuild` npm script. Authenticates with WCL OAuth2 (`WCL_CLIENT_ID`/`WCL_CLIENT_SECRET` env vars), fetches zone encounters and guild reports, writes `src/data/wcl-progression.json`. Per boss: kill status per difficulty, kill date, pull count, best %, and full kill roster with player names/classes.
2. **`useProgression` composable** (`src/composables/useProgression.js`) reads the WCL JSON. Falls back to `src/data/progression.js` if WCL data is empty.

**When a new raid tier launches**, update `CURRENT_ZONE_ID` and `RAID_INSTANCE_ENCOUNTERS` in `scripts/fetch-wcl-data.js`. The zone ID can be found via the WCL GraphQL API: `{ worldData { expansion(id: N) { zones { id name } } } }`.

Data freshness depends on deploy frequency — trigger a deploy after raid nights to refresh.

### Data flow for kill cards

`src/data/kills.js` is a static array of historical raid achievements with screenshots and rosters. Entries must be sorted newest-first (a test enforces this). Kill images are in `src/assets/images/kills/`.

### Styling

- Global SCSS variables and WoW class colors: `src/assets/styles/_variables.scss`
- Shared card pattern: `src/assets/styles/_info-box.scss` (imported via `@use` in views that need it)
- WoW class colors (`.death-knight`, `.paladin`, etc.) and item quality colors (`.quality-epic`, `.quality-legendary`, etc.) are global classes defined in `_variables.scss`, used via dynamic `:class` bindings on player names

### Firebase

Firebase Analytics is initialized in `src/main.js`, lazy-loaded only in production. Config comes from `VITE_FIREBASE_*` env vars (stored as GitHub secrets for CI).

### Deployment

PRs trigger `ci.yml` which runs lint, test, and build as 3 parallel jobs. Push to `main` triggers `deploy.yml` which builds and pushes to `gh-pages`. Branch protection requires PRs for all changes to `main`.

### Custom Instructions

Always check before you push to a branch to see if it is already merged or not. If so, open a new branch and PR.
Always open links with Firefox.
