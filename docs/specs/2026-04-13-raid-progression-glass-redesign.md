# Raid Progression Box — Glass Redesign

**Date:** 2026-04-13
**Component:** `src/components/RaidProgressionBox.vue`
**Scope:** Visual redesign of `RaidProgressionBox` + site-wide background token change. A follow-up pass will extend glassmorphism to other cards, header, and remaining components.

---

## Goals

Elevate the visual polish of the raid progression info-box using a glassmorphism aesthetic — richer depth, glowing progress bars, glass-chip boss rows — while keeping all existing functionality intact (expandable rosters, scroll-reveal animations, responsive layout).

---

## Design Decisions

### 1. Background token change (site-wide)

`$background-color` in `src/assets/styles/_variables.scss` changes from `#111` to `#181820`.

- The cool blue-purple undertone reads as "rich dark" rather than flat black
- Propagates automatically to all surfaces via the token — no per-component changes needed
- Provides enough tonal variation for glass panels to read with depth without requiring `backdrop-filter` or painted ambient blobs
- `$surface-0` in `_tokens.scss` must also be updated to match: `#181820`

### 2. No ambient blobs, no `backdrop-filter`

The lifted background (`#181820`) is sufficient for glass panels to register visually. `backdrop-filter: blur()` is intentionally omitted:

- Avoids Safari rendering artifacts
- Better GPU performance
- Simpler CSS

### 3. Progress section — stacked bars

Replaces the existing three summary pills (`summary-pill` elements) with a single glass panel containing stacked label/count/bar rows.

**Visibility rules (same logic as before):**

- Normal row: shown when `summary.normal > 0`
- Heroic row: shown when `summary.heroic > 0`
- Mythic row: shown when `summary.mythic > 0` (conditionally rendered — not just hidden)

**Per row:**

- Label (e.g. "Normal") in difficulty color
- Kill count (e.g. "8/8") in difficulty color with text-shadow glow
- Full-width bar track in `rgba(difficulty-color, 0.15)`
- Fill bar in difficulty color with matching `box-shadow` glow
- Fill animates from `0` to `--progress` on scroll via existing `IntersectionObserver` — staggered delays: Normal 0ms, Heroic 150ms, Mythic 300ms

**Colors:**

- Normal: `#4da6ff` (slightly lightened `$quality-rare` for better contrast on dark)
- Heroic: `#c060ff` (slightly lightened `$quality-epic`)
- Mythic: `$quality-legendary` (`#ff8000`) — unchanged

### 4. Boss rows — glass chips

Each `.boss-entry` becomes a glass chip.

**Killed boss:**

```
background: rgba(255, 255, 255, 0.08)
border: 1px solid rgba(255, 255, 255, 0.13)
border-top: 1px solid rgba(255, 255, 255, 0.22)   ← glass shine line
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04)
border-radius: $radius-md (8px)
```

**In-progress boss** (`!boss.normal && !boss.heroic && !boss.mythic && boss.bestPercent != null` — no kill on any difficulty, but has pull data):

```
background: rgba($quality-epic, 0.08)
border: 1px solid rgba($quality-epic, 0.28)
box-shadow: 0 2px 10px rgba($quality-epic, 0.08)
```

**Unkilled boss** (no pulls, no kill):

```
background: rgba(255, 255, 255, 0.03)
border: 1px solid rgba(255, 255, 255, 0.07)
opacity: 0.35
```

The existing `difficulty-bar` (background fill showing progress) is removed — the row border color carries that signal now.

### 5. N/HC/M pips — glass-styled

Pips are kept. Visual changes:

**Active pip** (`.pip.active`):

```
background: rgba($quality-uncommon, 0.14)
color: $quality-uncommon
border: 1px solid rgba($quality-uncommon, 0.28)
```

**Inactive pip:**

```
background: rgba(255, 255, 255, 0.04)
color: rgba(255, 255, 255, 0.18)
border: none   ← no border, stays recessed
```

### 6. Header — compact one-liner

Replaces the existing `.box-title` ("Raids") with a flex row:

```
[RAIDS · <raid-name>]                    [6/8 HC badge]
```

- "RAIDS" label: existing accent color + uppercase treatment
- Separator dot: `opacity: 0.25`
- Raid name: derived from `raids[0].name` (the first/current tier), difficulty color
- Badge (right-aligned): shows `{count}/{total} {DIFF}` for the highest cleared difficulty. Computed as: if `summary.mythic > 0` → `mythic`; else if `summary.heroic > 0` → `heroic`; else if `summary.normal > 0` → `normal`. Count comes from the matching `summary` field, total from `summary.total`. Example: `6/8 HC`.
- Styled as a small pill with difficulty-colored border + tinted background (matching `$quality-epic` for heroic, `$quality-legendary` for mythic, `$quality-rare` for normal).
- When `summary.normal === 0 && summary.heroic === 0 && summary.mythic === 0`, the badge is omitted (`v-if`).

### 7. Footer links — glass pills

`.footer-link` updated to match the glass language:

```
background: rgba(255, 255, 255, 0.06)
border: 1px solid rgba(255, 255, 255, 0.12)
border-top: 1px solid rgba(255, 255, 255, 0.20)
```

Color and hover behaviour unchanged.

---

## What Is Not Changing

- Component props interface (`raids`, `summary`, `latestReport`) — unchanged
- `useProgression` composable and data shape — unchanged
- Expandable roster feature — unchanged (toggle, `RosterList`, animation)
- `metaItems()` logic and displayed meta text — unchanged
- `IntersectionObserver` scroll-reveal mechanism — reused for progress bars
- Responsive breakpoints — unchanged
- Analytics tracking calls — unchanged
- Skeleton loader — unchanged (can be updated in follow-up pass)

---

## Files to Change

| File                                    | Change                                       |
| --------------------------------------- | -------------------------------------------- |
| `src/assets/styles/_variables.scss`     | `$background-color`: `#111` → `#181820`      |
| `src/assets/styles/_tokens.scss`        | `$surface-0`: `#111` → `#181820`             |
| `src/components/RaidProgressionBox.vue` | Full template + SCSS redesign per spec above |

---

## Out of Scope (follow-up pass)

- Glassmorphism on `MythicPlusBox`, `RaidStatsBox`, `KillCard`, other info-boxes
- Header / nav glass treatment
- `_info-box.scss` shared glass variant
- Skeleton loader glass styling
