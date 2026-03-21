<template>
  <div ref="containerRef" class="raid-history-view content-wrapper">
    <h1 class="page-heading">Raid History</h1>

    <div
      v-for="(tiers, expansion) in groupedTiers"
      :key="expansion"
      class="expansion-box info-box info-box--no-hover reveal"
    >
      <h2 class="expansion-heading">{{ expansion }}</h2>
      <div class="tier-grid">
        <div v-for="tier in tiers" :key="tier.tier" class="tier-card reveal">
          <div class="tier-header">
            <h3 class="tier-name">{{ tier.tier }}</h3>
            <span v-if="tier.season" class="tier-season">{{ tier.season }}</span>
          </div>
          <div class="tier-meta">
            <span class="tier-dates">{{ formatDates(tier.dates) }}</span>
            <span class="tier-progress-badge" :class="progressBadgeClass(tier.progress)">{{
              tier.progress
            }}</span>
          </div>
          <p v-if="tier.notable" class="tier-notable">{{ tier.notable }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { tierHistory } from '@/data/tier-history.js'
import { useScrollReveal } from '@/composables/useScrollReveal.js'

const containerRef = ref(null)
useScrollReveal(containerRef)

/**
 * Groups tiers by expansion, preserving newest-first order within each group.
 * @type {import('vue').ComputedRef<Record<string, import('@/data/tier-history.js').TierEntry[]>>}
 */
const groupedTiers = computed(() => {
  /** @type {Record<string, import('@/data/tier-history.js').TierEntry[]>} */
  const groups = {}
  for (const tier of tierHistory) {
    if (!groups[tier.expansion]) {
      groups[tier.expansion] = []
    }
    groups[tier.expansion].push(tier)
  }
  return groups
})

/**
 * @param {{ start: string, end?: string }} dates
 * @returns {string}
 */
function formatDates(dates) {
  const start = formatDate(dates.start)
  return dates.end ? `${start} – ${formatDate(dates.end)}` : `${start} – present`
}

/**
 * @param {string} isoDate
 * @returns {string}
 */
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })
}

/**
 * @param {string} progress
 * @returns {string}
 */
function progressBadgeClass(progress) {
  if (progress.includes('Mythic')) return 'badge-legendary'
  if (progress.includes('Heroic')) return 'badge-epic'
  return 'badge-rare'
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/_info-box.scss';
@use '@/assets/styles/tokens' as *;

.raid-history-view {
  position: relative;
  z-index: 10;
  text-align: center;
}

.page-heading {
  color: $accent-color;
  text-shadow: 0 0 20px rgba($accent-color, 0.3);
  font-size: 2.5em;
  margin: 0 0 $space-8;

  @include mobile {
    font-size: 1.8em;
  }
}

.expansion-box {
  margin-bottom: $space-8;
  text-align: left;
}

.expansion-heading {
  color: $accent-color;
  font-size: 1.2em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 $space-4;
  text-shadow: 0 0 12px rgba($accent-color, 0.2);
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $space-4;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.tier-card {
  display: flex;
  flex-direction: column;
  gap: $space-3;
  background: $surface-2;
  border: 1px solid $color-border;
  border-radius: $radius-lg;
  padding: $space-4;
  transition:
    background $duration-normal $ease-default,
    border-color $duration-normal $ease-default;

  &:hover {
    background: $surface-3;
    border-color: $color-border-hover;
  }
}

.tier-header {
  display: flex;
  align-items: baseline;
  gap: $space-3;
  flex-wrap: wrap;
}

.tier-name {
  margin: 0;
  font-size: 1.1em;
  font-weight: 800;
  color: $accent-color;
  text-shadow: 0 0 12px rgba($accent-color, 0.2);
}

.tier-season {
  font-size: 0.8em;
  color: $color-text-subtle;
  font-weight: 600;
}

.tier-meta {
  display: flex;
  align-items: center;
  gap: $space-3;
  flex-wrap: wrap;
}

.tier-dates {
  font-size: 0.85em;
  color: $color-text-subtle;
}

.tier-progress-badge {
  font-size: 0.8em;
  font-weight: 700;
  padding: 2px $space-2;
  border-radius: $radius-sm;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid currentColor;

  &.badge-legendary {
    color: $quality-legendary;
  }

  &.badge-epic {
    color: $quality-epic;
  }

  &.badge-rare {
    color: $quality-rare;
  }
}

.tier-notable {
  margin: 0;
  font-size: 0.9em;
  color: $color-text-muted;
  line-height: 1.5;
}
</style>
