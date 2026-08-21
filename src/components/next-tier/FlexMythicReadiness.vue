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
      <div class="slot-grid slot-grid--required" role="list" aria-label="Core raid slots">
        <span
          v-for="(slot, i) in requiredSlots"
          :key="`req-${i}`"
          role="listitem"
          class="slot"
          :class="
            slot.filled ? ['slot--filled', toClassColorCss(slot.sub.className)] : 'slot--empty'
          "
          :title="slot.filled ? slotTitle(slot.sub) : undefined"
          :aria-label="slot.filled ? slotTitle(slot.sub) : 'Open slot'"
        />
      </div>
      <div
        class="slot-grid slot-grid--bonus"
        role="list"
        aria-label="Bonus raid slots beyond the minimum"
      >
        <span
          v-for="(slot, i) in bonusSlots"
          :key="`bonus-${i}`"
          role="listitem"
          class="slot"
          :class="
            slot.filled ? ['slot--filled', toClassColorCss(slot.sub.className)] : 'slot--empty'
          "
          :title="slot.filled ? slotTitle(slot.sub) : undefined"
          :aria-label="slot.filled ? slotTitle(slot.sub) : 'Open bonus slot'"
        />
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

// Grouping by class turns the grid into readable blocks of colour instead of
// a shuffle that changes shape on every reload (submissions come back in KV
// key order, not signup order).
const sortedSubmissions = computed(() =>
  [...props.submissions].sort(
    (a, b) =>
      a.className.localeCompare(b.className) || a.characterName.localeCompare(b.characterName),
  ),
)

function slotAt(index) {
  const sub = sortedSubmissions.value[index]
  return sub ? { filled: true, sub } : { filled: false }
}

const requiredSlots = computed(() => Array.from({ length: MIN_PLAYERS }, (_, i) => slotAt(i)))
const bonusSlots = computed(() =>
  Array.from({ length: MAX_DISPLAY - MIN_PLAYERS }, (_, i) => slotAt(MIN_PLAYERS + i)),
)

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
  align-items: center;
  gap: $space-3;
  margin: $space-2 0 $space-4;
}

.slot-grid {
  display: grid;
  grid-template-columns: repeat(5, 1.5rem);
  grid-auto-rows: 1.5rem;
  gap: $space-1;
}

.slot {
  border-radius: $radius-sm;
  border: 1px solid var(--t-border);
  background: var(--t-surface-raised);
  transition:
    background $duration-fast $ease-default,
    border-color $duration-fast $ease-default,
    transform $duration-fast $ease-default;
}

.slot--filled {
  border-color: currentColor;
  background: color-mix(in srgb, currentColor 70%, transparent);

  &:hover {
    transform: scale(1.2);
  }
}

.slot-grid--bonus .slot--empty {
  border-style: dashed;
  opacity: 0.6;
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
