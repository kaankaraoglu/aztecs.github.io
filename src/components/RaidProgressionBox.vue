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

    <div class="instances">
      <div v-for="raid in raids" :key="raid.name" class="instance">
        <h3 class="instance-name">{{ raid.name }}</h3>
        <div class="boss-list">
          <div
            v-for="boss in raid.bosses"
            :key="boss.name"
            :class="[
              'boss-entry',
              { expandable: hasRoster(boss), killed: boss.normal || boss.heroic || boss.mythic },
            ]"
          >
            <div class="boss-row" @click="toggle(boss.name)">
              <span class="boss-status">
                <span :class="['pip', { active: boss.normal }]">N</span>
                <span :class="['pip', { active: boss.heroic }]">HC</span>
                <span v-if="summary.mythic > 0" :class="['pip', { active: boss.mythic }]">M</span>
              </span>
              <span class="boss-name">{{ boss.name }}</span>
              <span class="boss-meta">
                <template v-for="(item, i) in metaItems(boss)" :key="i">
                  <span v-if="i > 0" class="meta-sep">|</span>
                  <span>{{ item }}</span>
                </template>
                <span
                  v-if="hasRoster(boss)"
                  class="expand-caret"
                  :class="{ open: expanded[boss.name] }"
                  >&#9662;</span
                >
              </span>
            </div>
            <Transition name="roster">
              <div v-if="expanded[boss.name] && hasRoster(boss)" class="roster-panel">
                <div v-if="boss.roster.tanks?.length" class="role-group">
                  <RoleIcon role="tank" />
                  <a
                    v-for="p in boss.roster.tanks"
                    :key="p.name"
                    :class="['player', p.class]"
                    :title="playerTooltip(p)"
                    :href="p.armory"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ p.name }}</a
                  >
                </div>
                <div v-if="boss.roster.healers?.length" class="role-group">
                  <RoleIcon role="healer" />
                  <a
                    v-for="p in boss.roster.healers"
                    :key="p.name"
                    :class="['player', p.class]"
                    :title="playerTooltip(p)"
                    :href="p.armory"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ p.name }}</a
                  >
                </div>
                <div v-if="boss.roster.dps?.length" class="role-group">
                  <RoleIcon role="dps" />
                  <a
                    v-for="p in boss.roster.dps"
                    :key="p.name"
                    :class="['player', p.class]"
                    :title="playerTooltip(p)"
                    :href="p.armory"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ p.name }}</a
                  >
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-links">
      <a
        v-if="latestReport"
        class="footer-link"
        :href="latestReport"
        target="_blank"
        rel="noopener noreferrer"
      >
        Latest Log
      </a>
      <a
        class="footer-link"
        href="https://raider.io/guilds/eu/alakir/Aztecs"
        target="_blank"
        rel="noopener noreferrer"
      >
        Raider.IO
      </a>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import RoleIcon from '@/components/icons/RoleIcon.vue'

const props = defineProps({
  raids: {
    type: Array,
    required: true,
  },
  summary: {
    type: Object,
    required: true,
  },
  latestReport: {
    type: String,
    default: null,
  },
})

const expanded = reactive({})

function toggle(bossName) {
  expanded[bossName] = !expanded[bossName]
}

function pct(killed) {
  return props.summary.total > 0 ? `${(killed / props.summary.total) * 100}%` : '0%'
}

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function metaItems(boss) {
  const items = []
  if (boss.bestPercent != null) items.push(`Best: ${boss.bestPercent.toFixed(1)}%`)
  if (boss.pulls) items.push(`${boss.pulls} ${boss.pulls !== 1 ? 'pulls' : 'pull'}`)
  if (boss.killedAt) items.push(formatDate(boss.killedAt))
  if (hasRoster(boss)) items.push(`${rosterSize(boss)} raiders`)
  return items
}

const CLASS_DISPLAY = {
  'death-knight': 'Death Knight',
  'demon-hunter': 'Demon Hunter',
  druid: 'Druid',
  evoker: 'Evoker',
  hunter: 'Hunter',
  mage: 'Mage',
  monk: 'Monk',
  paladin: 'Paladin',
  priest: 'Priest',
  rogue: 'Rogue',
  shaman: 'Shaman',
  warlock: 'Warlock',
  warrior: 'Warrior',
}

