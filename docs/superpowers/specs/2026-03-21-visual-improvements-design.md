# Visual Improvements — Full Design Spec

Comprehensive visual overhaul of the Aztecs guild website across 6 phases: foundation tokens, quick visual wins, immersion & animation, component upgrades, layout overhauls, and hero polish.

> **Note on numbering:** Items retain their original brainstorm IDs (1-25) for traceability. Within each phase, they are grouped by theme, not sequential order.

## Phase 1 — Foundation & Design Tokens

Items: 1, 2, 3, 4, 5, 22, 23

### 1. Unified Spacing Scale

Add to `_variables.scss` (or new `_tokens.scss`):

```scss
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
```

Migrate all components from ad-hoc values (1.875rem, 1.625rem, 0.625rem, etc.) to the nearest scale value.

### 2. Consistent Border Treatment

Replace all dashed/dotted borders on info boxes and cards with:

```scss
$color-border: rgba(255, 255, 255, 0.08);
$color-border-hover: rgba(255, 255, 255, 0.15);
$color-border-accent: rgba($accent-color, 0.3);
```

- `.info-box`: Change from `1px dashed $accent-color` to `1px solid $color-border`
- Home about box: Change from `2px dotted $color-yellow` to `1px solid $color-border`
- Contact box: Same treatment
- On hover, border transitions to `$color-border-hover`
- Accent-bordered variants available via `$color-border-accent` for emphasis

### 3. Transition Timing Tokens

```scss
$duration-fast: 150ms;
$duration-normal: 250ms;
$duration-slow: 400ms;

$ease-default: ease;
$ease-out: cubic-bezier(0.16, 1, 0.3, 1); // smooth deceleration for reveals/expands
$ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); // slight overshoot for playful interactions
```

Replace all hardcoded `0.2s ease`, `0.25s ease`, `0.3s ease` with the appropriate token.

### 4. Border-Radius Tokens

```scss
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 16px;
$radius-xl: 20px;
```

Migrate: boss pips → `$radius-sm`, buttons/pills → `$radius-md`, cards → `$radius-lg`, info boxes → `$radius-xl`.

### 5. Breakpoint Mixins

```scss
@mixin mobile {
  @media (max-width: 600px) {
    @content;
  }
}
@mixin mobile-sm {
  @media (max-width: 400px) {
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
```

**Breakpoint migration plan:**

| Current value | Mixin target          | Notes                             |
| ------------- | --------------------- | --------------------------------- |
| 400px         | `@include mobile-sm`  | HomeView heading                  |
| 500px         | raw `@media`          | One-off for summary pills         |
| 600px         | `@include mobile`     | Primary mobile breakpoint         |
| 640px         | raw `@media`          | One-off for KillCard image hide   |
| 700px         | `@include tablet`     | Round up from 700→900 or keep raw |
| 768px         | raw `@media`          | Header hamburger, keep as-is      |
| 900px         | `@include tablet`     | Content padding                   |
| 1200px        | `@include desktop-sm` | Welcome heading, KillCard widths  |

One-off breakpoints (500px, 640px, 768px) remain as raw `@media` queries. Named mixins cover the 4 primary breakpoints.

### 22. Layered Surface Colors

```scss
$surface-0: #111; // page background
$surface-1: #161616; // card/section backgrounds
$surface-2: #1c1c1c; // elevated elements, hover states
$surface-3: #222; // active/pressed states
$surface-accent-hover: rgba($color-yellow, 0.05); // warm accent tint for interactive hover
```

- `.info-box` background → `$surface-1` instead of `rgba(255, 255, 255, 0.02)`
- `.info-box:hover` background → `$surface-accent-hover` (preserves warm tint from current design)
- Boss entry rows → `$surface-1`
- Even table rows → `$surface-1`
- Non-interactive elevated elements → `$surface-2`
- Replace scattered `rgba(255, 255, 255, 0.03-0.06)` values

### 23. Semantic Color Tokens

```scss
$color-text-primary: #ffffff;
$color-text-muted: rgba(255, 255, 255, 0.6);
$color-text-subtle: rgba(255, 255, 255, 0.4);
```

Use in: footer text (currently raw `0.6 opacity`), meta information, secondary labels.

---

