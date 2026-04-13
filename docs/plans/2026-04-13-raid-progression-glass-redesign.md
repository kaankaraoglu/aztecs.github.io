# Raid Progression Glass Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `RaidProgressionBox` with a glassmorphism aesthetic — glass-chip boss rows, stacked glowing progress bars, compact header with difficulty badge — and lift the site background token from `#111` to `#181820`.

**Architecture:** Two token changes propagate the lifted background site-wide for free. The component redesign is self-contained inside `RaidProgressionBox.vue` — props, composables, and all existing functionality (expandable rosters, analytics, responsive layout, scroll-reveal) are untouched. No new files are created.

**Tech Stack:** Vue 3 `<script setup>`, SCSS with `@use`, Vitest, ESLint + Prettier via lint-staged.

---

## File Map

| File                                    | What changes                                    |
| --------------------------------------- | ----------------------------------------------- |
| `src/assets/styles/_variables.scss`     | `$background-color` token `#111` → `#181820`    |
| `src/assets/styles/_tokens.scss`        | `$surface-0` token `#111` → `#181820`           |
| `src/components/RaidProgressionBox.vue` | Template + script + SCSS — full visual redesign |

---

## Task 1: Lift the background tokens

**Files:**

- Modify: `src/assets/styles/_variables.scss`
- Modify: `src/assets/styles/_tokens.scss`

- [ ] **Step 1.1 — Update `$background-color` in `_variables.scss`**

  Open `src/assets/styles/_variables.scss`. Change line:

  ```scss
  // Before
  $background-color: #111;

  // After
  $background-color: #181820;
  ```

- [ ] **Step 1.2 — Update `$surface-0` in `_tokens.scss`**

  Open `src/assets/styles/_tokens.scss`. Change line:

  ```scss
  // Before
  $surface-0: #111; // page background

  // After
  $surface-0: #181820; // page background
  ```

- [ ] **Step 1.3 — Start the dev server and verify**

  ```bash
  npm run dev
  ```

  Open the site. The page background should lift from flat black to a very subtly warm-dark tone. All cards and surfaces should look slightly elevated. No layout shifts, no broken colours.

- [ ] **Step 1.4 — Run tests**

  ```bash
  npm test
  ```

  Expected: all tests pass (kills.spec.js and any others).

- [ ] **Step 1.5 — Commit**

  ```bash
  git add src/assets/styles/_variables.scss src/assets/styles/_tokens.scss
  git commit -m "chore: lift background token to #181820 for glassmorphism base"
  ```

---

## Task 2: Redesign the header

**Files:**

- Modify: `src/components/RaidProgressionBox.vue`

The existing `.box-title` (`<h3 class="box-title">Raids</h3>`) is replaced with a flex row showing "RAIDS · Raid Name" on the left and a difficulty badge on the right.

- [ ] **Step 2.1 — Add `computed` to imports**

  In `<script setup>`, the current import is:

  ```js
  import { reactive, ref, onMounted, onUnmounted } from 'vue'
  ```

  Change to:

  ```js
  import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
  ```

- [ ] **Step 2.2 — Add badge computed properties**

  After the `props` definition block, add:

  ```js
  const badgeDifficulty = computed(() => {
    if (props.summary.mythic > 0) return 'mythic'
    if (props.summary.heroic > 0) return 'heroic'
    if (props.summary.normal > 0) return 'normal'
    return null
  })

  const badgeText = computed(() => {
    const s = props.summary
    if (s.mythic > 0) return `${s.mythic}/${s.total} M`
    if (s.heroic > 0) return `${s.heroic}/${s.total} HC`
    if (s.normal > 0) return `${s.normal}/${s.total} N`
    return null
  })
  ```

