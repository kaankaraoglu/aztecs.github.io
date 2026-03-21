<template>
  <div v-if="hasData" class="raid-stats-grid">
    <div v-if="stats.mostDeaths" class="info-box info-box--no-hover stat-card">
      <p class="stat-label">Most Deaths</p>
      <p :class="['stat-name', stats.mostDeaths.class]">{{ stats.mostDeaths.name }}</p>
      <p class="stat-value">{{ stats.mostDeaths.count }} deaths</p>
    </div>
    <div v-if="stats.ironRaider" class="info-box info-box--no-hover stat-card">
      <p class="stat-label">Iron Raider</p>
      <p :class="['stat-name', stats.ironRaider.class]">{{ stats.ironRaider.name }}</p>
      <p class="stat-value">{{ stats.ironRaider.killsAttended }} kills attended</p>
    </div>
    <div v-if="stats.biggestHit" class="info-box info-box--no-hover stat-card">
      <p class="stat-label">Biggest Hit</p>
      <p :class="['stat-name', stats.biggestHit.class]">{{ stats.biggestHit.name }}</p>
      <p class="stat-value">
        {{ formatDamage(stats.biggestHit.amount) }} — {{ stats.biggestHit.ability }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useRaidStats } from '@/composables/useRaidStats.js'

const { stats, hasData } = useRaidStats()

/**
 * @param {number} n
 * @returns {string}
 */
function formatDamage(n) {
  return n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + 'M'
    : n >= 1_000
      ? (n / 1_000).toFixed(0) + 'K'
      : String(n)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/_info-box.scss';
@use '@/assets/styles/tokens' as *;

.raid-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: $space-4;

  @include tablet {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  gap: $space-2;
}

.stat-label {
  margin: 0;
  font-size: 0.75em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $color-text-subtle;
}

.stat-name {
  margin: 0;
  font-size: 1.1em;
  font-weight: 700;
}

.stat-value {
  margin: 0;
  font-size: 0.9em;
  color: $color-text-muted;
}
</style>