## Phase 2 — Quick Visual Wins

Items: 12, 13, 18, 19, 20

### 12. Noise Texture Background

Add a subtle CSS noise overlay using a dedicated overlay div in `App.vue` (not a pseudo-element on body, since body is a flex container and pseudo-elements become flex items):

```html
<!-- In App.vue template, first child of #app -->
<div class="noise-overlay" aria-hidden="true" />
```

```scss
.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url('data:image/svg+xml,...'); // tiny noise pattern
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
}
```

### 13. Animated Top Gradient Bar

Transform the static 5px gradient bar into a shimmering accent:

```scss
.gradient-bar {
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

Slow 8s cycle — subtle enough to not be distracting, but alive.

### 18. Smooth Boss Roster Expand

Replace `max-height` animation with CSS `grid-template-rows` trick:

```scss
.roster-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows $duration-normal $ease-out;

  &.expanded {
    grid-template-rows: 1fr;
  }

  .roster-inner {
    overflow: hidden;
  }
}
```

This animates to the content's natural height without the jarring max-height jump.

### 19. Active Nav Indicator

Add an animated underline to the active nav link:

```scss
.router-link-active {
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 0;
    right: 0;
    height: 2px;
    background: $accent-color;
    border-radius: 1px;
    box-shadow: 0 0 8px rgba($accent-color, 0.4);
  }
}
```

The underline has a subtle glow matching the accent color. On nav link hover (non-active), show the line at reduced opacity.

### 20. Focus & Keyboard Navigation

Add visible focus states to all interactive elements:

```scss
:focus-visible {
  outline: 2px solid $accent-color;
  outline-offset: 3px;
  border-radius: $radius-sm;
}

// Suppress for mouse users
:focus:not(:focus-visible) {
  outline: none;
}
```

Apply to: nav links, buttons, kill card clickable areas, boss rows, lightbox controls.

---

## Phase 3 — Immersion & Animation

Items: 6, 7, 9, 11

### 6. Scroll-Triggered Fade-In Animations

Create a `useScrollReveal` composable using IntersectionObserver. The composable accepts a container ref to scope observation (avoids querying the entire DOM):

```js
// src/composables/useScrollReveal.js
import { onMounted, onUnmounted } from 'vue'

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

Usage in a view:

```vue
<script setup>
import { ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const sectionRef = ref(null)
useScrollReveal(sectionRef)
</script>

<template>
  <div ref="sectionRef">
    <div class="info-box reveal">...</div>
  </div>
</template>
```

CSS:

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
```

Apply `.reveal` class to: info boxes, kill cards, progression box sections, home page sections. Stagger siblings with `transition-delay` increments (e.g., `.reveal:nth-child(2) { transition-delay: 100ms; }`).

### 7. Animated Progression Bars

The progress bar fill in `RaidProgressionBox.vue` should animate from 0% to actual width on mount/reveal. Refactor the current inline `width` style to use a CSS custom property:

```html
<!-- Template change -->
<div
  class="progress-fill"
  :class="{ animate: isVisible }"
  :style="{ '--progress': pct(summary.normal) }"
/>
```

```scss
.progress-fill {
  width: 0;
  transition: width 1s $ease-out;

  &.animate {
    width: var(--progress);
  }
}
```

Trigger `isVisible` via IntersectionObserver (reuse `useScrollReveal` pattern or a local observer). The bar sweeps from left to right over 1 second.

### 9. Glowing Accent Effects

Add subtle glow to key accent elements:

```scss
// Headings
.info-box-heading {
  text-shadow: 0 0 20px rgba($accent-color, 0.3);
}

// FadingDivider
.fading-divider {
  box-shadow: 0 0 12px rgba($accent-color, 0.15);
}

// Active nav (enhances the indicator from item 19)
.router-link-active::after {
  box-shadow: 0 0 8px rgba($accent-color, 0.4);
}
```

Subtle bloom — visible on dark backgrounds without being garish.

### 11. Page Transition Upgrades

Replace the basic opacity fade with a slide-fade. Requires coordinated changes:

1. **`App.vue` template:** Rename `<Transition name="fade">` to `<Transition name="page">`
2. **`App.vue` styles:** Replace `.fade-*` classes with `.page-*` classes:

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
```

