<template>
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
      <p class="stat-label">Highest Damage Done in Raid</p>
      <template v-if="stats.highestDamageDone">
        <p :class="['stat-name', stats.highestDamageDone.class]">
          {{ stats.highestDamageDone.name }}
        </p>
        <p class="stat-value">
          {{ formatNumber(stats.highestDamageDone.amount) }} on
          {{ stats.highestDamageDone.boss || 'a boss' }}
        </p>
        <a
          v-if="stats.highestDamageDone.report"
          class="stat-link"
          :href="stats.highestDamageDone.report"
          target="_blank"
          rel="noopener noreferrer"
          >View Log</a
        >
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </InfoBox>
    <InfoBox class="stat-card">
      <p class="stat-label">Highest Damage Done in M+</p>
      <template v-if="stats.highestDamageDoneMplus">
        <p :class="['stat-name', stats.highestDamageDoneMplus.class]">
          {{ stats.highestDamageDoneMplus.name }}
        </p>
        <p class="stat-value">
          {{ formatNumber(stats.highestDamageDoneMplus.amount) }} on
          {{ stats.highestDamageDoneMplus.boss || 'a boss' }}
        </p>
        <a
          v-if="stats.highestDamageDoneMplus.report"
          class="stat-link"
          :href="stats.highestDamageDoneMplus.report"
          target="_blank"
          rel="noopener noreferrer"
          >View Log</a
        >
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </InfoBox>
    <InfoBox class="stat-card">
      <p class="stat-label">Best Healer in Raid</p>
      <template v-if="stats.bestHealer">
        <p :class="['stat-name', stats.bestHealer.class]">{{ stats.bestHealer.name }}</p>
        <p class="stat-value">
          {{ formatNumber(stats.bestHealer.amount) }} on {{ stats.bestHealer.boss || 'a boss' }}
        </p>
        <a
          v-if="stats.bestHealer.report"
          class="stat-link"
          :href="stats.bestHealer.report"
          target="_blank"
          rel="noopener noreferrer"
          >View Log</a
        >
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </InfoBox>
    <InfoBox class="stat-card">
      <p class="stat-label">Best Healer in M+</p>
      <template v-if="stats.bestHealerMplus">
        <p :class="['stat-name', stats.bestHealerMplus.class]">
          {{ stats.bestHealerMplus.name }}
        </p>
        <p class="stat-value">
          {{ formatNumber(stats.bestHealerMplus.amount) }} on
          {{ stats.bestHealerMplus.boss || 'a boss' }}
        </p>
        <a
          v-if="stats.bestHealerMplus.report"
          class="stat-link"
          :href="stats.bestHealerMplus.report"
          target="_blank"
          rel="noopener noreferrer"
          >View Log</a
        >
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </InfoBox>
    <InfoBox class="stat-card">
      <p class="stat-label">Highest Avoidable Damage Taken</p>
      <p class="stat-name"><span class="warrior">Peavy</span>, <span class="evoker">Proto</span></p>
      <p class="stat-name death-knight">Madhouse</p>
      <p class="stat-subtitle">by miles</p>
    </InfoBox>
    <InfoBox class="stat-card">
      <p class="stat-label">Frontpage Material</p>
      <p class="stat-name warrior">Agro</p>
      <p class="stat-subtitle">because he asked</p>
    </InfoBox>
  </div>
</template>

<script setup>
import InfoBox from '@/components/InfoBox.vue'
import { useRaidStats } from '@/composables/useRaidStats.js'

const { stats } = useRaidStats()

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
