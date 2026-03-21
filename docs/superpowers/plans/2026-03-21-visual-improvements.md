# Visual Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Comprehensive visual overhaul of the Aztecs guild website across 6 phases: design tokens, quick visual wins, immersion animations, component upgrades, layout overhauls, and hero polish.

**Architecture:** New SCSS token system (`_tokens.scss`) provides spacing, color, transition, radius, and breakpoint primitives. All existing components migrate to tokens. New composables (`useScrollReveal`, `useTiltEffect`) add scroll-triggered animations. New components (`SkeletonLoader`) provide loading states. Each phase is a separate branch/PR.

**Tech Stack:** Vue 3 (Composition API, `<script setup>`), SCSS, Vite, no external animation libraries

**Spec:** `docs/superpowers/specs/2026-03-21-visual-improvements-design.md`

---

## Phase 1 — Foundation & Design Tokens

### Task 1: Create design tokens file

**Files:**

- Create: `src/assets/styles/_tokens.scss`

- [ ] **Step 1: Create the tokens file with all design tokens**

```scss
// src/assets/styles/_tokens.scss
@use './variables' as *;

// ── Spacing Scale (4px base) ──
$space-1: 0.25rem; // 4px
$space-2: 0.5rem; // 8px
$space-3: 0.75rem; // 12px
$space-4: 1rem; // 16px
$space-5: 1.25rem; // 20px
$space-6: 1.5rem; // 24px
$space-8: 2rem; // 32px
$space-10: 2.5rem; // 40px
$space-12: 3rem; // 48px
$space-16: 4rem; // 64px

// ── Surface Colors ──
$surface-0: #111; // page background
$surface-1: #161616; // card/section backgrounds
$surface-2: #1c1c1c; // elevated elements
$surface-3: #222; // active/pressed states
$surface-accent-hover: rgba($color-yellow, 0.05); // warm accent tint

// ── Border Colors ──
$color-border: rgba(255, 255, 255, 0.08);
$color-border-hover: rgba(255, 255, 255, 0.15);
$color-border-accent: rgba($accent-color, 0.3);

// ── Text Colors ──
$color-text-primary: #ffffff;
$color-text-muted: rgba(255, 255, 255, 0.6);
$color-text-subtle: rgba(255, 255, 255, 0.4);

// ── Transition Timing ──
$duration-fast: 150ms;
$duration-normal: 250ms;
$duration-slow: 400ms;

$ease-default: ease;
$ease-out: cubic-bezier(0.16, 1, 0.3, 1);
$ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

// ── Border Radius ──
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 16px;
$radius-xl: 20px;

// ── Breakpoint Mixins ──
@mixin mobile-sm {
  @media (max-width: 400px) {
    @content;
  }
}
@mixin mobile {
  @media (max-width: 600px) {
    @content;
  }
}
@mixin tablet {
  @media (max-width: 900px) {
    @content;
  }
}
@mixin desktop-sm {
  @media (max-width: 1200px) {
    @content;
  }
}

// ── Accessibility ──
@mixin reduced-motion {
  @media (prefers-reduced-motion: reduce) {
    @content;
  }
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `npm run build`
Expected: Build succeeds (file is created but not yet imported anywhere)

- [ ] **Step 3: Commit**

```bash
git add src/assets/styles/_tokens.scss
git commit -m "feat: add design tokens file with spacing, colors, transitions, radius, and breakpoints"
```

---

### Task 2: Migrate \_info-box.scss to tokens

**Files:**

- Modify: `src/assets/styles/_info-box.scss` (lines 1-28)

- [ ] **Step 1: Update \_info-box.scss to use tokens**

Replace the entire file content:

```scss
@use './variables' as *;
@use './tokens' as *;

.info-box {
  border: 1px solid $color-border;
  border-radius: $radius-xl;
  padding: $space-6 $space-6;
  background: $surface-1;
  box-sizing: border-box;
  transition:
    background $duration-normal $ease-default,
    border-color $duration-normal $ease-default;
  &:hover {
    background: $surface-accent-hover;
    border-color: $color-border-hover;
  }
  @include mobile {
    padding: $space-4 $space-4;
    border-radius: $radius-lg;
  }
}

.info-box--no-hover {
  &:hover {
    background: $surface-1;
    border-color: $color-border;
  }
}

.info-box-heading {
  color: $accent-color;
  margin-top: 0;
}
```

- [ ] **Step 2: Run build to verify compilation**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Run tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/assets/styles/_info-box.scss
git commit -m "refactor: migrate _info-box.scss to design tokens"
```

---

### Task 3: Migrate App.vue styles to tokens

**Files:**

- Modify: `src/App.vue` (lines 23-77 style blocks)

- [ ] **Step 1: Add tokens import and update scoped styles**

In the `<style scoped lang="scss">` block (line 19), add the import and update `.gradient-line`:

```scss
<style scoped lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/tokens' as *;

.gradient-line {
  background: linear-gradient(to right, $color-red, $color-orange, $color-yellow, $color-light-orange, $color-light-yellow);
  height: 5px;
}
</style>
```

- [ ] **Step 2: Update global styles block**

In the `<style lang="scss">` block (line 30), update to use tokens. Preserve the existing nested SCSS structure (`body`/`main` inside `html`):

