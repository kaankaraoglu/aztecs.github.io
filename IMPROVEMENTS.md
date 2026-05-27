# Improvements

A curated catalogue of opportunistic improvements for the aztecs.github.io codebase. These are next-step refinements — the project already has solid foundations (CI, tests, lint, image optimization, lazy routes, Turnstile-protected refresh).

Items are grouped by category. Within each category, items are ordered **High → Medium → Low** priority. Each item references concrete files so the work can be picked up without re-investigation.

---

## Performance & Bundle

- **[High]** `src/components/EmberParticles.vue` sets canvas size once on mount and never updates. Add a debounced `resize` listener (or `useResizeObserver` from `@vueuse/core`) so particle density re-tunes when the viewport changes (e.g. rotating a phone, resizing a window).
- **[Medium]** Kill screenshots in `src/components/KillCard.vue` use `loading="lazy"` but have no `width`/`height` attributes → causes CLS as images load. Add intrinsic dimensions or an `aspect-ratio` CSS rule.
- **[Medium]** `vite.config.js` `manualChunks` only splits Firebase. Add chunks for `reka-ui`, `@vueuse/core`, and `@lucide/vue` to shrink the main bundle's parse cost on first paint.

## Accessibility

- **[High]** `src/components/MythicPlusBox.vue` uses `<span role="img">✓/✗</span>` for status. Screen readers announce the literal glyph. Replace with `aria-label="Completed"` (or "Not completed") + `aria-hidden="true"` on the glyph, or use a proper icon component with sr-only text.
- **[Medium]** `src/views/HomeView.vue` (around lines 33–42): an `<img>` with `role="button"` and `tabindex` is an anti-pattern. Wrap in a real `<button>` (transparent background) or `<a>` so native keyboard / screen-reader semantics apply.
- **[Medium]** `src/components/ImageLightbox.vue` does not lock body scroll when open. Mobile users can scroll the page behind the overlay. Toggle `document.body.style.overflow = 'hidden'` on open and restore on close (or use `useScrollLock` from `@vueuse/core`).

## UX: Empty & Error States

- **[High]** No views render an error state when the WCL/RIO data fetch returns empty or errored. `HomeView.vue`, `RaidingView.vue`, and `AchievementsView.vue` should show a friendly "couldn't load data — try refreshing" panel when the relevant composable's data is empty **and** not loading.
- **[Medium]** No toast/snackbar system. Form submits in `SignupForm.vue`, deletes in `SignupTable.vue`, and `RefreshDataButton.vue` rely on ephemeral inline state. Add a lightweight toast (reka-ui has one) or a small custom composable for success/failure messages that persist a few seconds.
- **[Low]** `src/views/NotFoundView.vue` reads as generic boilerplate — the guild's voice comes through strongly elsewhere (About, In Memoriam). Rewrite with on-brand copy and a clear link back home.

## Code Architecture

- **[High]** `src/components/RaidProgressionBox.vue` is 624 lines. Extract a `BossRow.vue` (per-boss row + difficulty pills) and a `RosterAccordion.vue` (expandable kill roster). Keeps the parent focused on layout + data flow.
- **[Medium]** `src/components/HeaderView.vue` (432 lines) mixes nav, theme switching, and splash-text rotation. Pull splash rotation into a `useSplashText.js` composable; consolidate any header-local theme logic into the existing `useTheme.js`.
- **[Medium]** API base URLs are read via `import.meta.env.VITE_*` in multiple places (`useNextTierSignups.js`, `RefreshDataButton.vue`). Centralise in `src/lib/env.js` (or `src/constants.js`), with a runtime check that warns clearly if a required var is missing.

## Testing

- **[High]** `src/composables/useNextTierSignups.js` is the most complex and security-adjacent composable (Discord OAuth, JWT, CRUD) and has **no tests**. Add coverage for `handleAuthCallback`, token expiry, 401 handling, and optimistic update rollback on failed PUT/DELETE.
- **[Medium]** No coverage thresholds. Add `npm run test:coverage` (vitest `--coverage`) and wire it into CI with a minimum threshold (e.g. 70% lines) to prevent regressions.
- **[Medium]** Missing component specs: `MissingClassesBox`, `RecruitmentBox`, `RosterList`. Add per-view specs for `NextTierView` and `ContactView` form-validation paths — the monolithic `src/views/__tests__/views.spec.js` is too coarse.

## SEO

- **[Medium]** `public/sitemap.xml` is missing the `/next-tier` route and has no `<lastmod>` dates. Add the route and a build step (or commit hook) that updates `lastmod` from git history.
- **[Low]** The router sets meta tags per-route but no JSON-LD. Add `Organization` structured data (guild name, URL, logo) and `BreadcrumbList` in `router.beforeEach` for richer search results.

## Security

- **[High]** `workers/signup/src/index.js` Discord OAuth callback: confirm the `state` parameter is generated, stored (signed cookie or KV), **and compared** on callback. Exploration flagged this is generated but possibly not validated end-to-end — verify and lock down.
- **[Medium]** `workers/signup/src/index.js` `characterName` input is trimmed but not length/charset-checked. Add server-side validation: max 12 chars, alphanumeric only (WoW character name rules). Don't rely on client-side checks alone.

## Developer Experience

- **[Medium]** No `typecheck` script despite extensive JSDoc and a configured `jsconfig.json`. Add `"typecheck": "vue-tsc --noEmit"` to `package.json` and a CI job to catch type drift early.
- **[Medium]** Workers (`workers/signup/`, `workers/refresh/`) silently catch errors with no structured logging. Add `console.error` calls with request context (path, method, status) so Cloudflare tail logs are actionable when something breaks.
- **[Low]** Pre-commit hook in `.husky/pre-commit` silently exits 0 if `node` is missing → bad commits can sneak through on misconfigured machines. Fail loudly if the toolchain isn't found.

## Scripts & Data Fetching

- **[Medium]** `scripts/fetch-wcl-data.js`, `fetch-wcl-stats.js`, and `fetch-rio-data.js` duplicate report-fetching and roster-processing logic. Extend `scripts/wcl-api.js` (already shared) so all fetchers use the same retry / rate-limit / pagination helpers.
- **[Medium]** Fetchers return `EMPTY_OUTPUT` on any error → masks real failures from the 30-minute cron. Exit non-zero on unexpected errors (keep the soft-fail for legitimate "no data yet" cases), and emit a GitHub Actions job summary so failures are visible without trawling logs.

## CI / Ops

- **[Low]** `.github/workflows/fetch-data.yml` runs every 30 minutes with no failure notification. Add a step that opens (or updates) a single GitHub issue when consecutive runs fail, so the maintainer notices without watching the Actions tab.
