# TODO — Code Improvements & Feature Ideas

## Instructions

- For all below items, create a new branch on top of up-to-date main branch, commit and create a PR when done.

## Code Quality

- [x] **Lazy-import Firebase Analytics in `useAnalytics.js`** — The static `import { getAnalytics, logEvent } from 'firebase/analytics'` pulls the entire Analytics module into the main bundle, defeating the lazy-load in `main.js`. Use a dynamic `import()` inside `trackEvent()` guarded by `import.meta.env.PROD`.
- [x] **Remove dead `show-image-button`** (`KillCard.vue`) — The `.show-image-button` div is rendered but permanently `display: none` in all breakpoints. Remove the markup and CSS.
- [x] **Remove dead `loading` ref** (`useProgression.js`) — The `loading` ref is initialized to `false` and never set to `true` (data is static JSON). Remove it or wire it to actual loading state.
- [x] **Decide on `RaidHistoryView`** — The view is complete and polished but commented out in the router and nav. Either re-enable it at `/history` or delete the view, composable, and data file to avoid dead code.
- [x] **Standardize breakpoint usage** — Several components use raw `@media (max-width: Npx)` at non-standard values (640px, 700px, 768px) instead of the mixins in `_tokens.scss`. Add named mixins for these breakpoints or refactor to use existing ones.
- [x] **Replace magic number spacing** — Views like `RaidingView` and `ContactView` use hardcoded rem values (`1.875rem`, `1.5625rem`) that should use spacing tokens from the design system.
- [x] **Singleton pattern for `useAnalytics`** — Each component calling `useAnalytics()` recreates the closure and calls `getAnalytics()` per event. Use a module-level singleton for the analytics instance.

## Test Coverage

- [x] **Views** — Add at least smoke-render tests for all 7 view components (RaidHistoryView was deleted)
- [x] **Router** — Test route definitions and lazy-loading

## Accessibility (a11y)

- [x] **Hamburger menu** (`HeaderView.vue`) — It is a real `<button>` with `aria-label`, `aria-expanded` and `aria-controls`, so keyboard activation comes from the platform.
- [x] **Boss expand** (`RaidProgressionBox.vue`) — Add `aria-expanded` attribute and keyboard support (Enter key to toggle)
- [x] **ImageLightbox** — Add `role="dialog"`, `aria-modal="true"`, focus trap, and scroll lock (`document.body.style.overflow = 'hidden'`)
- [x] **MythicPlusBox** — Add `aria-label` to timed/untimed checkmark symbols (currently reads as "check mark" / "cross mark" instead of "Timed" / "Not timed")
- [x] **KillCard roster** — Use semantic `<ul>/<li>` instead of flat `<span>` elements
- [x] **ContactView table** — Add `<caption>` for screen reader context
- [x] **KillCard images on HomeView** — Images have `cursor: zoom-in` and a click handler but no `role="button"` or keyboard event for lightbox access
- [x] **External links in FooterView** — Links opening in `target="_blank"` should warn assistive technology users (e.g., append " (opens in new tab)" or use `aria-label`)

## Performance

- [x] **Resize kill images** — All kill screenshots are now at most 1920px wide. The five that were 1951-2560px were resampled, taking the set from 2.5 MB to 1.7 MB before build-time optimisation.
- [ ] **Add WebP output to `ViteImageOptimizer`** — The plugin compresses JPEG/PNG but does not generate modern formats. Add `webp: {}` config for automatic conversion.
- [x] **Add `width`/`height` to kill card images** — Set on both `KillCard.vue` and the home page's latest-achievement images, which also gained `loading="lazy"`.
- [x] **EmberParticles canvas resize** — A debounced `resize` listener re-sizes the canvas and re-tunes particle density.
- [ ] **EmberParticles** — Throttle or pause animation on low-end devices / battery saver mode. (It already pauses on a hidden tab, on the light theme where the canvas is `display: none`, and under `prefers-reduced-motion`.)
- [ ] **Kill images** — Consider lazy-loading imports in `kills.js` instead of eagerly importing all at module load
- [x] **RaidProgressionBox** — Roster content is behind `v-if="expanded[boss.name] && hasRoster(boss)"`, so it only mounts when opened.
- [x] **Reduce deploy frequency** — Fixed at the source rather than by changing the cadence. Roughly half the data commits carried no actual change: `rio-mythicplus.json` stamped a fresh `lastUpdated` every run, and WCL returns kill rosters in a shifting order, so the JSON differed byte-wise while the data was identical. Rosters are now sorted and `lastUpdated` carries over when the payload is unchanged, so a run that finds nothing new produces no commit and no deploy. Lowering the cron interval is still open (see IMPROVEMENTS.md).

## SEO & Meta

