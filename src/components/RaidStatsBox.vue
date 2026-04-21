<template>
  <div class="raid-stats-grid">
    <InfoBox no-hover class="stat-card">
      <p class="stat-label">Most Deaths</p>
      <template v-if="stats.mostDeaths">
        <p :class="['stat-name', stats.mostDeaths.class]">{{ stats.mostDeaths.name }}</p>
        <p class="stat-value">{{ stats.mostDeaths.count }} deaths</p>
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </InfoBox>
    <InfoBox no-hover class="stat-card">
      <p class="stat-label">
        Iron Raider
        <span class="info-icon-wrapper">
          <svg
            class="info-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            width="14"
            height="14"
          >
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
              clip-rule="evenodd"
            />
          </svg>
          <span class="info-tooltip">Most boss kills attended without dying on any of them</span>
        </span>
      </p>
      <template v-if="stats.ironRaider">
        <p :class="['stat-name', stats.ironRaider.class]">{{ stats.ironRaider.name }}</p>
        <p class="stat-value">{{ stats.ironRaider.killsAttended }} kills attended</p>
      </template>
      <p v-else class="stat-empty">No data yet.</p>
    </InfoBox>
    <InfoBox no-hover class="stat-card">
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
    <InfoBox no-hover class="stat-card">
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
    <InfoBox no-hover class="stat-card">
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
    <InfoBox no-hover class="stat-card">
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
    <InfoBox no-hover class="stat-card">
      <p class="stat-label">Highest Avoidable Damage Taken</p>
      <p class="stat-name"><span class="warrior">Peavy</span>, <span class="evoker">Proto</span></p>
      <p class="stat-name death-knight">Madhouse</p>
      <p class="stat-subtitle">by miles</p>
    </InfoBox>
    <InfoBox no-hover class="stat-card">
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $space-1;
}

.info-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.info-icon {
  opacity: 0.5;
  cursor: help;
  transition: opacity $duration-fast $ease-default;

  .info-icon-wrapper:hover & {
    opacity: 1;
    color: $accent-color;
  }
}

.info-tooltip {
  position: absolute;
  bottom: calc(100% + $space-2);
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 200px;
  padding: $space-2 $space-3;
  background: $surface-2;
  border: 1px solid $color-border-accent;
  border-radius: $radius-md;
  color: $color-text-muted;
  font-size: 11px;
  font-weight: 400;
  text-transform: none;
  letter-spacing: normal;
  line-height: 1.4;
  white-space: normal;
  pointer-events: none;
  opacity: 0;
  transition: opacity $duration-normal $ease-default;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

  .info-icon-wrapper:hover & {
    opacity: 1;
  }
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