- [ ] **Step 2.3 — Replace `.box-title` in the template**

  Find this in the template (inside `<template v-else>`):

  ```html
  <h3 class="box-title">Raids</h3>
  ```

  Replace with:

  ```html
  <div class="raid-header">
    <div class="raid-header-left">
      <span class="raid-label">Raids</span>
      <span class="raid-separator">·</span>
      <span class="raid-name" :class="`header-difficulty-${highestDifficulty(raids[0])}`">
        {{ raids[0].name }}
      </span>
    </div>
    <div v-if="badgeDifficulty" class="raid-badge" :class="`badge-${badgeDifficulty}`">
      {{ badgeText }}
    </div>
  </div>
  ```

- [ ] **Step 2.4 — Replace `.box-title` SCSS with header styles**

  In `<style lang="scss" scoped>`, find and remove the `.box-title` block:

  ```scss
  .box-title {
    margin: 0 0 0.75rem;
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
    text-shadow: 0 0 20px rgba($accent-color, 0.3);
    opacity: 0.6;
  }
  ```

  Replace with:

  ```scss
  .raid-header {
    display: flex;
    align-items: baseline;
    gap: $space-2;
    margin-bottom: $space-3;
  }

  .raid-header-left {
    display: flex;
    align-items: baseline;
    gap: $space-2;
    min-width: 0;
    overflow: hidden;
  }

  .raid-label {
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
    text-shadow: 0 0 20px rgba($accent-color, 0.3);
    opacity: 0.6;
    flex-shrink: 0;
  }

  .raid-separator {
    opacity: 0.25;
    flex-shrink: 0;
    font-size: 0.8em;
  }

  .raid-name {
    font-size: 0.6em;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-difficulty-normal {
    color: $quality-rare;
  }
  .header-difficulty-heroic {
    color: $quality-epic;
  }
  .header-difficulty-mythic {
    color: $quality-legendary;
  }

  .raid-badge {
    margin-left: auto;
    font-size: 0.58em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.15rem 0.5rem;
    border-radius: $radius-sm;
    flex-shrink: 0;
    line-height: 1.6;

    &.badge-normal {
      color: $quality-rare;
      background: rgba($quality-rare, 0.15);
      border: 1px solid rgba($quality-rare, 0.4);
    }

    &.badge-heroic {
      color: $quality-epic;
      background: rgba($quality-epic, 0.18);
      border: 1px solid rgba($quality-epic, 0.42);
    }

    &.badge-mythic {
      color: $quality-legendary;
      background: rgba($quality-legendary, 0.15);
      border: 1px solid rgba($quality-legendary, 0.4);
      box-shadow: 0 0 10px rgba($quality-legendary, 0.2);
    }
  }
  ```

- [ ] **Step 2.5 — Verify in browser**

  With the dev server still running, check the homepage. The header should show e.g. "RAIDS · Nerub-ar Palace" with a purple "6/8 HC" badge on the right. If no kills exist, the badge should be absent.

- [ ] **Step 2.6 — Run lint and tests**

  ```bash
  npm run lint && npm test
  ```

  Expected: no errors, all tests pass.

- [ ] **Step 2.7 — Commit**

  ```bash
  git add src/components/RaidProgressionBox.vue
  git commit -m "feat: redesign RaidProgressionBox header with difficulty badge"
  ```

---

## Task 3: Redesign the progress section — stacked bars

**Files:**

- Modify: `src/components/RaidProgressionBox.vue`

The three `.summary-pill` elements are replaced by a single glass panel with stacked label/count/bar rows. The `IntersectionObserver` and `isVisible` ref are unchanged — they still trigger the `.animate` class.

