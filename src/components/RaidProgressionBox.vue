<template>
  <div class="raid-progression">
    <div v-if="summary.normal > 0 || summary.heroic > 0 || summary.mythic > 0" class="summary">
      <div v-if="summary.normal > 0" class="summary-pill normal">
        <span class="summary-count">{{ summary.normal }}/{{ summary.total }}</span>
        <span class="summary-label">Normal</span>
        <span class="summary-track"
          ><span class="summary-fill" :style="{ width: pct(summary.normal) }"></span
        ></span>
      </div>
      <div v-if="summary.heroic > 0" class="summary-pill heroic">
        <span class="summary-count">{{ summary.heroic }}/{{ summary.total }}</span>
        <span class="summary-label">Heroic</span>
        <span class="summary-track"
          ><span class="summary-fill" :style="{ width: pct(summary.heroic) }"></span
        ></span>
      </div>
      <div v-if="summary.mythic > 0" class="summary-pill mythic">
        <span class="summary-count">{{ summary.mythic }}/{{ summary.total }}</span>
        <span class="summary-label">Mythic</span>
        <span class="summary-track"
          ><span class="summary-fill" :style="{ width: pct(summary.mythic) }"></span
        ></span>
      </div>
    </div>

    <div v-for="raid in raids" :key="raid.name" class="instance">
      <h3 class="instance-name">{{ raid.name }}</h3>
      <div class="boss-list">
        <div v-for="boss in raid.bosses" :key="boss.name" class="boss-row">
          <span class="boss-name">{{ boss.name }}</span>
          <span class="boss-status">
            <span :class="['pip', { killed: boss.normal }]" title="Normal">N</span>
            <span :class="['pip', { killed: boss.heroic }]" title="Heroic">HC</span>
          </span>
        </div>
      </div>
    </div>

    <a
      class="raiderio-link"
      href="https://raider.io/guilds/eu/alakir/Aztecs"
      target="_blank"
      rel="noopener noreferrer"
    >
      raider.io/aztecs
    </a>
  </div>
</template>

<script setup>
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

.raid-progression {
  text-align: left;

  /* ── Summary pills ── */
  .summary {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.25rem;

    @media (max-width: 500px) {
      flex-direction: column;
    }
  }

  .summary-pill {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.35rem;
    padding: 0.5rem 0.75rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);

    .summary-count {
      font-size: 1.3em;
      font-weight: 800;
      line-height: 1;
    }

    .summary-label {
      font-size: 0.7em;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      opacity: 0.45;
    }

    .summary-track {
      width: 100%;
      height: 3px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.08);
      margin-top: 0.2rem;

      .summary-fill {
        display: block;
        height: 100%;
        border-radius: 2px;
        transition: width 0.6s ease;
      }
    }

    &.normal {
      .summary-count {
        color: $quality-rare;
      }
      .summary-fill {
        background: $quality-rare;
      }
    }
    &.heroic {
      .summary-count {
        color: $quality-epic;
      }
      .summary-fill {
        background: $quality-epic;
      }
    }
    &.mythic {
      .summary-count {
        color: $quality-legendary;
      }
      .summary-fill {
        background: $quality-legendary;
      }
    }
  }

  /* ── Raid instances ── */
  .instance {
    &:not(:last-of-type) {
      margin-bottom: 0.75rem;
    }
  }

  .instance-name {
    margin: 0 0 0.35rem;
    font-size: 0.75em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
    opacity: 0.7;
  }

  .boss-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border-radius: 8px;
    overflow: hidden;
  }

  .boss-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.4rem 0.65rem;
    background: rgba(255, 255, 255, 0.03);
    transition: background 0.15s;

    &:hover {
      background: rgba(255, 255, 255, 0.06);
    }
  }

  .boss-name {
    font-size: 0.9em;
    font-weight: 500;

    @media (max-width: 600px) {
      font-size: 0.8em;
    }
  }

  .boss-status {
    display: flex;
    gap: 0.3rem;
    flex-shrink: 0;
  }

  .pip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.65rem;
    height: 1.35rem;
    border-radius: 4px;
    font-size: 0.6em;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.2);
    transition:
      background 0.2s,
      color 0.2s;

    &.killed {
      background: rgba($quality-uncommon, 0.15);
      color: $quality-uncommon;
    }
  }

  /* ── Footer link ── */
  .raiderio-link {
    display: inline-block;
    margin-top: 0.75rem;
    font-size: 0.7em;
    color: $accent-color;
    opacity: 0.35;
    text-decoration: none;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