- [x] **Add `robots.txt`** — Create `public/robots.txt` with `Allow: /` and `Sitemap: https://aztecs.se/sitemap.xml`
- [x] **Add `sitemap.xml`** — Generated at build time by `scripts/postbuild.js` from `src/data/site-routes.js`, so it covers every public route and cannot drift from the router.
- [x] **Add `<link rel="canonical">`** — Point to `https://aztecs.se` to prevent duplicate indexing via the `github.io` subdomain
- [x] **Per-route meta tags** — The router's `beforeEach` hook only updates `document.title`. Extend it to also set `<meta name="description">` and OG tags per route for better social sharing / SEO.
- [x] **Add `<meta name="color-scheme">`** — Set to `dark light`, since the site ships both themes; pinning it to `dark` left native scrollbars and form controls dark while the light theme was active. Paired with a `theme-color` for each scheme.
- [x] **Add `<noscript>` fallback** — Add a minimal message in `index.html` for users with JavaScript disabled.
- [x] **Audit font loading** — Noto Sans was loaded but unused; removed from Google Fonts import (only Cal Sans is used).

## CI / DX

- [x] **Add `format:check` to CI** — The `format:check` script exists in `package.json` but isn't run in CI. A developer bypassing the pre-commit hook can land unformatted code.
- [x] **Use a maintained GitHub Pages deploy action** — `deploy.yml` uses `JamesIves/github-pages-deploy-action@v4` with `single-commit: true`. The custom domain moved to `public/CNAME`, so the build produces `dist/CNAME` and the workflow no longer writes it by hand.
- [x] **Add bundle size visualization** — Configure `rollup-plugin-visualizer` to generate a report on builds, useful for tracking Firebase and other dependency sizes.
- [x] **Explicit code splitting for Firebase** — Add `manualChunks` in `vite.config.js` `build.rollupOptions` to isolate Firebase into its own chunk.

## Integrations

- [x] **"Refresh data" button to trigger GitHub Actions** — Add a button on the progression view that re-runs the WCL fetch + deploy on demand, so data can be refreshed without a code push.
  - **Architecture:** Browser → Cloudflare Worker (holds fine-grained GitHub PAT) → GitHub `workflow_dispatch` API → new `refresh-data.yml` workflow that runs `npm run build` and pushes to `gh-pages`.
  - **Worker (`aztecs-refresh`):** `POST /refresh` endpoint. Verifies `Origin: https://aztecs.se`, validates a Cloudflare Turnstile token, enforces a 10-min global rate limit via Workers KV, then dispatches the workflow and returns the run URL. Secrets: `GITHUB_TOKEN`, `TURNSTILE_SECRET`. Free tier covers expected volume.
  - **GitHub side:** New `.github/workflows/refresh-data.yml` (trigger: `workflow_dispatch` only, concurrency group to prevent overlap). Fine-grained PAT scoped to this repo with `Actions: write` only, 90-day rotation.
  - **Frontend:** New `RefreshDataButton.vue` component near a "last updated" timestamp on the progression view. Invisible Turnstile widget. States: idle / submitting / success (with link to Actions run) / error / rate-limited (countdown). New Vite env vars: `VITE_REFRESH_WORKER_URL`, `VITE_TURNSTILE_SITE_KEY`.
  - **One-time setup (outside repo):** Cloudflare account + Worker, Turnstile site for `aztecs.se`, fine-grained GitHub PAT, `wrangler secret put` for both secrets, KV namespace for rate limiting, `wrangler deploy`.
  - **In-repo PR:** workflow file + Vue component + env var plumbing in GitHub Actions secrets.
  - **Open questions:** custom domain (`refresh.aztecs.se`) vs. `.workers.dev`; surface "last updated" timestamp from `wcl-progression.json` (not currently shown); button placement (progression only vs. also home).

## Done in the codebase sweep

Beyond the items checked off above, this pass also landed:

- Every route except `/` was returning HTTP 404 on the live site. GitHub Pages answers unknown paths with `404.html` and a 404 status, so the sitemap advertised six URLs that crawlers were told did not exist. `scripts/postbuild.js` now writes a real `dist/<route>/index.html` per route, with that route's own title, description and canonical baked in.
- `fetch-wcl-stats.js` only ever queried the first entry of `CURRENT_ZONE_IDS`, so raid records were frozen on Season 1 and could never show a kill from the current tier.
- The raid box's "Updated" line was showing the Raider.IO fetch timestamp. Raid progression now carries its own.
- The Discord OAuth `state` parameter was generated but never checked on callback. It is now stored in a `SameSite=Lax` cookie on the worker's origin and compared.
- Buff coverage counted per class rather than per spec, so a Frost death knight marked Abomination Limb and Gorefiend's Grasp as covered.
- Firebase was statically imported by `main.js`, so 41 KB of it was modulepreloaded on every page load even when analytics was switched off. Together with dropping the hand-written `reka-ui` / `@lucide/vue` chunks, eagerly-fetched JavaScript on first paint went from about 306 KB to 231 KB.
- The Next Tier error banner rendered at `opacity: 0` and was never announced, so every failure on that page looked like nothing happening.