function playerTooltip(player) {
  if (player.name.toLowerCase() === 'mxk') {
    return `The worst ${CLASS_DISPLAY[player.class] || player.class} ever`
  }
  return player.spec
}

function hasRoster(boss) {
  const r = boss.roster
  return r && (r.tanks?.length || 0) + (r.healers?.length || 0) + (r.dps?.length || 0) > 0
}

function rosterSize(boss) {
  const r = boss.roster
  return (r?.tanks?.length || 0) + (r?.healers?.length || 0) + (r?.dps?.length || 0)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.raid-progression {
  text-align: left;

  /* ── Summary ── */
  .summary {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;

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
    padding: 0.55rem 0.85rem;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);

    .summary-count {
      font-size: 1.5em;
      font-weight: 800;
      line-height: 1;
    }

    .summary-label {
      font-size: 0.8em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.4;
    }

    .summary-track {
      width: 100%;
      height: 2px;
      border-radius: 1px;
      background: rgba(255, 255, 255, 0.06);
      margin-top: 0.15rem;

      .summary-fill {
        display: block;
        height: 100%;
        border-radius: 1px;
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

  /* ── Instances grid ── */
  .instances {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 0.75rem;

    @media (max-width: 600px) {
      grid-template-columns: 1fr;
      gap: 0.5rem;
    }
  }

  .instance-name {
    margin: 0 0 0.3rem;
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
    opacity: 0.6;
    padding-left: 0.15rem;
  }

  .boss-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border-radius: 6px;
    overflow: hidden;
  }

  /* ── Boss rows ── */
  .boss-entry {
    background: rgba(255, 255, 255, 0.025);
    transition: background 0.12s;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }

    &.expandable .boss-row {
      cursor: pointer;
    }

    &:not(.killed) {
      opacity: 0.55;
    }
  }

  .boss-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    min-height: 2.2rem;
  }

  .boss-status {
    display: flex;
    gap: 3px;
    flex-shrink: 0;
  }

  .pip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.7rem;
    height: 1.3rem;
    border-radius: 4px;
    font-size: 0.65em;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.15);
    transition:
      background 0.15s,
      color 0.15s;

    &.active {
      background: rgba($quality-uncommon, 0.15);
      color: $quality-uncommon;
    }
  }

  .boss-name {
    flex: 1;
    font-size: 1em;
    font-weight: 500;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (max-width: 600px) {
      font-size: 0.9em;
    }
  }

  .boss-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
    font-size: 0.75em;
  }

  .meta-sep {
    opacity: 0.2;
  }

  .expand-caret {
    opacity: 0.25;
    font-size: 0.9em;
    transition: transform 0.2s;
    line-height: 1;

    &.open {
      transform: rotate(180deg);
    }
  }

  /* ── Roster ── */
  .roster-panel {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.3rem 0.6rem 0.5rem 3rem;
    border-top: 1px solid rgba(255, 255, 255, 0.03);
  }

  .role-group {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.15rem 0.35rem;
  }

  .player {
    font-size: 0.8em;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.15s;

    &:hover {
      text-decoration: underline;
    }

    &::after {
      content: ',';
      color: rgba(255, 255, 255, 0.12);
      text-decoration: none;
    }

    &:last-of-type::after {
      content: '';
    }
  }

  .roster-enter-active,
  .roster-leave-active {
    transition:
      max-height 0.2s ease,
      opacity 0.15s ease;
    overflow: hidden;
  }

  .roster-enter-from,
  .roster-leave-to {
    max-height: 0;
    opacity: 0;
  }

  .roster-enter-to,
  .roster-leave-from {
    max-height: 10rem;
    opacity: 1;
  }

  /* ── Footer ── */
  .footer-links {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.85rem;
  }

  .footer-link {
    font-size: 0.8em;
    font-weight: 600;
    color: $accent-color;
    text-decoration: none;
    padding: 0.35rem 0.85rem;
    border: 1px solid rgba($accent-color, 0.3);
    border-radius: 6px;
    transition:
      background 0.15s,
      border-color 0.15s;

    &:hover {
      background: rgba($accent-color, 0.1);
      border-color: rgba($accent-color, 0.6);
    }
  }
}
</style>