```scss
<style lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/tokens' as *;

html {
  color: $color-text-primary;
  background-color: $surface-0;
  font-family: 'Cal Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  body {
    margin: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow-x: hidden;

    main {
      flex: 1;
    }
  }
}

.content-wrapper {
  max-width: 100rem;
  margin: 0 auto;
  padding: 0 $space-8 $space-10;
  width: 100%;
  box-sizing: border-box;

  @include tablet {
    padding: 0 $space-6 $space-8;
  }

  @include mobile {
    padding: 0 $space-4 $space-8;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity $duration-fast $ease-default;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

- [ ] **Step 3: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "refactor: migrate App.vue styles to design tokens"
```

---

### Task 4: Migrate HeaderView.vue styles to tokens

**Files:**

- Modify: `src/components/HeaderView.vue` (lines 100-249 style block)

- [ ] **Step 1: Add tokens import and migrate styles**

Add `@use '@/assets/styles/tokens' as *;` to the style block. Then replace hardcoded values:

Key replacements:

- `margin-top: 1rem` → `margin-top: $space-4`
- `transition: color 0.3s ease` → `transition: color $duration-normal $ease-default`
- `transition: transform/opacity 0.3s ease` → `transition: transform/opacity $duration-normal $ease-default`
- `gap: 1.875rem` → `gap: $space-8`
- `border-radius: 4px` → `border-radius: $radius-sm`
- `@media (max-width: 600px)` → `@include mobile`
- `outline: 2px solid $accent-color` (keep, it's already good)
- `padding: 0.5rem` → `padding: $space-2`

Keep `@media (max-width: 768px)` as-is (one-off breakpoint for hamburger).

- [ ] **Step 2: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 3: Commit**

```bash
git add src/components/HeaderView.vue
git commit -m "refactor: migrate HeaderView.vue styles to design tokens"
```

---

### Task 5: Migrate remaining components to tokens

**Files:**

- Modify: `src/components/FooterView.vue` (lines 15-32)
- Modify: `src/components/FadingDivider.vue` (lines 8-14)
- Modify: `src/components/ImageLightbox.vue` (lines 34-77)
- Modify: `src/components/KillCard.vue` (lines 125-314)
- Modify: `src/components/RaidProgressionBox.vue` (lines 213-464)

- [ ] **Step 1: Migrate FooterView.vue**

Add tokens import. Replace:

- `padding: 3rem 0 5rem` → `padding: $space-12 0 $space-16`
- `margin: 0 auto 2rem` → `margin: 0 auto $space-8`
- `font-size: 0.9em` / `opacity: 0.6` → `color: $color-text-muted`

- [ ] **Step 2: Migrate FadingDivider.vue**

Add tokens import. Replace:

- `margin: 1.75rem 0` → `margin: $space-8 0`
- `opacity: 0.4` → keep as-is (decorative, not a token concern)

- [ ] **Step 3: Migrate ImageLightbox.vue**

Add tokens import. Replace:

- `border-radius: 4px` → `border-radius: $radius-sm`
- `transition: opacity 0.2s` → `transition: opacity $duration-fast $ease-default`
- `transition: opacity 0.25s ease` → `transition: opacity $duration-normal $ease-default`

- [ ] **Step 4: Migrate KillCard.vue**

Add tokens import. Key replacements:

- `background-color: #000` → keep (true black for card, distinct from surfaces)
- `border-radius: 5px` → `border-radius: $radius-md`
- `transition: box-shadow 0.3s ease, transform 0.3s ease` → `transition: box-shadow $duration-normal $ease-default, transform $duration-normal $ease-default`
- `padding: 0.625rem 0.875rem` → `padding: $space-3 $space-3`
- `background-color: #333` → `background-color: $surface-3`
- `@media (max-width: 640px)` → keep as raw (one-off)
- `@media (min-width: 768px)` → keep as raw
- `@media (min-width: 1200px)` → keep as raw

- [ ] **Step 5: Migrate RaidProgressionBox.vue**

Add tokens import. Key replacements:

- `gap: 0.5rem` → `gap: $space-2`
- `padding: 0.55rem 0.85rem` → `padding: $space-2 $space-3`
- `border-radius: 8px` → `border-radius: $radius-md`
- `background: rgba(255,255,255,0.03)` → `background: $surface-1`
- `border: 1px solid rgba(255,255,255,0.05)` → `border: 1px solid $color-border`
- `background: rgba(255,255,255,0.06)` → `background: $surface-2` (for hover states)
- `border-radius: 4px` → `border-radius: $radius-sm`
- `transition: width 0.6s ease` → `transition: width $duration-slow $ease-out`
- `max-height 0.2s` → `max-height $duration-fast` (will be replaced in Phase 2)
- `@media (max-width: 600px)` → `@include mobile`
- `@media (max-width: 500px)` → keep as raw (one-off)

- [ ] **Step 6: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 7: Commit**

```bash
git add src/components/FooterView.vue src/components/FadingDivider.vue src/components/ImageLightbox.vue src/components/KillCard.vue src/components/RaidProgressionBox.vue
git commit -m "refactor: migrate remaining components to design tokens"
```

---

### Task 6: Migrate view styles to tokens

**Files:**

- Modify: `src/views/HomeView.vue` (lines 75-158)
- Modify: `src/views/ContactView.vue` (lines 67-154)
- Modify: `src/views/RaidingView.vue` (lines 95-165)
- Modify: `src/views/AchievementsView.vue` (lines 25-29)

- [ ] **Step 1: Migrate HomeView.vue**

Add tokens import. Key replacements:

- `padding: 0 2rem 3rem` → `padding: 0 $space-8 $space-12`
- `@media (max-width: 700px)` → `@include tablet` (round up)
- `margin: 0.3rem 0 1.5rem` → `margin: $space-1 0 $space-6`
- `@media (max-width: 1200px)` → `@include desktop-sm`
- `@media (max-width: 400px)` → `@include mobile-sm`
- `@media (max-width: 600px)` → `@include mobile`
- `border: 2px dotted $color-yellow` → `border: 1px solid $color-border`
- `border-radius: 20px` → `border-radius: $radius-xl`
- `padding: 2rem 2.5rem` → `padding: $space-8 $space-10`
- `background: rgba(255,255,255,0.02)` → `background: $surface-1`
- `transition: background 0.3s ease` → `transition: background $duration-normal $ease-default, border-color $duration-normal $ease-default`
- Hover: `background: rgba($color-yellow, 0.05)` → `background: $surface-accent-hover; border-color: $color-border-hover`
- `border-radius: 12px` → `border-radius: $radius-lg`

- [ ] **Step 2: Migrate ContactView.vue**

Add tokens import. Key replacements:

- `border: 1px dashed $accent-color` → `border: 1px solid $color-border`
- `border-radius: 20px` → `border-radius: $radius-xl`
- `padding: 2.5rem 3.125rem` → `padding: $space-10 $space-12`
- `background: rgba(255,255,255,0.02)` → `background: $surface-1`
- `transition: background 0.3s ease` → `transition: background $duration-normal $ease-default, border-color $duration-normal $ease-default`
- Hover: → `background: $surface-accent-hover; border-color: $color-border-hover`
- Even rows: `rgba(255,255,255,0.03)` → `$surface-1`
- Hover rows: `rgba(255,255,255,0.06)` → `$surface-2`
- `transition: background 0.2s ease` → `transition: background $duration-fast $ease-default`
- `@media (max-width: 900px)` → `@include tablet`
- `@media (max-width: 600px)` → `@include mobile`

- [ ] **Step 3: Migrate RaidingView.vue**

Add tokens import. Key replacements:

- `padding: 1.875rem` → `padding: $space-8`
- `margin: 0.625rem 0 1.875rem` → `margin: $space-2 0 $space-8`

- [ ] **Step 4: Migrate AchievementsView.vue**

Add tokens import. Replace:

- `gap: 2rem` → `gap: $space-8`

- [ ] **Step 5: Run lint, build, and tests**

Run: `npx eslint . --max-warnings=0 && npm run build && npm test`
Expected: Zero warnings, build succeeds, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/views/HomeView.vue src/views/ContactView.vue src/views/RaidingView.vue src/views/AchievementsView.vue
git commit -m "refactor: migrate all view styles to design tokens"
```

---

## Phase 2 — Quick Visual Wins

### Task 7: Add noise texture background

**Files:**

- Modify: `src/App.vue` (template and styles)

- [ ] **Step 1: Add noise overlay div to template**

In `App.vue` template, add as first child inside the root element:

```html
<div class="noise-overlay" aria-hidden="true" />
```

- [ ] **Step 2: Add noise overlay styles**

In the scoped style block, add:

```scss
.noise-overlay {
  position: fixed;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: add subtle noise texture to page background"
```

---

### Task 8: Animate the top gradient bar

**Files:**

- Modify: `src/App.vue` (scoped styles, `.gradient-line`)

- [ ] **Step 1: Update gradient-line styles**

Replace the `.gradient-line` rule in the scoped style block (the `@use` imports for variables and tokens from Task 3 must be preserved at the top):

```scss
.gradient-line {
  background: linear-gradient(
    90deg,
    $color-red,
    $color-orange,
    $color-yellow,
    $color-light-orange,
    $color-light-yellow,
    $color-red
  );
  background-size: 200% 100%;
  height: 5px;
  animation: shimmer-gradient 8s linear infinite;
}

@keyframes shimmer-gradient {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

- [ ] **Step 2: Add reduced-motion override**

In the same scoped style block:

```scss
@include reduced-motion {
  .gradient-line {
    animation: none;
  }
}
```

- [ ] **Step 3: Run build and verify visually**

Run: `npm run dev`
Expected: Gradient bar slowly shimmers from left to right

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: animate top gradient bar with shimmer effect"
```

---

### Task 9: Smooth boss roster expand animation

**Files:**

- Modify: `src/components/RaidProgressionBox.vue` (template and styles)

- [ ] **Step 1: Update roster template markup**

Find the roster section in the template (the `<Transition name="roster">` wrapping the roster panel, lines 59-101). Replace `<Transition name="roster">` and the `v-if` with a grid-based expand wrapper using `v-show`:

```html
<div class="roster-wrapper" :class="{ expanded: expanded[boss.name] }">
  <div v-show="expanded[boss.name]" class="roster-inner" :aria-hidden="!expanded[boss.name]">
    <!-- existing roster content (role groups, player links, etc.) stays unchanged -->
  </div>
</div>
```

The `v-show` keeps DOM rendering conditional (avoids ~160 extra DOM nodes for hidden rosters) while allowing the grid animation. Remove the `<Transition name="roster">` wrapper.

- [ ] **Step 2: Replace roster transition styles**

Remove the old `.roster-enter-active`, `.roster-leave-active`, `.roster-enter-from`, `.roster-leave-to` classes (lines ~446-464). Add:

```scss
.roster-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows $duration-normal $ease-out;

  &.expanded {
    grid-template-rows: 1fr;
  }
}

.roster-inner {
  overflow: hidden;
}
```

- [ ] **Step 3: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 4: Verify visually**

Run: `npm run dev`
Expected: Clicking a boss row expands the roster smoothly without max-height jumps

- [ ] **Step 5: Commit**

```bash
git add src/components/RaidProgressionBox.vue
git commit -m "feat: replace max-height roster animation with smooth grid-rows transition"
```

---

### Task 10: Active nav indicator

**Files:**

- Modify: `src/components/HeaderView.vue` (styles)

- [ ] **Step 1: Add underline to active nav link**

In HeaderView.vue styles, update the `.router-link-active` rule and add hover indicator for non-active links:

```scss
.nav-link {
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -$space-1;
    left: 0;
    right: 0;
    height: 2px;
    background: $accent-color;
    border-radius: 1px;
    opacity: 0;
    transform: scaleX(0);
    transition:
      opacity $duration-normal $ease-default,
      transform $duration-normal $ease-default;
  }

  &:hover::after {
    opacity: 0.4;
    transform: scaleX(1);
  }
}

.router-link-active {
  color: $accent-color !important;

  &::after {
    opacity: 1;
    transform: scaleX(1);
    box-shadow: 0 0 8px rgba($accent-color, 0.4);
  }
}
```

- [ ] **Step 2: Hide indicator on mobile nav (stacked layout)**

Inside the `@media (max-width: 768px)` block for `.nav-links`, add:

```scss
.nav-link::after {
  display: none;
}
```

The mobile nav already uses `border-left` for the active indicator.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/components/HeaderView.vue
git commit -m "feat: add animated underline indicator for active nav link"
```

---

### Task 11: Focus & keyboard navigation improvements

**Files:**

- Modify: `src/App.vue` (global styles)

- [ ] **Step 1: Add global focus-visible styles**

In the global `<style lang="scss">` block of App.vue, add:

```scss
:focus-visible {
  outline: 2px solid $accent-color;
  outline-offset: 3px;
  border-radius: $radius-sm;
}

:focus:not(:focus-visible) {
  outline: none;
}
```

- [ ] **Step 2: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 3: Run lint**

Run: `npx eslint . --max-warnings=0`
Expected: Zero warnings

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: add consistent focus-visible states for keyboard navigation"
```

---

## Phase 3 — Immersion & Animation

### Task 12: Create useScrollReveal composable

**Files:**

- Create: `src/composables/useScrollReveal.js`
- Create: `src/composables/__tests__/useScrollReveal.spec.js`

- [ ] **Step 1: Write the test**

```js
// src/composables/__tests__/useScrollReveal.spec.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref, nextTick } from 'vue'
import { useScrollReveal } from '../useScrollReveal'

// Mock IntersectionObserver
const mockObserve = vi.fn()
const mockDisconnect = vi.fn()
const mockUnobserve = vi.fn()

let intersectionCallback

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn((callback) => {
    intersectionCallback = callback
    return {
      observe: mockObserve,
      disconnect: mockDisconnect,
      unobserve: mockUnobserve,
    }
  }),
)

