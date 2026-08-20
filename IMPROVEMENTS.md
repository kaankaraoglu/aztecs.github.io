# Improvements

A catalogue of open improvements for the aztecs.github.io codebase. Items are grouped by category and ordered High → Medium → Low within each group. Each one names the files involved so the work can be picked up without re-investigating.

---

## Security

- **[High]** `workers/signup/src/index.js` stores a whole tier's signups in a single KV value, and both `handlePutSubmission` and `handleDeleteSubmission` read it, mutate it, and write it back. Cloudflare KV has no compare-and-set, so two signups that overlap in that window silently lose one of the two writes. The losing member sees themselves in the table right after submitting (their own `fetchSubmissions()` runs after their own write) and only finds out later that they are gone. Fix by keying each signup separately as `tier:${tierId}:${discordId}` and rebuilding the array in `handleGetSubmissions` with `SIGNUPS.list({ prefix })`. This changes the storage layout of a live service, so it needs a migration path that reads the legacy array key until the old data is gone.
- **[Medium]** `GET /api/submissions` needs no authentication and returns each signup verbatim, including `discordId`, the permanent Discord snowflake. The frontend only uses that id to answer "is this row mine" (`useNextTierSignups.js`) and to target an admin delete (`SignupTable.vue`), and never displays it. Replacing it with a per-tier opaque handle (a truncated SHA-256 of `tierId + discordId`) keeps both call sites working without publishing a Discord-account-to-character mapping for the whole raid team.
- **[Low]** The refresh worker's 10-minute limiter (`workers/refresh/src/index.js`) is a read-check-write against KV with no atomicity, and the timestamp is written only after the dispatch succeeds. Two requests landing together can both dispatch. The blast radius is a duplicate workflow run, so this is worth fixing only if it actually happens.

## UX: empty and error states

- **[High]** No view renders an error state when the WCL or RIO data is empty. `HomeView.vue`, `RaidingView.vue` and `AchievementsView.vue` should show a "couldn't load this, try refreshing" panel when the relevant composable has no data. The fetchers now degrade to stale data rather than blanking the file, so this only shows up after a genuinely empty first fetch, but the page currently renders as if nothing were wrong.
- **[Medium]** There is no toast or snackbar. `SignupForm.vue`, `SignupTable.vue` and `RefreshDataButton.vue` each communicate success and failure through their own ephemeral inline state. A small shared composable (or reka-ui's toast) would let those messages persist for a few seconds and be announced once, consistently.
- **[Low]** `src/views/NotFoundView.vue` reads as boilerplate. The guild's voice comes through strongly on About and In Memoriam, and the 404 page could use the same treatment.

## Code architecture

- **[Medium]** `src/components/RaidProgressionBox.vue` is around 750 lines. A `BossRow.vue` (the per-boss row and its difficulty pips) and a `RosterAccordion.vue` (the expandable kill roster) would leave the parent handling layout and data flow.
- **[Medium]** `src/components/HeaderView.vue` mixes navigation, theme switching and splash-text rotation. The splash rotation is self-contained enough to move into a `useSplashText.js` composable.
- **[Medium]** `import.meta.env.VITE_*` is read directly in `useNextTierSignups.js` and `RefreshDataButton.vue`. A `src/lib/env.js` that reads them in one place, with a clear warning when a required var is missing, would make a misconfigured deploy diagnosable. Today a missing `VITE_REFRESH_WORKER_URL` just renders a button that does nothing when clicked.
- **[Low]** `src/views/AboutView.vue` hand-rolls a second copy of the glass card that `InfoBox.vue` already provides.

## Performance

- **[Medium]** `ViteImageOptimizer` compresses JPEG and PNG but does not emit modern formats. Adding a `webp` conversion for the remaining JPEG sources in `src/assets/images/kills/` would cut another chunk off the achievements page.
- **[Medium]** `src/data/kills.js` imports every kill screenshot eagerly at module load. The home page only ever renders the newest two.
- **[Low]** `EmberParticles.vue` pauses on tab visibility, on the light theme, and under `prefers-reduced-motion`, but still runs at full frame rate on low-end hardware and in battery-saver mode.

## Testing and tooling

- **[Medium]** `npm run test:coverage` exists but nothing enforces a floor. Wiring a minimum (say 70% lines) into CI would stop coverage sliding back.
- **[Low]** There is no `typecheck` script despite extensive JSDoc and a configured `jsconfig.json`. `vue-tsc --noEmit` would catch type drift, at the cost of a new dev dependency.

## Scripts and data fetching

- **[Low]** `scripts/fetch-wcl-stats.js` still has two near-identical report loops (raid and M+) that differ only in which encounter-id set they filter by and which accumulators they write. The shared table and roster fetchers now live in `scripts/wcl-api.js`; unifying the loops as well would mean a boolean flag for the tank-name fetch that only the raid branch uses, which may not be worth it.
- **[Low]** `.github/workflows/fetch-data.yml` runs every 30 minutes. Data only moves on raid nights, and the fetchers now produce identical bytes for identical data, so most runs are already no-ops. Dropping to every two hours outside raid windows would save CI minutes and WCL API points.

## Styling

- **[Low]** Several custom properties in `src/assets/styles/_theme.scss` and a handful of SCSS variables in `_variables.scss` are defined but never read. Worth a sweep before the next theme change.