- [ ] **Step 3.1 — Replace the `.summary` block in the template**

  Find this entire block (the `<div v-if="summary.normal > 0 || ..."` wrapper containing the three `.summary-pill` divs):

  ```html
  <div
    v-if="summary.normal > 0 || summary.heroic > 0 || summary.mythic > 0"
    ref="progressRef"
    class="summary"
  >
    <div v-if="summary.normal > 0" class="summary-pill normal">...</div>
    <div v-if="summary.heroic > 0" class="summary-pill heroic">...</div>
    <div v-if="summary.mythic > 0" class="summary-pill mythic">...</div>
  </div>
  ```

  Replace the entire block with:

  ```html
  <div
    v-if="summary.normal > 0 || summary.heroic > 0 || summary.mythic > 0"
    ref="progressRef"
    class="progress-section"
  >
    <div v-if="summary.normal > 0" class="progress-row progress-row--normal">
      <span class="progress-label">Normal</span>
      <span class="progress-count">{{ summary.normal }}/{{ summary.total }}</span>
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="{ animate: isVisible }"
          :style="{ '--progress': pct(summary.normal) }"
        ></div>
      </div>
    </div>
    <div v-if="summary.heroic > 0" class="progress-row progress-row--heroic">
      <span class="progress-label">Heroic</span>
      <span class="progress-count">{{ summary.heroic }}/{{ summary.total }}</span>
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="{ animate: isVisible }"
          :style="{ '--progress': pct(summary.heroic) }"
        ></div>
      </div>
    </div>
    <div v-if="summary.mythic > 0" class="progress-row progress-row--mythic">
      <span class="progress-label">Mythic</span>
      <span class="progress-count">{{ summary.mythic }}/{{ summary.total }}</span>
      <div class="progress-track">
        <div
          class="progress-fill"
          :class="{ animate: isVisible }"
          :style="{ '--progress': pct(summary.mythic) }"
        ></div>
      </div>
    </div>
  </div>
  ```

- [ ] **Step 3.2 — Replace `.summary` SCSS with `.progress-section` styles**

  In `<style lang="scss" scoped>`, find and remove the entire `/* ── Summary ── */` section:

  ```scss
  /* ── Summary ── */
  .summary {
    display: flex;
    gap: $space-2;
    margin-bottom: 1rem;

    @include mobile-md {
      flex-direction: column;
    }
  }

  .summary-pill {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem;
    padding: $space-2 $space-3;
    border-radius: $radius-md;
    background: $surface-1;
    border: 1px solid $color-border;

    .summary-count { ... }
    .summary-label { ... }
    .summary-track { ... }

    &.normal { ... }
    &.heroic { ... }
    &.mythic { ... }
  }
  ```

  Replace with:

  ```scss
  /* ── Progress section ── */
  .progress-section {
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-top-color: rgba(255, 255, 255, 0.22);
    border-radius: $radius-md;
    padding: $space-3 $space-4;
    margin-bottom: $space-4;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .progress-row {
    display: flex;
    align-items: center;
    gap: $space-3;

    &:not(:last-child) {
      margin-bottom: 0.38rem;
    }
  }

  .progress-label {
    font-size: 0.58em;
    text-transform: uppercase;
    font-weight: 700;
    width: 2.8rem;
    flex-shrink: 0;
  }

  .progress-count {
    font-size: 0.65em;
    font-weight: 800;
    width: 1.8rem;
    flex-shrink: 0;
    line-height: 1;
  }

  .progress-track {
    flex: 1;
    height: 3px;
    border-radius: 2px;
  }

  .progress-fill {
    height: 100%;
    border-radius: 2px;
    width: 0;
    transition: width 1s $ease-out;

    &.animate {
      width: var(--progress);
    }
  }

  .progress-row--normal {
    .progress-label,
    .progress-count {
      color: #4da6ff;
    }

    .progress-count {
      text-shadow: 0 0 8px rgba(77, 166, 255, 0.6);
    }

    .progress-track {
      background: rgba(77, 166, 255, 0.15);
    }

    .progress-fill {
      background: #4da6ff;
      box-shadow: 0 0 7px rgba(77, 166, 255, 0.65);
      transition-delay: 0ms;
    }
  }

  .progress-row--heroic {
    .progress-label,
    .progress-count {
      color: #c060ff;
    }

    .progress-count {
      text-shadow: 0 0 8px rgba(192, 96, 255, 0.7);
    }

    .progress-track {
      background: rgba(192, 96, 255, 0.15);
    }

    .progress-fill {
      background: #c060ff;
      box-shadow: 0 0 7px rgba(192, 96, 255, 0.7);
      transition-delay: 150ms;
    }
  }

  .progress-row--mythic {
    .progress-label,
    .progress-count {
      color: $quality-legendary;
    }

    .progress-count {
      text-shadow: 0 0 8px rgba(255, 128, 0, 0.6);
    }

    .progress-track {
      background: rgba(255, 128, 0, 0.15);
    }

    .progress-fill {
      background: $quality-legendary;
      box-shadow: 0 0 7px rgba(255, 128, 0, 0.65);
      transition-delay: 300ms;
    }
  }
  ```

