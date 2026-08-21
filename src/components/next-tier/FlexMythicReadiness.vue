<template>
  <InfoBox no-hover class="flex-mythic-readiness">
    <div class="header-row">
      <div class="title-block">
        <h2 class="section-title">Flex Mythic Readiness</h2>
      </div>
      <Badge :variant="isReady ? 'success' : 'danger'" class="status-badge">
        {{ isReady ? 'Ready' : `Need ${needed} more` }}
      </Badge>
    </div>

    <div class="slots">
      <div v-for="row in roleRows" :key="row.role" class="role-row">
        <span class="role-label">{{ row.label }}</span>
        <div class="slot-row" role="list" :aria-label="`${row.label} signed up`">
          <span
            v-for="(sub, i) in row.submissions"
            :key="i"
            role="listitem"
            class="slot slot--filled"
            :class="toClassColorCss(sub.className)"
            :title="slotTitle(sub)"
            :aria-label="slotTitle(sub)"
          />
        </div>
      </div>
    </div>

    <div class="progress-labels">
      <span class="label-current">
        <span class="count" :class="isReady ? 'text-ready' : 'text-short'">{{ signupCount }}</span>
        signed up
      </span>
      <span class="label-min">{{ MIN_PLAYERS }} min &middot; {{ MAX_DISPLAY }} max</span>
    </div>
  </InfoBox>
</template>

<script setup>
import { computed } from 'vue'
import InfoBox from '@/components/InfoBox.vue'
import { Badge } from '@/components/ui/badge'
import { WOW_CLASSES } from '@/data/wow-classes.js'
import { toClassColorCss } from '@/lib/utils'

// A flex mythic raid needs at least 15 to fill three groups; up to 25 (five
// groups) fit on the roster as bench/flex cover.
const MIN_PLAYERS = 15
const MAX_DISPLAY = 25

const props = defineProps({
  submissions: { type: Array, default: () => [] },
})

const signupCount = computed(() => props.submissions.length)
const isReady = computed(() => signupCount.value >= MIN_PLAYERS)
const needed = computed(() => Math.max(0, MIN_PLAYERS - signupCount.value))

// Grouping by class turns each row into readable blocks of colour instead of
// a shuffle that changes shape on every reload (submissions come back in KV
// key order, not signup order).
const sortedSubmissions = computed(() =>
  [...props.submissions].sort(
    (a, b) =>
      a.className.localeCompare(b.className) || a.characterName.localeCompare(b.characterName),
  ),
)

// Beyond the max display count, extra signups are still counted (badge,
// "signed up" label) but stop appearing as boxes — otherwise a big bench
// list would make the grid grow without bound.
const displayedSubmissions = computed(() => sortedSubmissions.value.slice(0, MAX_DISPLAY))

const ROLE_ROW_LABELS = { tank: 'Tanks', healer: 'Healers', dps: 'DPS' }

// Melee and ranged share the DPS row — the box grid tracks raid composition
// at a glance, not a full spec breakdown.
const roleRows = computed(() => {
  const buckets = { tank: [], healer: [], dps: [] }
  for (const sub of displayedSubmissions.value) {
    const specDef = WOW_CLASSES[sub.className]?.specs?.[sub.specName]
    if (!specDef) continue
    const role = specDef.role in buckets ? specDef.role : 'dps'
    buckets[role].push(sub)
  }
  return Object.entries(buckets)
    .filter(([, submissions]) => submissions.length > 0)
    .map(([role, submissions]) => ({
      role,
      label: ROLE_ROW_LABELS[role],
      submissions,
    }))
})

function slotTitle(sub) {
  const classDef = WOW_CLASSES[sub.className]
  const specDef = classDef?.specs?.[sub.specName]
  const label = classDef ? `${classDef.name}${specDef ? ` ${specDef.name}` : ''}` : sub.className
  return `${sub.characterName} — ${label}`
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.header-row {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;
  margin-bottom: $space-4;
}

.title-block {
  width: 100%;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $color-text-subtle;
  margin: 0;
  text-align: center;
}

.status-badge {
  position: absolute;
  top: 0;
  right: 0;
  font-size: 0.875rem;
  padding: $space-2 $space-4;
  white-space: nowrap;
  flex-shrink: 0;

  @include mobile {
    position: static;
  }
}

.slots {
  display: flex;
  flex-direction: column;
  gap: $space-2;
  margin: $space-2 0 $space-4;
}

.role-row {
  display: flex;
  align-items: center;
  gap: $space-2;
}

.role-label {
  flex: 0 0 3.5rem;
  font-size: 0.75rem;
  color: $color-text-subtle;
  text-align: right;
}

.slot-row {
  display: flex;
  flex: 1;
  gap: $space-1;
  min-width: 0;
}

.slot {
  flex: 1 1 0;
  min-width: 0;
  height: 1.5rem;
  border-radius: $radius-sm;
  border: 1px solid var(--t-border);
  background: var(--t-surface-raised);
  transition: transform $duration-fast $ease-default;
}

.slot--filled {
  border-color: currentColor;
  background: color-mix(in srgb, currentColor 70%, transparent);

  &:hover {
    transform: scale(1.15);
  }
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: $color-text-subtle;
}

.label-current {
  display: flex;
  align-items: baseline;
  gap: $space-1;
}

.count {
  font-size: 1rem;
  font-weight: 700;

  &.text-ready {
    color: #50c878;
  }

  &.text-short {
    color: #f54545;
  }
}
</style>
