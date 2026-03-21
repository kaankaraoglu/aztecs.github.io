<template>
  <div class="raid-stats-grid">
    <div class="info-box info-box--no-hover stat-card">
      <p class="stat-label">Most Deaths</p>
      <template v-if="stats.mostDeaths">
        <p :class="['stat-name', stats.mostDeaths.class]">{{ stats.mostDeaths.name }}</p>
        <p class="stat-value">{{ stats.mostDeaths.count }} deaths</p>
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </div>
    <div class="info-box info-box--no-hover stat-card">
      <p class="stat-label">Iron Raider</p>
      <template v-if="stats.ironRaider">
        <p :class="['stat-name', stats.ironRaider.class]">{{ stats.ironRaider.name }}</p>
        <p class="stat-value">{{ stats.ironRaider.killsAttended }} kills attended</p>
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </div>
    <div class="info-box info-box--no-hover stat-card">
      <p class="stat-label">Highest DPS</p>
      <template v-if="stats.biggestHit">
        <p :class="['stat-name', stats.biggestHit.class]">{{ stats.biggestHit.name }}</p>
        <p class="stat-value">
          {{ formatDamage(stats.biggestHit.amount) }} on {{ stats.biggestHit.boss || 'a boss' }}
        </p>
        <a
          v-if="stats.biggestHit.report"
          class="stat-link"
          :href="stats.biggestHit.report"
          target="_blank"
          rel="noopener noreferrer"
          >View Log</a
        >
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </div>
  </div>
</template>

<script setup>
import { useRaidStats } from '@/composables/useRaidStats.js'

const { stats } = useRaidStats()

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

.stat-empty {
  margin: 0;
  font-size: 0.9em;
  color: $color-text-subtle;
}

.stat-link {
  font-size: 0.8em;
  font-weight: 600;
  color: $accent-color;
  text-decoration: none;
  transition: color $duration-fast $ease-default;

  &:hover {
    text-decoration: underline;
  }
}
</style>