// Minimal mount simulation
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    onMounted: (fn) => fn(),
    onUnmounted: (fn) => {
      // Store for later cleanup tests
      globalThis.__unmountFn = fn
    },
  }
})

describe('useScrollReveal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('observes .reveal elements within the container ref', () => {
    const mockEl = document.createElement('div')
    const revealChild = document.createElement('div')
    revealChild.classList.add('reveal')
    mockEl.appendChild(revealChild)

    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    expect(mockObserve).toHaveBeenCalledWith(revealChild)
  })

  it('adds revealed class when element intersects', () => {
    const mockEl = document.createElement('div')
    const revealChild = document.createElement('div')
    revealChild.classList.add('reveal')
    mockEl.appendChild(revealChild)

    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    intersectionCallback([{ target: revealChild, isIntersecting: true }])

    expect(revealChild.classList.contains('revealed')).toBe(true)
    expect(mockUnobserve).toHaveBeenCalledWith(revealChild)
  })

  it('disconnects observer on unmount', () => {
    const mockEl = document.createElement('div')
    const containerRef = ref(mockEl)
    useScrollReveal(containerRef)

    globalThis.__unmountFn()

    expect(mockDisconnect).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/composables/__tests__/useScrollReveal.spec.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write the composable**

```js
// src/composables/useScrollReveal.js
import { onMounted, onUnmounted } from 'vue'

/**
 * Observes `.reveal` elements within a container and adds `.revealed` class
 * when they scroll into view.
 * @param {import('vue').Ref<HTMLElement|null>} containerRef
 */
export function useScrollReveal(containerRef) {
  let observer

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' },
    )

    const container = containerRef.value ?? document.body
    container.querySelectorAll('.reveal').forEach((el) => observer.observe(el))
  })

  onUnmounted(() => observer?.disconnect())
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/composables/__tests__/useScrollReveal.spec.js`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/composables/useScrollReveal.js src/composables/__tests__/useScrollReveal.spec.js
git commit -m "feat: add useScrollReveal composable with IntersectionObserver"
```

---

### Task 13: Add scroll reveal CSS and apply to views

**Files:**

- Modify: `src/App.vue` (global styles)
- Modify: `src/views/HomeView.vue` (template + script)
- Modify: `src/views/AchievementsView.vue` (template + script)
- Modify: `src/views/RaidingView.vue` (template + script)
- Modify: `src/views/ContactView.vue` (template + script)

- [ ] **Step 1: Add reveal CSS classes to App.vue global styles**

```scss
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity $duration-slow $ease-out,
    transform $duration-slow $ease-out;

  &.revealed {
    opacity: 1;
    transform: translateY(0);
  }
}

// Stagger children
.reveal-stagger > .reveal {
  @for $i from 1 through 8 {
    &:nth-child(#{$i}) {
      transition-delay: #{($i - 1) * 100}ms;
    }
  }
}

@include reduced-motion {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Apply to HomeView.vue**

Add to script setup:

```js
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const homeRef = ref(null)
useScrollReveal(homeRef)
```

In template: wrap root element with `ref="homeRef"`. Add `class="reveal"` to the about-box, raid-schedule, and latest-achievement sections.

- [ ] **Step 3: Apply to AchievementsView.vue**

Same pattern: import composable, add ref, add `class="reveal"` and `class="reveal-stagger"` to the card list container. Each KillCard gets `class="reveal"`.

- [ ] **Step 4: Apply to RaidingView.vue and ContactView.vue**

Same pattern for each info-box section.

- [ ] **Step 5: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 6: Commit**

```bash
git add src/App.vue src/views/HomeView.vue src/views/AchievementsView.vue src/views/RaidingView.vue src/views/ContactView.vue
git commit -m "feat: add scroll-triggered fade-in animations to all views"
```

---

### Task 14: Animated progression bars

**Files:**

- Modify: `src/components/RaidProgressionBox.vue` (template + script + styles)

- [ ] **Step 1: Add visibility tracking**

In the script setup, add IntersectionObserver logic for the progress bars:

```js
import { ref, onMounted, onUnmounted } from 'vue'

const progressRef = ref(null)
const isVisible = ref(false)
let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.1 },
  )
  if (progressRef.value) observer.observe(progressRef.value)
})

onUnmounted(() => observer?.disconnect())
```

- [ ] **Step 2: Update template progress bar**

Change the progress bar fill to use CSS custom property:

```html
<div ref="progressRef" class="summary-track">
  <div
    class="summary-fill"
    :class="[difficulty, { animate: isVisible }]"
    :style="{ '--progress': pct(count) }"
  />
</div>
```

- [ ] **Step 3: Update styles**

```scss
.summary-fill {
  height: 100%;
  border-radius: 1px;
  width: 0;
  transition: width 1s $ease-out;

  &.animate {
    width: var(--progress);
  }
}

@include reduced-motion {
  .summary-fill {
    transition: none;
    width: var(--progress);
  }
}
```

- [ ] **Step 4: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/RaidProgressionBox.vue
git commit -m "feat: animate progression bars on scroll into view"
```

---

### Task 15: Glowing accent effects

**Files:**

- Modify: `src/assets/styles/_info-box.scss` (heading glow)
- Modify: `src/components/FadingDivider.vue` (divider glow)

- [ ] **Step 1: Add heading glow**

In `_info-box.scss`, update `.info-box-heading`:

```scss
.info-box-heading {
  color: $accent-color;
  margin-top: 0;
  text-shadow: 0 0 20px rgba($accent-color, 0.3);
}
```

- [ ] **Step 2: Add divider glow**

In `FadingDivider.vue`, update `.fading-divider`:

```scss
.fading-divider {
  border: none;
  height: 1px;
  margin: $space-8 0;
  background: linear-gradient(to right, transparent, $accent-color, transparent);
  opacity: 0.4;
  box-shadow: 0 0 12px rgba($accent-color, 0.15);
}
```

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/assets/styles/_info-box.scss src/components/FadingDivider.vue
git commit -m "feat: add subtle glow to accent headings and dividers"
```

---

### Task 16: Page transition upgrade

**Files:**

- Modify: `src/App.vue` (template + global styles)

- [ ] **Step 1: Rename transition in template**

Change `<Transition name="fade">` to `<Transition name="page">` in App.vue template.

- [ ] **Step 2: Replace transition CSS classes**

In the global style block, replace the `.fade-*` classes:

```scss
.page-enter-active {
  transition:
    opacity $duration-normal $ease-out,
    transform $duration-normal $ease-out;
}
.page-leave-active {
  transition: opacity $duration-fast $ease-default;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
}

@include reduced-motion {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
```

- [ ] **Step 3: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: upgrade page transitions to slide-fade effect"
```

---

## Phase 4 — Component Upgrades

### Task 17: Sticky header with scroll effect

**Files:**

- Modify: `src/components/HeaderView.vue` (script + styles)

- [ ] **Step 1: Add scroll detection to script**

Add to the `<script setup>`:

```js
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
let rafId = null

function onScroll() {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    isScrolled.value = window.scrollY > 50
    rafId = null
  })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (rafId) cancelAnimationFrame(rafId)
})
```

- [ ] **Step 2: Bind class to header element**

Add `:class="{ scrolled: isScrolled }"` to the header wrapper element in the template.

- [ ] **Step 3: Add sticky styles**

Note: The root element is `<div class="header-view">`, so styles target `.header-view`, not `.header`.

```scss
.header-view {
  position: sticky;
  top: 0;
  z-index: 100;
  background: transparent;
  transition:
    background $duration-normal $ease-default,
    backdrop-filter $duration-normal $ease-default;

  &.scrolled {
    background: rgba($surface-0, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid $color-border;
  }
}

.logo {
  transition: height $duration-normal $ease-default;

  .scrolled & {
    height: 10em;

    @include mobile {
      height: 6em;
    }
  }
}
```

- [ ] **Step 4: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/HeaderView.vue
git commit -m "feat: add sticky header with backdrop blur on scroll"
```

---

### Task 18: Better visual hierarchy on Home

**Files:**

- Modify: `src/views/HomeView.vue` (template + styles)

- [ ] **Step 1: Add section labels to template**

Above each main section, add small uppercase labels:

```html
<p class="section-label">LATEST ACHIEVEMENT</p>
<!-- existing achievement content -->

<FadingDivider />

<p class="section-label">RAID SCHEDULE</p>
<!-- existing schedule content -->

<FadingDivider />

<p class="section-label">ABOUT US</p>
<!-- existing about content -->
```

- [ ] **Step 2: Add hero area spacing**

Wrap the welcome heading and latest achievement in a hero section:

```html
<section class="hero-section">
  <h1 class="welcome-heading">...</h1>
  <div class="latest-achievement">...</div>
</section>
```

- [ ] **Step 3: Add styles**

```scss
.section-label {
  font-size: 0.75em;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $color-text-subtle;
  margin: 0 0 $space-4;
}

.hero-section {
  padding: $space-16 0 $space-8;
  text-align: center;
}
```

- [ ] **Step 4: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/views/HomeView.vue
git commit -m "feat: improve home page visual hierarchy with section labels and hero spacing"
```

---

### Task 19: Improved mobile kill cards

**Files:**

- Modify: `src/components/KillCard.vue` (template + styles)

- [ ] **Step 1: Update mobile layout**

Replace the image-hiding behavior at 640px with a compact horizontal layout. In styles, replace the `display: none` rules:

```scss
@media (max-width: 640px) {
  .card {
    display: flex;
    flex-direction: row;
  }

  .image-container {
    width: 120px;
    min-height: 80px;
    flex-shrink: 0;
    aspect-ratio: auto;
  }

  .raid-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: $radius-md 0 0 $radius-md;
  }

  .image-anchor {
    display: block;
    cursor: zoom-in;
  }

  .image-overlay {
    position: static;
    backdrop-filter: none;
    background: none;
  }

  .show-image-button {
    display: none;
  }

  .enlarge-indicator {
    display: none;
  }
}
```

- [ ] **Step 2: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 3: Verify visually at mobile width**

Run: `npm run dev`
Expected: Kill cards show small thumbnail on left, text on right at narrow widths

- [ ] **Step 4: Commit**

```bash
git add src/components/KillCard.vue
git commit -m "feat: show compact thumbnail on mobile kill cards instead of hiding images"
```

---

### Task 20: Difficulty-colored section accents

**Files:**

- Modify: `src/components/RaidProgressionBox.vue` (template + styles)

- [ ] **Step 1: Add data-difficulty attribute to boss list sections**

The current template renders bosses in a flat list per instance (not grouped by difficulty). Rather than restructuring the data flow, apply the difficulty accent at the **instance** level based on the highest cleared difficulty. In the template, wrap each `.instance` div:

```html
<div
  v-for="raid in raids"
  :key="raid.name"
  class="instance difficulty-section"
  :data-difficulty="highestDifficulty(raid)"