- [ ] **Step 3.3 — Update the `@include reduced-motion` block**

  Find the existing reduced-motion block near the bottom of `<style>`:

  ```scss
  @include reduced-motion {
    .summary-fill {
      transition: none;
      width: var(--progress);
    }
  }
  ```

  Replace with:

  ```scss
  @include reduced-motion {
    .progress-fill {
      transition: none;
      width: var(--progress);
    }
  }
  ```

- [ ] **Step 3.4 — Verify in browser**

  The progress section should show two stacked rows (Normal + Heroic) inside a glass panel. Scroll down past the component and back to trigger the `IntersectionObserver` — the bars should animate in with a 150ms stagger between Normal and Heroic.

- [ ] **Step 3.5 — Run lint and tests**

  ```bash
  npm run lint && npm test
  ```

  Expected: no errors, all tests pass.

- [ ] **Step 3.6 — Commit**

  ```bash
  git add src/components/RaidProgressionBox.vue
  git commit -m "feat: replace summary pills with stacked glass progress bars"
  ```

---

## Task 4: Redesign boss rows and footer links

**Files:**

- Modify: `src/components/RaidProgressionBox.vue`

Remove the `difficulty-bar` spans and `difficultyBars()` function. Restyle `.boss-entry` as glass chips with three visual states. Update `.pip` for glass border treatment. Update `.footer-link` to match.

- [ ] **Step 4.1 — Remove `difficulty-bar` spans from the template**

  Find this block inside the `v-for="boss in raid.bosses"` loop:

  ```html
  <span
    v-for="bar in difficultyBars(boss)"
    :key="bar.difficulty"
    class="difficulty-bar"
    :class="bar.difficulty"
    :style="{ width: bar.width }"
  ></span>
  ```

  Delete it entirely.

- [ ] **Step 4.2 — Remove `difficultyBars()` from the script**

  Find and delete this function in `<script setup>`:

  ```js
  function difficultyBars(boss) {
    const bars = []
    const difficulties = ['normal', 'heroic', 'mythic']
    for (const diff of difficulties) {
      if (boss[diff]) {
        bars.push({ difficulty: diff, width: '100%' })
      }
    }
    // Show progress bar for the next unkilled difficulty above highest kill
    if (boss.bestPercent != null) {
      const nextDiff = difficulties.find((d) => !boss[d])
      if (nextDiff) {
        bars.push({ difficulty: nextDiff, width: `${boss.bestPercent}%` })
      }
    }
    return bars
  }
  ```

- [ ] **Step 4.3 — Replace `.boss-entry` SCSS with glass chip styles**

  Find the `/* ── Boss rows ── */` section. Replace the `.boss-entry` block:

  ```scss
  // Before
  .boss-entry {
    position: relative;
    background: $surface-2;
    transition: background $duration-fast;

    .difficulty-bar { ... }

    &:hover {
      background: $surface-3;
    }

    &.expandable .boss-row {
      cursor: pointer;
    }

    &:not(.killed):not(.in-progress) {
      opacity: 0.55;
    }
  }
  ```

  Replace with:

  ```scss
  .boss-entry {
    border-radius: $radius-md;
    transition:
      background $duration-fast,
      border-color $duration-fast;

    &.killed {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.13);
      border-top-color: rgba(255, 255, 255, 0.22);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);

      &:hover {
        background: rgba(255, 255, 255, 0.11);
        border-top-color: rgba(255, 255, 255, 0.28);
      }
    }

    &.in-progress {
      background: rgba($quality-epic, 0.08);
      border: 1px solid rgba($quality-epic, 0.28);
      box-shadow: 0 2px 10px rgba($quality-epic, 0.08);

      &:hover {
        background: rgba($quality-epic, 0.12);
      }
    }

    &:not(.killed):not(.in-progress) {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      opacity: 0.35;
    }

    &.expandable .boss-row {
      cursor: pointer;
    }
  }
  ```

