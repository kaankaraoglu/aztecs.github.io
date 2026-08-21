<!-- markdownlint-disable-file MD041 no-emphasis-as-heading -->
<!-- markdownlint-disable-file MD033 -->

<div align="center">

# ⚔️ `aztecs.github.io`

**Guild website for Aztecs — an established Horde guild on Al'Akir (EU) since 2005**

[![PR Checks](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/ci.yml)
[![Build & Deploy](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/deploy.yml)
[![Fetch Data](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/fetch-data.yml/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/fetch-data.yml)
[![GitHub Pages](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/pages/pages-build-deployment)

![Vue](https://img.shields.io/badge/Vue%203-4FC08D?logo=vuedotjs&logoColor=fff)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=fff)
![Node 22](https://img.shields.io/badge/Node-22-339933?logo=nodedotjs&logoColor=fff)
![Vitest](https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=fff)
![Cloudflare Workers](https://img.shields.io/badge/CF%20Workers-F38020?logo=cloudflareworkers&logoColor=fff)

[**aztecs.se**](https://aztecs.se)

</div>

---

## Overview

Raiding, Mythic+, and good times. The site features live raid progression pulled from [Warcraft Logs](https://www.warcraftlogs.com/), Mythic+ data from [Raider.IO](https://raider.io/), historical kill screenshots with rosters, guild info, and more.

**Key features:**

- **Live raid progression** — per-boss kill status, pull counts, best %, and full kill rosters fetched from the WCL API every 30 minutes
- **Mythic+ rankings** — current season scores and run data from Raider.IO
- **Raid statistics** — DPS/HPS rankings across boss encounters
- **Kill archive** — screenshot cards with date, roster, and class-colored player names
- **On-demand refresh** — Cloudflare Worker + Turnstile lets users trigger a data update from the site
- **Splash text** — rotating guild inside jokes on the header

## Getting Started

```sh
git clone git@github.com:kaankaraoglu/aztecs.github.io.git
cd aztecs.github.io
npm ci
npm run dev
```

> WCL/RIO credentials are optional for local dev — progression and M+ data fall back to committed JSON files.

### Commands

| Command                 | Description                                         |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | Fetch latest data, then start dev server            |
| `npm run build`         | Production build (skips fetch if `SKIP_DATA_FETCH`) |
| `npm test`              | Run all tests (Vitest)                              |
| `npm run test:watch`    | Watch mode                                          |
| `npm run lint`          | ESLint with auto-fix                                |
| `npm run lint:check`    | ESLint zero-warning gate (what CI runs)             |
| `npm run format`        | Prettier format all files                           |
| `npm run fetch-data`    | Fetch WCL + RIO + stats data manually               |
| `npm run test:coverage` | Run tests with a coverage report                    |
| `npm run build:analyze` | Build and write a bundle report to `stats.html`     |

### Environment Variables

| Variable                  | Required    | Description                                         |
| ------------------------- | ----------- | --------------------------------------------------- |
| `WCL_CLIENT_ID`           | Deploy only | Warcraft Logs OAuth client ID                       |
| `WCL_CLIENT_SECRET`       | Deploy only | Warcraft Logs OAuth client secret                   |
| `VITE_FIREBASE_*`         | Deploy only | Firebase Analytics config (7 vars)                  |
| `VITE_REFRESH_WORKER_URL` | Deploy only | Cloudflare Worker URL for on-demand data refresh    |
| `VITE_TURNSTILE_SITE_KEY` | Deploy only | Cloudflare Turnstile site key for bot protection    |
| `VITE_SIGNUP_WORKER_URL`  | Deploy only | Cloudflare Worker URL backing the next-tier signups |

## Architecture

```
src/
├── assets/styles/       # SCSS variables, WoW class colors, design tokens, theme
├── components/          # Reusable components (HeaderView, KillCard, InfoBox, etc.)
│   ├── ui/              # Base UI primitives (shadcn/reka style)
│   └── next-tier/       # Signup form, table, buff coverage, role balance
├── composables/         # Composition API hooks
│   ├── useProgression   # Raid progression from WCL data
│   ├── useMythicPlus    # M+ data from Raider.IO
│   ├── useRaidStats     # Raid DPS/HPS statistics
│   ├── useBuffAnalysis  # Raid buff coverage and role counts from signups
│   ├── useNextTierSignups # Discord OAuth + signup CRUD
│   ├── useAnalytics     # Firebase Analytics (prod only)
│   ├── useTheme         # Dark/light theme toggle
│   ├── useScrollReveal  # Scroll-based reveal animations
│   └── useTiltEffect    # Card tilt interaction
├── data/                # Static kills, progression fallback, route list, fetched JSON
├── views/               # Route-level pages
│   ├── HomeView         # Landing page
│   ├── RaidingView      # Raid schedule + loot rules
│   ├── AchievementsView # Kill archive
│   ├── NextTierView     # Next tier signups
│   ├── AboutView        # Guild info
│   ├── ContactView      # Contact page
│   ├── InMemoriamView   # Memorial page
│   └── NotFoundView     # 404 page
└── router/              # Vue Router, built from src/data/site-routes.js

scripts/
├── fetch-wcl-data.js    # Fetch raid progression from WCL GraphQL API
├── fetch-rio-data.js    # Fetch M+ data from Raider.IO API
├── fetch-wcl-stats.js   # Fetch raid statistics from WCL
├── fetch-wcl-history.js # Fetch historical WCL data
├── wcl-api.js           # Shared WCL OAuth + GraphQL client
├── write-fallback.js    # Keep the last good JSON when a fetch produces nothing
├── postbuild.js         # 404.html, per-route HTML, sitemap.xml
└── load-env.js          # Environment variable loader

workers/
├── signup/              # Discord OAuth + next-tier signup API
└── refresh/             # Cloudflare Worker for on-demand data refresh
```

### Data Flow

```
                          ┌─────────────────────────┐
                          │   fetch-data.yml (cron)  │
                          │     every 30 minutes     │
                          └────────┬────────────────┘
                                   │
                   ┌───────────────┼───────────────┐
                   ▼               ▼               ▼
          fetch-wcl-data.js  fetch-rio-data.js  fetch-wcl-stats.js
                   │               │               │
                   ▼               ▼               ▼
        wcl-progression.json  rio-mythicplus.json  wcl-stats.json
                   │               │               │
                   ▼               ▼               ▼
          useProgression()   useMythicPlus()   useRaidStats()
                   │               │               │
                   ▼               ▼               ▼
        RaidProgressionBox   MythicPlusBox    RaidStatsBox
```

If WCL data is empty at runtime, `useProgression` falls back to the static `progression.js`.

## CI/CD

| Workflow           | Trigger                 | What it does                                    |
| ------------------ | ----------------------- | ----------------------------------------------- |
| **PR Checks**      | Pull requests to `main` | Format, lint, test, build (4 parallel jobs)     |
| **Build & Deploy** | Push to `main`          | Build with committed data, deploy to `gh-pages` |
| **Fetch Data**     | Every 30 min + manual   | Fetch WCL/RIO data, commit if changed           |
| **Refresh Data**   | Manual (via Worker)     | Triggers Fetch Data workflow on demand          |

Data fetching and deployment are decoupled: `fetch-data.yml` commits updated JSON to `main`, which triggers `deploy.yml` automatically. The fetchers write byte-identical output for identical data, so a cron run that finds nothing new produces no commit and no deploy.

## Contributing

Pre-commit hooks run `lint-staged` (Prettier + ESLint) automatically. CI enforces zero warnings.

```sh
npm ci           # Install dependencies (hooks activate automatically)
npm run dev      # Start developing
npm test         # Run tests before pushing
```