></div>
```

Add a helper function in script setup:

```js
function highestDifficulty(raid) {
  if (raid.bosses.some((b) => b.mythic)) return 'mythic'
  if (raid.bosses.some((b) => b.heroic)) return 'heroic'
  if (raid.bosses.some((b) => b.normal)) return 'normal'
  return 'normal'
}
```

- [ ] **Step 2: Add difficulty-section styles**

```scss
.difficulty-section {
  border-left: 3px solid var(--difficulty-color);
  padding-left: $space-4;
  margin-bottom: $space-4;

  &[data-difficulty='normal'] {
    --difficulty-color: #{$quality-rare};
  }
  &[data-difficulty='heroic'] {
    --difficulty-color: #{$quality-epic};
  }
  &[data-difficulty='mythic'] {
    --difficulty-color: #{$quality-legendary};
  }
}

.difficulty-label {
  font-size: 0.75em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--difficulty-color);
  margin-bottom: $space-2;
}
```

- [ ] **Step 3: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/RaidProgressionBox.vue
git commit -m "feat: add difficulty-colored left borders and labels to progression sections"
```

---

### Task 21: Footer redesign

**Files:**

- Modify: `src/components/FooterView.vue` (template + styles)

- [ ] **Step 1: Update template**

Replace the footer template with a three-column layout:

