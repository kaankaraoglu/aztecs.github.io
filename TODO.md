# TODO — Code Improvements & Feature Ideas

## Instructions

- For all below items, create a new branch on top of up-to-date main branch, commit and create a PR when done.

## Code Quality

- [x] **Extract shared WCL utilities** — `CLASS_MAP`, `getToken()`, and `graphql()` are duplicated across `scripts/fetch-wcl-data.js`, `fetch-wcl-stats.js`, and `fetch-wcl-history.js`. Extract to a shared `scripts/wcl-api.js` module.
- [x] **Extract shared roster component** — Player name rendering with class-colored spans is duplicated in `KillCard.vue` and `RaidProgressionBox.vue`. Create a reusable `RosterList.vue` component.
- [x] **Add timeout to build-time fetch scripts** — `fetch-wcl-data.js` and `fetch-wcl-stats.js` parallel fetches have no timeout; could hang indefinitely on slow API responses.
- [x] **Image load error handling in ImageLightbox** — No fallback UI if the lightbox image fails to load.
- [x] **Canvas error handling in EmberParticles** — No guard if `getContext('2d')` returns null.

## Test Coverage

Current coverage: ~23% of components/composables tested.

- [ ] **Composables** — Add tests for `useMythicPlus`, `useProgression`, `useRaidStats`, `useTiltEffect`
- [ ] **Components** — Add tests for `KillCard`, `ImageLightbox`, `MythicPlusBox`, `RaidStatsBox`, `SkeletonLoader`, `HeaderView`, `FooterView`
- [ ] **Views** — Add at least smoke-render tests for all 8 view components
- [ ] **Router** — Test route definitions and lazy-loading

## Accessibility (a11y)

- [ ] **Hamburger menu** (`HeaderView.vue`) — Add `role="button"`, `aria-label`, and keyboard support (Enter/Space)
- [ ] **Boss expand** (`RaidProgressionBox.vue`) — Add `aria-expanded` attribute and keyboard support (Enter key to toggle)
- [ ] **ImageLightbox** — Add `role="dialog"`, `aria-modal="true"`, focus trap, and scroll lock
- [ ] **MythicPlusBox** — Add `aria-label` to timed/untimed checkmark symbols (✓/✗)
- [ ] **KillCard roster** — Use semantic `<ul>/<li>` instead of flat `<span>` elements
- [ ] **ContactView table** — Add `<caption>` for screen reader context

## Performance

- [ ] **EmberParticles** — Throttle or pause animation on low-end devices / battery saver mode
- [ ] **Kill images** — Consider lazy-loading imports in `kills.js` instead of eagerly importing all at module load
- [ ] **RaidProgressionBox** — Lazy-render roster content (only mount when expanded) for large boss lists

## Features

- [ ] **Search/filter** — Allow searching kills or bosses by name
- [ ] **M+ runner sorting** — Allow sorting leaderboard by score or name
- [ ] **Service worker / offline support** — Cache static assets for offline browsing
- [ ] **Custom Firebase event tracking** — Track user interactions beyond page views (e.g., boss expand, lightbox open)
- [x] In the raid progression box color the progress bars the same color as the normal and heroic texts and overlap the background to show the progress for both difficulties.
