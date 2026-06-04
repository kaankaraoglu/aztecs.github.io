<template>
  <div class="raid-stats-sections">
    <div class="stats-section">
      <p class="stats-section-label fame">HALL OF FAME</p>
      <div class="raid-stats-grid">
        <InfoBox v-for="card in performanceCards" :key="card.key" class="stat-card">
          <p class="stat-label">{{ card.label }}</p>
          <template v-if="stats[card.key]">
            <p :class="['stat-name', stats[card.key].class]">{{ stats[card.key].name }}</p>
            <p class="stat-value">
              {{ formatNumber(stats[card.key].amount) }} on
              {{ stats[card.key].boss || 'a boss' }}
            </p>
            <a
              v-if="stats[card.key].report"
              class="stat-link"
              :href="stats[card.key].report"
              target="_blank"
              rel="noopener noreferrer"
              >View Log</a
            >
          </template>
          <p v-else class="stat-empty">No data yet.</p>
        </InfoBox>
        <InfoBox class="stat-card">
          <p class="stat-label">Frontpage Material</p>
          <p class="stat-name warrior">Agro</p>
          <p class="stat-subtitle">because he asked</p>
        </InfoBox>
      </div>
    </div>
    <div class="stats-section">
      <p class="stats-section-label shame">HALL OF SHAME</p>
      <div class="raid-stats-grid">
        <InfoBox class="stat-card">
          <p class="stat-label">Most Deaths</p>
          <template v-if="stats.mostDeaths">
            <p :class="['stat-name', stats.mostDeaths.class]">{{ stats.mostDeaths.name }}</p>
            <p class="stat-value">{{ stats.mostDeaths.count }} deaths</p>
          </template>
          <p v-else class="stat-empty">No data yet.</p>
        </InfoBox>
        <InfoBox class="stat-card">
          <p class="stat-label">Highest Avoidable Damage Taken</p>
          <p class="stat-name"><span class="warrior">Peavy</span>, <span class="evoker">Proto</span></p>
          <p class="stat-name death-knight">Madhouse</p>
          <p class="stat-subtitle">by miles</p>
        </InfoBox>
      </div>
    </div>
  </div>
</template>

<script setup>
import InfoBox from '@/components/InfoBox.vue'
import { useRaidStats } from '@/composables/useRaidStats.js'

const { stats } = useRaidStats()

const performanceCards = [
  { key: 'highestDamageDone', label: 'Highest Damage Done in Raid' },
  { key: 'highestDamageDoneMplus', label: 'Highest Damage Done in M+' },
  { key: 'bestHealer', label: 'Best Healer in Raid' },
  { key: 'bestHealerMplus', label: 'Best Healer in M+' },
]

/**
 * @param {number} n
 * @returns {string}
 */
function formatNumber(n) {
  return n >= 1_000_000
    ? (n / 1_000_000).toFixed(1) + 'M'
    : n >= 1_000
      ? (n / 1_000).toFixed(0) + 'K'
      : String(n)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.raid-stats-sections {
  display: flex;
  flex-direction: column;
  gap: $space-6;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: $space-4;
}

.stats-section-label {
  margin: 0;
  font-size: 0.75em;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  &.fame {
    color: $color-light-yellow;
  }

  &.shame {
    color: $color-red;
  }
}

.raid-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;

  @include desktop-sm {
    grid-template-columns: repeat(3, 1fr);
  }

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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

.stat-subtitle {
  margin: 0;
  font-size: 0.7em;
  font-style: italic;
  color: $color-text-subtle;
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