```html
<footer class="footer">
  <FadingDivider class="footer-divider" />
  <div class="footer-content">
    <div class="footer-brand">
      <img src="@/assets/images/logo.png" alt="Aztecs" class="footer-logo" />
    </div>
    <div class="footer-links">
      <h4 class="footer-heading">Quick Links</h4>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/raiding">Raiding</RouterLink>
        <RouterLink to="/achievements">Achievements</RouterLink>
        <RouterLink to="/contact">Contact</RouterLink>
      </nav>
    </div>
    <div class="footer-social">
      <h4 class="footer-heading">Community</h4>
      <nav>
        <a href="https://discord.gg/GfmnD24VHa" target="_blank" rel="noopener">Discord</a>
        <a href="https://www.warcraftlogs.com/guild/eu/alakir/aztecs" target="_blank" rel="noopener"
          >Warcraft Logs</a
        >
        <a href="https://raider.io/guilds/eu/alakir/Aztecs" target="_blank" rel="noopener"
          >Raider.IO</a
        >
      </nav>
    </div>
  </div>
  <p class="footer-copyright">&copy; {{ new Date().getFullYear() }} Aztecs - Al'Akir (EU)</p>
</footer>
```

URLs sourced from existing codebase: Discord from `HeaderView.vue:85`, Raider.IO from `RaidProgressionBox.vue:119`.

