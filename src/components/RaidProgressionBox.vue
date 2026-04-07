<template>
  <div class="raid-progression">
    <template v-if="!raids.length">
      <div class="skeleton-pills">
        <SkeletonLoader width="120px" height="3.5rem" />
        <SkeletonLoader width="120px" height="3.5rem" />
        <SkeletonLoader width="120px" height="3.5rem" />
      </div>
      <SkeletonLoader width="100%" height="2px" />
      <div class="skeleton-bosses">
        <SkeletonLoader v-for="i in 5" :key="i" width="100%" height="2.2rem" />
      </div>
    </template>
    <template v-else>
      <h3 class="box-title">Raids</h3>
      <div
        v-if="summary.normal > 0 || summary.heroic > 0 || summary.mythic > 0"
        ref="progressRef"
        class="summary"
      >
        <div v-if="summary.normal > 0" class="summary-pill normal">
          <span class="summary-count">{{ summary.normal }}/{{ summary.total }}</span>
          <span class="summary-label">Normal</span>
          <span class="summary-track"
            ><span
              class="summary-fill"
              :class="{ animate: isVisible }"
              :style="{ '--progress': pct(summary.normal) }"
            ></span
          ></span>
        </div>
        <div v-if="summary.heroic > 0" class="summary-pill heroic">
          <span class="summary-count">{{ summary.heroic }}/{{ summary.total }}</span>
          <span class="summary-label">Heroic</span>
          <span class="summary-track"
            ><span
              class="summary-fill"
              :class="{ animate: isVisible }"
              :style="{ '--progress': pct(summary.heroic) }"
            ></span
          ></span>
        </div>
        <div v-if="summary.mythic > 0" class="summary-pill mythic">
          <span class="summary-count">{{ summary.mythic }}/{{ summary.total }}</span>
          <span class="summary-label">Mythic</span>
          <span class="summary-track"
            ><span
              class="summary-fill"
              :class="{ animate: isVisible }"
              :style="{ '--progress': pct(summary.mythic) }"
            ></span
          ></span>
        </div>
      </div>

      <div class="instances">
        <div
          v-for="raid in raids"
          :key="raid.name"
          class="instance difficulty-section"
          :data-difficulty="highestDifficulty(raid)"
        >
          <h3 class="instance-name">{{ raid.name }}</h3>
          <div class="boss-list">
            <div
              v-for="boss in raid.bosses"
              :key="boss.name"
              :class="[
                'boss-entry',
                {
                  expandable: hasRoster(boss),
                  killed: boss.normal || boss.heroic || boss.mythic,
                  'in-progress':
                    !boss.normal && !boss.heroic && !boss.mythic && boss.bestPercent != null,
                },
              ]"
              :style="bossBarStyle(boss)"
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
              <div class="roster-wrapper" :class="{ expanded: expanded[boss.name] }">
                <div
                  v-show="expanded[boss.name] && hasRoster(boss)"
                  class="roster-inner"
                  :aria-hidden="!expanded[boss.name]"
                >
                  <RosterList
                    v-if="expanded[boss.name] && hasRoster(boss)"
                    class="roster-panel"
                    :tanks="boss.roster?.tanks"
                    :healers="boss.roster?.healers"
                    :dps="boss.roster?.dps"
                    :linked="true"
                    :show-icons="true"
                    :tooltip-fn="playerTooltip"
                  />
                </div>
              </div>
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
    </template>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import RosterList from '@/components/RosterList.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'

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

const progressRef = ref(null)
const isVisible = ref(false)
let progressObserver = null

onMounted(() => {
  progressObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        progressObserver.disconnect()
      }
    },
    { threshold: 0.1 },
  )
  if (progressRef.value) progressObserver.observe(progressRef.value)
})

onUnmounted(() => progressObserver?.disconnect())

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