- [ ] **Step 4.4 — Also remove the `.difficulty-bar` SCSS block**

  Inside the old `.boss-entry` you just replaced, the `.difficulty-bar` nested styles are already gone. Double-check there is no orphaned `.difficulty-bar` rule anywhere else in the file and remove it if present.

- [ ] **Step 4.4b — Fix `.boss-list` to allow individual chip borders**

  The current `.boss-list` uses `overflow: hidden` + `gap: 1px` to render entries as a seamless block. Glass chips have their own `border-radius` so that combination clips their corners. Find:

  ```scss
  .boss-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border-radius: $radius-md;
    overflow: hidden;
  }
  ```

  Replace with:

  ```scss
  .boss-list {
    display: flex;
    flex-direction: column;
    gap: $space-1;
  }
  ```

- [ ] **Step 4.5 — Update `.pip` and `.pip.active` styles**

  Find the `.pip` block:

  ```scss
  .pip {
    ...
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.15);
    transition:
      background $duration-fast,
      color $duration-fast;

    &.active {
      background: rgba($quality-uncommon, 0.15);
      color: $quality-uncommon;
    }
    ...
  }
  ```

  Replace the background/color/transition lines and the `&.active` block with:

  ```scss
  .pip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.7rem;
    height: 1.3rem;
    border-radius: $radius-sm;
    font-size: 0.65em;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.18);
    border: 1px solid transparent;
    transition:
      background $duration-fast,
      color $duration-fast,
      border-color $duration-fast;

    &.active {
      background: rgba($quality-uncommon, 0.14);
      color: $quality-uncommon;
      border-color: rgba($quality-uncommon, 0.28);
    }

    @include tablet-sm {
      width: 1.5rem;
      height: 1.1rem;
      font-size: 0.6em;
    }
  }
  ```

- [ ] **Step 4.6 — Update `.footer-link` styles**

  Find the `.footer-link` block:

  ```scss
  .footer-link {
    font-size: 0.8em;
    font-weight: 600;
    color: $accent-color;
    text-decoration: none;
    padding: 0.35rem 0.85rem;
    border: 1px solid rgba($accent-color, 0.3);
    border-radius: $radius-md;
    transition:
      background $duration-fast,
      border-color $duration-fast;

    &:hover {
      background: rgba($accent-color, 0.1);
      border-color: rgba($accent-color, 0.6);
    }
  }
  ```

  Replace with:

  ```scss
  .footer-link {
    font-size: 0.8em;
    font-weight: 600;
    color: $accent-color;
    text-decoration: none;
    padding: 0.35rem 0.85rem;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-top-color: rgba(255, 255, 255, 0.2);
    border-radius: $radius-md;
    transition:
      background $duration-fast,
      border-color $duration-fast;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.18);
    }
  }
  ```

- [ ] **Step 4.7 — Verify in browser**

  Check the full component:
  - Killed bosses: glass chip with subtle shine on top edge, green active pips
  - In-progress boss: purple-tinted border, purple meta text
  - Unkilled bosses: dimmed to 35% opacity, no border glow
  - Footer links: glass pill styling, hover lifts them slightly
  - Expandable roster still works — click a boss with a ▾ caret to verify

- [ ] **Step 4.8 — Run lint and tests**

  ```bash
  npm run lint && npm test
  ```

  Expected: no errors, all tests pass.

- [ ] **Step 4.9 — Commit**

  ```bash
  git add src/components/RaidProgressionBox.vue
  git commit -m "feat: redesign boss rows as glass chips, update pips and footer links"
  ```