New page slides up slightly as it fades in. Old page simply fades out (no movement to avoid layout shift).

---

## Phase 4 — Component Upgrades

Items: 14, 15, 17, 24, 25

### 14. Sticky Header with Scroll Effect

Make header stick on scroll with a backdrop blur. Use `position: sticky` — this keeps the header in flow (no body padding needed). The gradient bar above the header in `App.vue` will scroll away naturally while the header sticks.

```js
// In HeaderView.vue
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

```scss
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  transition:
    background $duration-normal $ease-default,
    backdrop-filter $duration-normal $ease-default;

  &.scrolled {
    background: rgba($surface-0, 0.85);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid $color-border;
  }
}
```

On scroll past 50px: background becomes semi-transparent with blur, subtle bottom border appears. Logo shrinks slightly (14em → 10em) with a smooth transition. The scroll listener is throttled via `requestAnimationFrame` to avoid firing on every pixel.

### 15. Better Visual Hierarchy on Home

Restructure the home page into distinct visual sections:

- **Hero area**: Welcome heading + latest achievement get a full-width section with more vertical space (`$space-16` top/bottom padding)
- **Raid schedule**: Move into a visually distinct card with `$surface-1` background, icon decorations for raid days
- **About section**: Keep the info-box style but with the new `$surface-1` background and `$color-border` treatment
- **Section headings**: Add small uppercase labels above each section ("RAID SCHEDULE", "ABOUT US") in `$color-text-subtle` with letter-spacing

Each section separated by `FadingDivider` with more generous spacing.

### 17. Improved Mobile Kill Cards

Instead of hiding images entirely below 640px, show a compact horizontal layout:

```scss
@include mobile {
  .kill-card {
    flex-direction: row;

    .kill-image {
      display: block;
      width: 120px;
      height: 80px;
      object-fit: cover;
      border-radius: $radius-md 0 0 $radius-md;
      flex-shrink: 0;
    }
  }
}
```

Small thumbnail on the left, text content on the right. Remove the "Show Image" button — the thumbnail serves that purpose. Tapping the thumbnail opens the lightbox.

### 24. Difficulty-Colored Section Accents

Use WoW difficulty colors more prominently in the progression display:

```scss
.difficulty-section {
  border-left: 3px solid var(--difficulty-color);
  padding-left: $space-4;

  &[data-difficulty='normal'] {
    --difficulty-color: #{$quality-rare};
  } // blue
  &[data-difficulty='heroic'] {
    --difficulty-color: #{$quality-epic};
  } // purple
  &[data-difficulty='mythic'] {
    --difficulty-color: #{$quality-legendary};
  } // orange
}
```

Each difficulty tier gets a colored left border on its boss list. The progress bar fill color also matches the difficulty. Section headers show the difficulty name in its corresponding color.

### 25. Footer Redesign

Expand the footer from just copyright to a proper closing section:

```
┌────────────────────────────────────────────┐
│  FadingDivider                             │
│                                            │
│  [Logo small]   Quick Links    Social      │
│                 Home           [Discord]    │
│                 Raiding        [WCL]       │
│                 Achievements   [Raider.IO] │
│                 Contact                    │
│                                            │
│  © <dynamic year> Aztecs - Al'Akir (EU)   │
└────────────────────────────────────────────┘
```

- Background: `$surface-1` to visually separate from content
- Three-column layout on desktop, stacked on mobile
- Small logo, nav links, and social/external links (Discord, Warcraft Logs, Raider.IO)
- Copyright stays at bottom (year is dynamic via `new Date().getFullYear()`, not hardcoded)
- Subtle top border or gradient fade transition into the footer

---

## Phase 5 — Layout Overhauls

Items: 16, 21

### 16. Enhanced Kill Card Gallery

Replace the vertical list on Achievements with a responsive grid layout. KillCard's existing `max-width` rules must be removed and replaced with `width: 100%` so cards fill their grid cell:

```scss
.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: $space-6;

  @include tablet {
    grid-template-columns: 1fr;
  }
}

