<!-- markdownlint-disable-file MD041 no-emphasis-as-heading -->
<!-- markdownlint-disable-file MD033 -->

<div align="center">

# ⚔️ `aztecs.github.io`

**Guild website for Aztecs — an established Horde guild on Al'Akir since 2005**

[![PR Checks](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/ci.yml)
[![Build & Deploy](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/deploy.yml)
[![GitHub Pages](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/pages/pages-build-deployment)
[![Dependabot Updates](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/dependabot/dependabot-updates/badge.svg)](https://github.com/kaankaraoglu/aztecs.github.io/actions/workflows/dependabot/dependabot-updates)

[**aztecs.se**](https://aztecs.se) · Vue 3 · Vite · Warcraft Logs · GitHub Pages

</div>

---

## Overview

Raiding, Mythic+, and good times. The site features live raid progression pulled from [Warcraft Logs](https://www.warcraftlogs.com/) at build time, historical kill screenshots with rosters, guild info, and a contact page.

**Key features:**

- **Live raid progression** — per-boss kill status, pull counts, best %, and full kill rosters fetched from the WCL API
- **Scheduled deploys** — auto-deploys after raid nights (Wed/Sun) to keep progression fresh
- **Kill archive** — screenshot cards with date, roster, and class-colored player names
- **Splash text** — rotating guild inside jokes on the header
- **Ambient effects** — floating ember particles, scroll-reveal animations, glowing accents

## Getting Started

```sh
git clone git@github.com:kaankaraoglu/aztecs.github.io.git
cd aztecs.github.io
npm ci
npm run dev
```

### Commands

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `npm run dev`    | Start dev server                  |
| `npm run build`  | Fetch WCL data + production build |
| `npm test`       | Run tests (Vitest)                |
| `npm run lint`   | ESLint with auto-fix              |
| `npm run format` | Prettier format all files         |

### Environment Variables

WCL credentials are optional for local dev (progression falls back to static data):

| Variable            | Required    | Description                        |
| ------------------- | ----------- | ---------------------------------- |
| `WCL_CLIENT_ID`     | Deploy only | Warcraft Logs OAuth client ID      |
| `WCL_CLIENT_SECRET` | Deploy only | Warcraft Logs OAuth client secret  |
| `VITE_FIREBASE_*`   | Deploy only | Firebase Analytics config (7 vars) |

## Architecture

```
src/
├── components/         # Reusable components (HeaderView, KillCard, EmberParticles, etc.)
├── composables/        # useProgression, useScrollReveal, useTiltEffect
├── data/               # Static kills, progression fallback, WCL JSON
├── views/              # Route-level pages (Home, Raiding, Achievements, About, Contact)
├── assets/styles/      # SCSS variables, design tokens, shared partials
└── router/             # Vue Router with per-route titles
scripts/
└── fetch-wcl-data.js   # Build-time WCL fetcher (runs as prebuild)
```

### Data Flow

```
Build time:  WCL API  →  fetch-wcl-data.js  →  wcl-progression.json
Runtime:     wcl-progression.json  →  useProgression()  →  RaidProgressionBox
Fallback:    progression.js (static)  →  useProgression()  (if WCL data empty)
```

## CI/CD

| Workflow           | Trigger                        | What it does                           |
| ------------------ | ------------------------------ | -------------------------------------- |
| **PR Checks**      | Pull requests                  | Lint, test, build (parallel)           |
| **Build & Deploy** | Push to main, schedule, manual | Fetch WCL → build → deploy to gh-pages |

The deploy workflow runs on a schedule: **Wed 23:00 CET**, **Sun 23:00 CET** (after raids), and **daily 06:00 CET**.

## Contributing

Pre-commit hooks run `lint-staged` (Prettier + ESLint) automatically. CI enforces zero warnings.

```sh
npm ci           # Install dependencies (hooks activate automatically)
npm run dev      # Start developing
npm test         # Run tests before pushing
```
