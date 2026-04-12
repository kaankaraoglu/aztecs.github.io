# TODO — Code Improvements & Feature Ideas

## Instructions

- For all below items, create a new branch on top of up-to-date main branch, commit and create a PR when done.

## Code Quality

- [x] **Lazy-import Firebase Analytics in `useAnalytics.js`** — The static `import { getAnalytics, logEvent } from 'firebase/analytics'` pulls the entire Analytics module into the main bundle, defeating the lazy-load in `main.js`. Use a dynamic `import()` inside `trackEvent()` guarded by `import.meta.env.PROD`.
- [x] **Remove dead `show-image-button`** (`KillCard.vue`) — The `.show-image-button` div is rendered but permanently `display: none` in all breakpoints. Remove the markup and CSS.
- [x] **Remove dead `loading` ref** (`useProgression.js`) — The `loading` ref is initialized to `false` and never set to `true` (data is static JSON). Remove it or wire it to actual loading state.
- [ ] **Decide on `RaidHistoryView`** — The view is complete and polished but commented out in the router and nav. Either re-enable it at `/history` or delete the view, composable, and data file to avoid dead code.
- [ ] **Standardize breakpoint usage** — Several components use raw `@media (max-width: Npx)` at non-standard values (640px, 700px, 768px) instead of the mixins in `_tokens.scss`. Add named mixins for these breakpoints or refactor to use existing ones.
- [ ] **Replace magic number spacing** — Views like `RaidingView` and `ContactView` use hardcoded rem values (`1.875rem`, `1.5625rem`) that should use spacing tokens from the design system.
- [ ] **Singleton pattern for `useAnalytics`** — Each component calling `useAnalytics()` recreates the closure and calls `getAnalytics()` per event. Use a module-level singleton for the analytics instance.

## Test Coverage

- [ ] **Views** — Add at least smoke-render tests for all 8 view components
- [ ] **Router** — Test route definitions and lazy-loading

## Accessibility (a11y)

- [ ] **Hamburger menu** (`HeaderView.vue`) — Add `role="button"`, `aria-label`, and keyboard support (Enter/Space)
- [ ] **Boss expand** (`RaidProgressionBox.vue`) — Add `aria-expanded` attribute and keyboard support (Enter key to toggle)
- [ ] **ImageLightbox** — Add `role="dialog"`, `aria-modal="true"`, focus trap, and scroll lock (`document.body.style.overflow = 'hidden'`)
- [ ] **MythicPlusBox** — Add `aria-label` to timed/untimed checkmark symbols (currently reads as "check mark" / "cross mark" instead of "Timed" / "Not timed")
- [ ] **KillCard roster** — Use semantic `<ul>/<li>` instead of flat `<span>` elements
- [ ] **ContactView table** — Add `<caption>` for screen reader context
- [ ] **KillCard images on HomeView** — Images have `cursor: zoom-in` and a click handler but no `role="button"` or keyboard event for lightbox access
- [ ] **External links in FooterView** — Links opening in `target="_blank"` should warn assistive technology users (e.g., append " (opens in new tab)" or use `aria-label`)

## Performance

- [ ] **Resize kill images** — Three images are 5.9–8.4 MB originals (`liberation_of_undermine` 8.4 MB PNG, `glory_of_the_omega_raider` 8.4 MB, `manaforge_omega` 5.9 MB). Resize to max ~1920px width and generate WebP versions using `sharp` (already in devDependencies).
- [ ] **Add WebP output to `ViteImageOptimizer`** — The plugin compresses JPEG/PNG but does not generate modern formats. Add `webp: {}` config for automatic conversion.
- [ ] **Add `width`/`height` to kill card images** — Missing dimensions cause layout shift (CLS). Set explicit `width`/`height` on `<img>` in `KillCard.vue`.
- [ ] **EmberParticles canvas resize** — Canvas is sized once on mount; does not update on window resize. Add a debounced `resize` listener or `ResizeObserver`.
- [ ] **EmberParticles** — Throttle or pause animation on low-end devices / battery saver mode
- [ ] **Kill images** — Consider lazy-loading imports in `kills.js` instead of eagerly importing all at module load
- [ ] **RaidProgressionBox** — Lazy-render roster content (only mount when expanded) for large boss lists
- [ ] **Reduce deploy frequency** — Cron runs every 30 minutes (48 deploys/day), but data only changes after raid nights. Reduce to every 2–4 hours or limit to raid-day windows to save CI minutes and API rate limits.

## SEO & Meta

- [ ] **Add `robots.txt`** — Create `public/robots.txt` with `Allow: /` and `Sitemap: https://aztecs.se/sitemap.xml`
- [ ] **Add `sitemap.xml`** — Create `public/sitemap.xml` listing all 6 routes for better discoverability
- [ ] **Add `<link rel="canonical">`** — Point to `https://aztecs.se` to prevent duplicate indexing via the `github.io` subdomain
- [ ] **Per-route meta tags** — The router's `beforeEach` hook only updates `document.title`. Extend it to also set `<meta name="description">` and OG tags per route for better social sharing / SEO.
- [ ] **Add `<meta name="color-scheme" content="dark">`** — Tells the browser to render native UI elements (scrollbars, form inputs, selection) in dark mode, matching the site's dark theme.
- [ ] **Add `<noscript>` fallback** — Add a minimal message in `index.html` for users with JavaScript disabled.
- [ ] **Audit font loading** — Verify Noto Sans is actually used in the UI; if not, removing it saves a network round-trip.

## CI / DX

- [ ] **Add `format:check` to CI** — The `format:check` script exists in `package.json` but isn't run in CI. A developer bypassing the pre-commit hook can land unformatted code.
- [ ] **Use a maintained GitHub Pages deploy action** — `deploy.yml` manually clones `gh-pages`, deletes contents, copies `dist/`, and pushes. Using `JamesIves/github-pages-deploy-action@v4` or `peaceiris/actions-gh-pages@v3` handles edge cases and is easier to maintain.
- [ ] **Add bundle size visualization** — Configure `rollup-plugin-visualizer` to generate a report on builds, useful for tracking Firebase and other dependency sizes.
- [ ] **Explicit code splitting for Firebase** — Add `manualChunks` in `vite.config.js` `build.rollupOptions` to isolate Firebase into its own chunk.

## Features

- [ ] **Search/filter** — Allow searching kills or bosses by name
- [ ] **M+ runner sorting** — Allow sorting leaderboard by score or name
- [ ] **Service worker / offline support** — Cache static assets for offline browsing