- [ ] **Step 2: Add footer styles**

```scss
.footer {
  width: 100%;
  background: $surface-1;
  border-top: 1px solid $color-border;
  padding: $space-8 $space-8 $space-12;
  box-sizing: border-box;
}

.footer-divider {
  display: none;
}

.footer-content {
  display: grid;
  grid-template-columns: auto 1fr 1fr;
  gap: $space-12;
  max-width: 60rem;
  margin: 0 auto $space-8;
  align-items: start;

  @include tablet {
    grid-template-columns: 1fr 1fr;
  }

  @include mobile {
    grid-template-columns: 1fr;
    gap: $space-6;
    text-align: center;
  }
}

.footer-logo {
  height: 5em;
  opacity: 0.7;

  @include mobile {
    margin: 0 auto;
    display: block;
  }

  @include tablet {
    display: none;
  }
}

.footer-heading {
  font-size: 0.8em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: $color-text-muted;
  margin: 0 0 $space-3;
}

.footer-links nav,
.footer-social nav {
  display: flex;
  flex-direction: column;
  gap: $space-2;

  a {
    color: $color-text-muted;
    text-decoration: none;
    font-size: 0.9em;
    transition: color $duration-fast $ease-default;

    &:hover {
      color: $accent-color;
    }
  }
}

.footer-copyright {
  text-align: center;
  margin: 0;
  font-size: 0.85em;
  color: $color-text-subtle;
}
```

