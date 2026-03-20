<template>
  <div class="raid-progression-box">
    <div v-if="summary.normal > 0 || summary.heroic > 0" class="progress-bars">
      <span v-if="summary.normal > 0" class="bar normal">
        <span class="bar-fill" :style="{ width: pct(summary.normal) }"></span>
        <span class="bar-text">{{ summary.normal }}/{{ summary.total }} N</span>
      </span>
      <span v-if="summary.heroic > 0" class="bar heroic">
        <span class="bar-fill" :style="{ width: pct(summary.heroic) }"></span>
        <span class="bar-text">{{ summary.heroic }}/{{ summary.total }} HC</span>
      </span>
      <span v-if="summary.mythic > 0" class="bar mythic">
        <span class="bar-fill" :style="{ width: pct(summary.mythic) }"></span>
        <span class="bar-text">{{ summary.mythic }}/{{ summary.total }} M</span>
      </span>
    </div>

    <table>
      <thead>
        <tr>
          <th class="accent-color">Boss</th>
          <th class="quality-rare difficulty">N</th>
          <th class="quality-epic difficulty">HC</th>
        </tr>
      </thead>
      <tbody v-for="raid in raids" :key="raid.name">
        <tr class="instance-header">
          <td :colspan="3">{{ raid.name }}</td>
        </tr>
        <tr v-for="boss in raid.bosses" :key="boss.name">
          <td class="boss-name">{{ boss.name }}</td>
          <td class="killed-or-not">{{ killMark(boss.normal) }}</td>
          <td class="killed-or-not">{{ killMark(boss.heroic) }}</td>
        </tr>
      </tbody>
    </table>

    <a
      class="raiderio-link"
      href="https://raider.io/guilds/eu/alakir/Aztecs"
      target="_blank"
      rel="noopener noreferrer"
    >
      View on Raider.IO
    </a>
  </div>
</template>

<script setup>
import { killMark } from '@/data/progression.js'

const props = defineProps({
  raids: {
    type: Array,
    required: true,
  },
  summary: {
    type: Object,
    required: true,
  },
})

function pct(killed) {
  return props.summary.total > 0 ? `${(killed / props.summary.total) * 100}%` : '0%'
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.raid-progression-box {
  text-align: left;

  .progress-bars {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .bar {
    position: relative;
    flex: 1;
    height: 1.6rem;
    border-radius: 6px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.06);
    min-width: 4rem;

    .bar-fill {
      position: absolute;
      inset: 0;
      border-radius: 6px;
      transition: width 0.6s ease;
    }

    .bar-text {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: 0.8em;
      font-weight: 700;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    &.normal .bar-fill {
      background: rgba($quality-rare, 0.4);
    }
    &.heroic .bar-fill {
      background: rgba($quality-epic, 0.4);
    }
    &.mythic .bar-fill {
      background: rgba($quality-legendary, 0.4);
    }
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  .instance-header td {
    color: $accent-color;
    font-weight: 700;
    font-size: 0.85em;
    padding: 0.6rem 0 0.2rem;
    opacity: 0.8;
  }

  table tr .boss-name {
    font-size: 0.95em;
    padding: 0.15rem 0;
    @media (max-width: 700px) {
      font-size: 0.75em;
    }
  }

  table tr .difficulty {
    font-size: 1.15em;
    text-align: center;
  }

  table tr .killed-or-not {
    font-size: 0.7em;
    text-align: center;
  }

  table th:first-child {
    text-align: left;
  }

  .raiderio-link {
    display: inline-block;
    margin-top: 0.75rem;
    font-size: 0.75em;
    color: $accent-color;
    opacity: 0.5;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