function bossBarStyle(boss) {
  if (boss.normal || boss.heroic || boss.mythic) {
    return { '--bar-width': '100%' }
  }
  if (boss.bestPercent != null) {
    return { '--bar-width': `${100 - boss.bestPercent}%` }
  }
  return { '--bar-width': '0%' }
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

function highestDifficulty(raid) {
  if (raid.bosses.some((b) => b.mythic)) return 'mythic'
  if (raid.bosses.some((b) => b.heroic)) return 'heroic'
  if (raid.bosses.some((b) => b.normal)) return 'normal'
  return 'normal'
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.raid-progression {
  text-align: left;
  min-width: 0;
  overflow: hidden;

  .box-title {
    margin: 0 0 0.75rem;
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
    text-shadow: 0 0 20px rgba($accent-color, 0.3);
    opacity: 0.6;
  }

  /* ── Skeleton ── */
  .skeleton-pills {
    display: flex;
    gap: $space-2;
    margin-bottom: $space-4;
  }

  .skeleton-bosses {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  /* ── Summary ── */
  .summary {
    display: flex;
    gap: $space-2;
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
    padding: $space-2 $space-3;
    border-radius: $radius-md;
    background: $surface-1;
    border: 1px solid $color-border;

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
        width: 0;
        transition: width 1s $ease-out;

        &.animate {
          width: var(--progress);
        }
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

  /* ── Instances list ── */
  .instances {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .difficulty-section {
    break-inside: avoid;
    border-left: 3px solid var(--difficulty-color);
    padding-left: $space-4;
    margin-bottom: $space-4;

    @include mobile {
      padding-left: $space-2;
    }

    &[data-difficulty='normal'] {
      --difficulty-color: #{$quality-rare};
    }
    &[data-difficulty='heroic'] {
      --difficulty-color: #{$quality-epic};
    }
    &[data-difficulty='mythic'] {
      --difficulty-color: #{$quality-legendary};
    }
  }

  .instance-name {
    margin: 0 0 0.3rem;
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
    text-shadow: 0 0 20px rgba($accent-color, 0.3);
    opacity: 0.6;
    padding-left: 0.15rem;
  }

  .boss-list {
    display: flex;
    flex-direction: column;
    gap: 1px;
    border-radius: $radius-md;
    overflow: hidden;
  }

  /* ── Boss rows ── */
  .boss-entry {
    position: relative;
    background: $surface-2;
    transition: background $duration-fast;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      width: var(--bar-width, 0%);
      border-radius: inherit;
      transition: width 0.5s ease;
      pointer-events: none;
    }

    &.killed::before {
      background: rgba($quality-uncommon, 0.08);
    }

    &.in-progress::before {
      background: rgba($color-yellow, 0.1);
    }

    &:hover {
      background: $surface-3;
    }

    &.expandable .boss-row {
      cursor: pointer;
    }

    &:not(.killed):not(.in-progress) {
      opacity: 0.55;
    }
  }

  .boss-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    min-height: 2.2rem;

    @media (max-width: 700px) {
      flex-wrap: wrap;
      gap: 0.2rem 0.5rem;
      padding: 0.35rem 0.5rem;
      min-height: unset;
    }
  }

  .boss-status {
    display: flex;
    gap: 3px;
    flex-shrink: 0;

    @media (max-width: 700px) {
      order: -1;
    }
  }

  .pip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.7rem;
    height: 1.3rem;
    border-radius: $radius-sm;
    font-size: 0.65em;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.15);
    transition:
      background $duration-fast,
      color $duration-fast;

    &.active {
      background: rgba($quality-uncommon, 0.15);
      color: $quality-uncommon;
    }

    @media (max-width: 700px) {
      width: 1.5rem;
      height: 1.1rem;
      font-size: 0.6em;
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

    @media (max-width: 700px) {
      font-size: 0.9em;
      flex-basis: 0;
    }
  }

  .boss-meta {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex-shrink: 0;
    font-size: 0.75em;

    @media (max-width: 700px) {
      width: 100%;
      font-size: 0.7em;
      opacity: 0.5;
      padding-left: calc(1.5rem * 2 + 3px + 0.5rem);
    }
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

    @media (max-width: 700px) {
      padding-left: 0.5rem;
    }
  }

  .roster-panel :deep(.player) {
    font-size: 0.8em;
    transition: opacity 0.15s;
  }

  .roster-wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows $duration-normal $ease-out;

    &.expanded {
      grid-template-rows: 1fr;
    }
  }

  .roster-inner {
    overflow: hidden;
  }

  /* ── Footer ── */
  .footer-links {
    display: flex;
    flex-wrap: wrap;
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
    border-radius: $radius-md;
    transition:
      background $duration-fast,
      border-color $duration-fast;

    &:hover {
      background: rgba($accent-color, 0.1);
      border-color: rgba($accent-color, 0.6);
    }
  }

  @include reduced-motion {
    .summary-fill {
      transition: none;
      width: var(--progress);
    }
  }
}
</style>