- [ ] **Step 3: Add RouterLink import**

Make sure `RouterLink` is available (should be auto-imported in Vue 3 with vue-router).

- [ ] **Step 4: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 5: Commit**

```bash
git add src/components/FooterView.vue
git commit -m "feat: redesign footer with three-column layout, nav links, and social links"
```

---

## Phase 5 — Layout Overhauls

### Task 22: Enhanced kill card gallery layout

**Files:**

- Modify: `src/views/AchievementsView.vue` (styles)
- Modify: `src/components/KillCard.vue` (styles)

- [ ] **Step 1: Remove FadingDivider from template and update layout**

The current template renders `<FadingDivider>` between cards. In a grid layout these become grid items and break the layout. Remove them and rely on `gap` for spacing:

```html
<div class="achievements-view content-wrapper">
  <KillCard
    v-for="(kill, idx) in kills"
    :key="kill.raidName + '-' + idx"
    :raidName="kill.raidName"
    :imageUrl="kill.imageUrl"
    :date="kill.date"
    :attempts="kill.attempts"
    :tanks="kill.tanks"
    :healers="kill.healers"
    :dds="kill.dds"
  />
</div>
```

Remove the `FadingDivider` import if no longer used in this file.

Replace the `.achievements-view` styles:

```scss
.achievements-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: $space-6;

  @include tablet {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Update KillCard max-width rules**

Remove the responsive max-width rules (95vw/66vw/55vw) from `.card` and replace with:

```scss
.card {
  width: 100%;
  // Remove: max-width: 95vw / 66vw / 55vw
}
```

- [ ] **Step 3: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 4: Verify visually at various widths**

Run: `npm run dev`
Expected: 2-column grid on wide screens, single column on tablet/mobile. Cards fill their grid cells.

- [ ] **Step 5: Commit**

```bash
git add src/views/AchievementsView.vue src/components/KillCard.vue
git commit -m "feat: upgrade achievements page to responsive grid layout"
```

---

### Task 23: Loading skeleton for progression

**Files:**

- Create: `src/components/SkeletonLoader.vue`
- Modify: `src/components/RaidProgressionBox.vue` (template)

- [ ] **Step 1: Create SkeletonLoader component**

```vue
<script setup>
defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
})
</script>

<template>
  <div class="skeleton" :style="{ width, height }">
    <div class="skeleton-shimmer" />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.skeleton {
  background: $surface-1;
  border-radius: $radius-md;
  overflow: hidden;
  position: relative;
}

.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  animation: shimmer-skeleton 1.5s infinite;
}