// KillCard migration
.kill-card {
  width: 100%; // replaces max-width: 55vw/66vw/95vw
}
```

Cards in a 2-column grid on wide screens, single column on tablet/mobile. Each card is a self-contained unit — minimal changes to KillCard internals.

Optional enhancement: Add a subtle vertical timeline line on the left side connecting cards chronologically (CSS `::before` on the container).

### 21. Loading Skeleton for Progression

Create a `SkeletonLoader.vue` component:

```vue
<template>
  <div class="skeleton" :style="{ width, height }">
    <div class="skeleton-shimmer" />
  </div>
</template>
```

```scss
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
```

Note: Uses `shimmer-skeleton` keyframe name to avoid collision with `shimmer-gradient` from item 13.

Use in `RaidProgressionBox.vue` — show skeleton rows matching boss entry dimensions while data loads. Show 2-3 skeleton pills for the summary area.

---

## Phase 6 — Hero & Interactive Polish

Items: 8, 10

### 8. Hero Section with Background Atmosphere

Add ambient floating ember/particle effect to the home page hero area using a lightweight canvas element:

- Small canvas behind the hero content, positioned absolute
- 15-25 tiny orange/yellow particles drifting upward slowly
- Particles: 1-3px circles, varying opacity (0.1-0.4), slow upward drift with slight horizontal sway
- Performance: Uses `requestAnimationFrame`, pauses when tab not visible, respects `prefers-reduced-motion`
- Canvas size matches hero section, not full page

Alternatively (simpler): Pure CSS approach with 5-8 `::before`/`::after` pseudo-elements using `@keyframes float` — less particles but zero JS overhead.

A very dark, subtle radial gradient overlay (dark center fading to slightly lighter edges) adds depth behind the heading.

### 10. Kill Card Hover Parallax

Add a 3D tilt effect on desktop hover. The composable returns reactive style bindings instead of mutating the DOM directly (per project preference for side-effect-free functions):

```js
// src/composables/useTiltEffect.js
import { ref, onMounted, onUnmounted } from 'vue'

export function useTiltEffect(elementRef, { maxTilt = 8, scale = 1.02 } = {}) {
  const tiltStyle = ref({})

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
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)
  })

  onUnmounted(() => {
    const el = elementRef.value
    el?.removeEventListener('mousemove', handleMouseMove)
    el?.removeEventListener('mouseleave', handleMouseLeave)
  })

  return { tiltStyle }
}
```

Usage: `<div ref="cardRef" :style="tiltStyle">`. The `will-change` property is toggled on/off with hover to avoid permanent GPU memory allocation across many cards on the Achievements page.

```scss
.kill-card {
  transition: transform $duration-normal $ease-out;
}
```

- Max 8° tilt, subtle 1.02x scale on hover
- Image inside shifts slightly opposite direction for depth
- Only on desktop (disabled on touch via `@media (hover: hover)` check)
- Smooth return to flat on mouse leave

---

## Cross-Cutting Concerns

### Accessibility

All animations respect `prefers-reduced-motion`:

```scss
@mixin reduced-motion {
  @media (prefers-reduced-motion: reduce) {
    @content;
  }
}

// Applied globally
@include reduced-motion {
  .reveal {
    transition: none;
    opacity: 1;
    transform: none;
  }
  .shimmer-gradient,
  .shimmer-skeleton,
  .gradient-bar {
    animation: none;
  }
  .progress-fill {
    transition: none;
  }
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}
```

- Focus states (item 20) are visible and consistent
- Color contrast ratios maintained — new surface colors tested against text colors
- Glow effects are decorative, not conveying information

### Performance

- No JS libraries added — all animations are CSS or lightweight vanilla JS
- IntersectionObserver for scroll reveals (no scroll event listeners for animations)
- Canvas particles (item 8) pause when page not visible
- `will-change` toggled on/off with hover, not applied permanently
- Noise texture is tiny inline SVG, not an external asset
- Scroll listener in sticky header is throttled via `requestAnimationFrame`

### Testing

- Existing vitest tests must pass after each phase
- No new visual regression tests required (project doesn't use them)
- CI zero-warning ESLint check must continue to pass
- Manual verification of responsive behavior at each breakpoint after phases that touch layout

### Migration Strategy

Each phase is a separate PR. Phase 1 (tokens) lands first. Subsequent phases use the tokens. Components are migrated file-by-file — no big-bang rewrite of styles. Tests run after each phase to catch regressions.