@keyframes shimmer-skeleton {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@include reduced-motion {
  .skeleton-shimmer {
    animation: none;
  }
}
</style>
```

- [ ] **Step 2: Add skeleton placeholders to RaidProgressionBox**

In `RaidProgressionBox.vue`, add a loading state. When progression data is empty or loading, show skeletons:

```html
<template v-if="!hasData">
  <div class="skeleton-pills">
    <SkeletonLoader width="120px" height="3.5rem" />
    <SkeletonLoader width="120px" height="3.5rem" />
    <SkeletonLoader width="120px" height="3.5rem" />
  </div>
  <SkeletonLoader width="100%" height="2px" />
  <div class="skeleton-bosses">
    <SkeletonLoader v-for="i in 5" :key="i" width="100%" height="2.2rem" />
  </div>
</template>
```

Add styles:

```scss
.skeleton-pills {
  display: flex;
  gap: $space-2;
  margin-bottom: $space-4;
}

.skeleton-bosses {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
```

- [ ] **Step 3: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 4: Commit**

```bash
git add src/components/SkeletonLoader.vue src/components/RaidProgressionBox.vue
git commit -m "feat: add skeleton loading placeholders for progression data"
```

---

## Phase 6 — Hero & Interactive Polish

### Task 24: Hero section with background atmosphere

**Files:**

- Create: `src/components/EmberParticles.vue`
- Modify: `src/views/HomeView.vue` (template)

- [ ] **Step 1: Create EmberParticles component**

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let particles = []
let onVisibilityChange = null

const PARTICLE_COUNT = 20
const COLORS = ['#ffa203', '#ff8a05', '#f5bd25', '#fe691e']

function createParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 20,
    size: 1 + Math.random() * 2,
    speedY: 0.3 + Math.random() * 0.7,
    speedX: (Math.random() - 0.5) * 0.3,
    opacity: 0.1 + Math.random() * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }
}

// Particles are mutated in-place intentionally — this is a performance-critical
// animation loop where allocating new objects per frame would cause GC pressure.
function draw(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const p of particles) {
    ctx.globalAlpha = p.opacity
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()

    p.y -= p.speedY
    p.x += Math.sin(p.y * 0.01) * p.speedX

    if (p.y < -10) {
      Object.assign(p, createParticle(canvas))
    }
  }

  animationId = requestAnimationFrame(() => draw(canvas, ctx))
}

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height

  particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(canvas))
  // Randomize initial Y so particles are spread out on load
  for (const p of particles) {
    p.y = Math.random() * canvas.height
  }

  draw(canvas, ctx)

  // Pause when tab hidden
  onVisibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId)
      animationId = null
    } else {
      draw(canvas, ctx)
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <canvas ref="canvasRef" class="ember-canvas" aria-hidden="true" />
</template>

<style scoped lang="scss">
.ember-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
```

- [ ] **Step 2: Add to HomeView hero section**

In `HomeView.vue`, wrap the hero section with relative positioning and add EmberParticles:

```html
<section class="hero-section">
  <EmberParticles />
  <h1 class="welcome-heading" style="position: relative; z-index: 1;">...</h1>
  <div class="latest-achievement" style="position: relative; z-index: 1;">...</div>
</section>
```

Add to hero-section styles:

```scss
.hero-section {
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at center, rgba(255, 162, 3, 0.03) 0%, transparent 70%);
}
```

- [ ] **Step 3: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 4: Verify visually**

Run: `npm run dev`
Expected: Subtle floating ember particles in the hero section, pausing when tab hidden

- [ ] **Step 5: Commit**

```bash
git add src/components/EmberParticles.vue src/views/HomeView.vue
git commit -m "feat: add ambient ember particle effect to home page hero section"
```

---

### Task 25: Kill card hover parallax

**Files:**

- Create: `src/composables/useTiltEffect.js`
- Modify: `src/components/KillCard.vue` (script + template + styles)

- [ ] **Step 1: Create the useTiltEffect composable**

```js
// src/composables/useTiltEffect.js
import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Adds a 3D tilt effect on mouse hover. Returns a reactive style object
 * to bind to the element. Desktop only (requires hover capability).
 * @param {import('vue').Ref<HTMLElement|null>} elementRef
 * @param {{ maxTilt?: number, scale?: number }} options
 * @returns {{ tiltStyle: import('vue').Ref<object> }}
 */
export function useTiltEffect(elementRef, { maxTilt = 8, scale = 1.02 } = {}) {
  const tiltStyle = ref({})

  const supportsHover = window.matchMedia('(hover: hover)').matches
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!supportsHover || prefersReduced) {
    return { tiltStyle }
  }

  function handleMouseMove(e) {
    const rect = elementRef.value.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    tiltStyle.value = {
      transform: `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale(${scale})`,
      willChange: 'transform',
    }
  }

  function handleMouseLeave() {
    tiltStyle.value = { willChange: 'auto' }
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (!el) return
    el.removeEventListener('mousemove', handleMouseMove)
    el.removeEventListener('mouseleave', handleMouseLeave)
  })

  return { tiltStyle }
}
```

- [ ] **Step 2: Apply to KillCard**

In `KillCard.vue` script setup:

```js
import { ref } from 'vue'
import { useTiltEffect } from '@/composables/useTiltEffect'

const cardRef = ref(null)
const { tiltStyle } = useTiltEffect(cardRef)
```

In template, add to the card element:

```html
<div ref="cardRef" class="card" :style="tiltStyle"></div>
```

- [ ] **Step 3: Update card transition style**

```scss
.card {
  transition:
    transform $duration-normal $ease-out,
    box-shadow $duration-normal $ease-default;
}
```

Remove the existing `transform: translateY(-2px)` hover effect (the tilt replaces it).

- [ ] **Step 4: Run build and tests**

Run: `npm run build && npm test`
Expected: Build succeeds, all tests pass

- [ ] **Step 5: Run full lint check**

Run: `npx eslint . --max-warnings=0`
Expected: Zero warnings

- [ ] **Step 6: Commit**

```bash
git add src/composables/useTiltEffect.js src/components/KillCard.vue
git commit -m "feat: add 3D tilt hover effect to kill cards"
```

---

## Final Verification

### Task 26: Full build, lint, and test verification

- [ ] **Step 1: Run complete lint**

Run: `npx eslint . --max-warnings=0`
Expected: Zero warnings

- [ ] **Step 2: Run full test suite**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 4: Visual smoke test**

Run: `npm run dev`
Verify:

- Noise texture visible on dark background
- Gradient bar shimmers
- Nav indicator shows on active page
- Scroll reveals work on all pages
- Progression bars animate on scroll
- Header sticks and blurs on scroll
- Kill cards tilt on hover (desktop)
- Mobile kill cards show thumbnails
- Footer has three columns
- Achievements grid is 2-column on wide screens
- Ember particles float on home page
- Reduced motion media query disables animations
