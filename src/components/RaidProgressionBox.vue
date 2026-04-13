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
      <div class="raid-header">
        <div class="raid-header-left">
          <span class="raid-label">Raids</span>
          <span class="raid-separator">·</span>
          <span class="raid-name" :class="`header-difficulty-${highestDifficulty(raids[0])}`">
            {{ raids[0].name }}
          </span>
        </div>
        <div v-if="badgeDifficulty" class="raid-badge" :class="`badge-${badgeDifficulty}`">
          {{ badgeText }}
        </div>
      </div>
      <div
        v-if="summary.normal > 0 || summary.heroic > 0 || summary.mythic > 0"
        ref="progressRef"
        class="progress-section"
      >
        <div v-if="summary.normal > 0" class="progress-row progress-row--normal">
          <span class="progress-label">Normal</span>
          <span class="progress-count">{{ summary.normal }}/{{ summary.total }}</span>
          <div class="progress-track">
            <div
              class="progress-fill"
              :class="{ animate: isVisible }"
              :style="{ '--progress': pct(summary.normal) }"
            ></div>
          </div>
        </div>
        <div v-if="summary.heroic > 0" class="progress-row progress-row--heroic">
          <span class="progress-label">Heroic</span>
          <span class="progress-count">{{ summary.heroic }}/{{ summary.total }}</span>
          <div class="progress-track">
            <div
              class="progress-fill"
              :class="{ animate: isVisible }"
              :style="{ '--progress': pct(summary.heroic) }"
            ></div>
          </div>
        </div>
        <div v-if="summary.mythic > 0" class="progress-row progress-row--mythic">
          <span class="progress-label">Mythic</span>
          <span class="progress-count">{{ summary.mythic }}/{{ summary.total }}</span>
          <div class="progress-track">
            <div
              class="progress-fill"
              :class="{ animate: isVisible }"
              :style="{ '--progress': pct(summary.mythic) }"
            ></div>
          </div>
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
            >
              <span
                v-for="bar in difficultyBars(boss)"
                :key="bar.difficulty"
                class="difficulty-bar"
                :class="bar.difficulty"
                :style="{ width: bar.width }"
              ></span>
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
          @click="
            trackEvent('click', {
              link_type: 'external',
              link_url: latestReport,
              link_text: 'Latest Log',
            })
          "
        >
          Latest Log
        </a>
        <a
          class="footer-link"
          href="https://raider.io/guilds/eu/alakir/Aztecs"
          target="_blank"
          rel="noopener noreferrer"
          @click="
            trackEvent('click', {
              link_type: 'external',
              link_url: 'https://raider.io/guilds/eu/alakir/Aztecs',
              link_text: 'Raider.IO',
            })
          "
        >
          Raider.IO
        </a>
      </div>
    </template>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import RosterList from '@/components/RosterList.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import { useAnalytics } from '@/composables/useAnalytics'

const { trackEvent } = useAnalytics()

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

const badgeDifficulty = computed(() => {
  if (props.summary.mythic > 0) return 'mythic'
  if (props.summary.heroic > 0) return 'heroic'
  if (props.summary.normal > 0) return 'normal'
  return null
})

const badgeText = computed(() => {
  const s = props.summary
  if (!s.total) return null
  if (s.mythic > 0) return `${s.mythic}/${s.total} M`
  if (s.heroic > 0) return `${s.heroic}/${s.total} HC`
  if (s.normal > 0) return `${s.normal}/${s.total} N`
  return null
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
  if (expanded[bossName]) {
    trackEvent('select_content', { content_type: 'boss_roster', item_id: bossName })
  }
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

function difficultyBars(boss) {
  const bars = []
  const difficulties = ['normal', 'heroic', 'mythic']
  for (const diff of difficulties) {
    if (boss[diff]) {
      bars.push({ difficulty: diff, width: '100%' })
    }
  }
  if (boss.bestPercent != null) {
    const nextDiff = difficulties.find((d) => !boss[d])
    if (nextDiff) {
      bars.push({ difficulty: nextDiff, width: `${boss.bestPercent}%` })
    }
  }
  return bars
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

// Lightened difficulty colors for progress bars — slightly brighter than
// $quality-rare/#4477ff and $quality-epic/#9900cc for readability on dark glass.
$progress-normal: #4da6ff;
$progress-heroic: #c060ff;

.raid-progression {
  text-align: left;
  min-width: 0;
  overflow: hidden;

  .raid-header {
    display: flex;
    align-items: baseline;
    gap: $space-2;
    margin-bottom: $space-3;
  }

  .raid-header-left {
    display: flex;
    align-items: baseline;
    gap: $space-2;
    min-width: 0;
    overflow: hidden;
  }

  .raid-label {
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
    text-shadow: 0 0 20px rgba($accent-color, 0.3);
    opacity: 0.6;
    flex-shrink: 0;
  }

  .raid-separator {
    opacity: 0.25;
    flex-shrink: 0;
    font-size: 0.8em;
  }

  .raid-name {
    font-size: 0.6em;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-difficulty-normal {
    color: $quality-rare;
  }
  .header-difficulty-heroic {
    color: $quality-epic;
  }
  .header-difficulty-mythic {
    color: $quality-legendary;
  }

  .raid-badge {
    margin-left: auto;
    font-size: 0.58em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.15rem 0.5rem;
    border-radius: $radius-sm;
    flex-shrink: 0;
    line-height: 1.6;

    &.badge-normal {
      color: $quality-rare;
      background: rgba($quality-rare, 0.15);
      border: 1px solid rgba($quality-rare, 0.4);
    }

    &.badge-heroic {
      color: $quality-epic;
      background: rgba($quality-epic, 0.18);
      border: 1px solid rgba($quality-epic, 0.42);
    }

    &.badge-mythic {
      color: $quality-legendary;
      background: rgba($quality-legendary, 0.15);
      border: 1px solid rgba($quality-legendary, 0.4);
      box-shadow: 0 0 10px rgba($quality-legendary, 0.2);
    }
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
    gap: $space-1;
  }

  /* ── Progress section ── */
  .progress-section {
    background: rgba(255, 255, 255, 0.07);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-top-color: rgba(255, 255, 255, 0.22);
    border-radius: $radius-md;
    padding: $space-3 $space-4;
    margin-bottom: $space-4;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
  }

  .progress-row {
    display: flex;
    align-items: center;
    gap: $space-3;

    &:not(:last-child) {
      margin-bottom: 0.38rem;
    }
  }

  .progress-label {
    font-size: 0.58em;
    text-transform: uppercase;
    font-weight: 700;
    width: 2.8rem;
    flex-shrink: 0;
  }

  .progress-count {
    font-size: 0.65em;
    font-weight: 800;
    width: 1.8rem;
    flex-shrink: 0;
    line-height: 1;
  }

  .progress-track {
    flex: 1;
    height: 3px;
    border-radius: 2px;
  }

  .progress-fill {
    height: 100%;
    border-radius: 2px;
    width: 0;
    transition: width 1s $ease-out;

    &.animate {
      width: var(--progress);
    }
  }

  .progress-row--normal {
    .progress-label,
    .progress-count {
      color: $progress-normal;
    }

    .progress-count {
      text-shadow: 0 0 8px rgba($progress-normal, 0.6);
    }

    .progress-track {
      background: rgba($progress-normal, 0.15);
    }

    .progress-fill {
      background: $progress-normal;
      box-shadow: 0 0 7px rgba($progress-normal, 0.65);
      transition-delay: 0ms;
    }
  }

  .progress-row--heroic {
    .progress-label,
    .progress-count {
      color: $progress-heroic;
    }

    .progress-count {
      text-shadow: 0 0 8px rgba($progress-heroic, 0.7);
    }

    .progress-track {
      background: rgba($progress-heroic, 0.15);
    }

    .progress-fill {
      background: $progress-heroic;
      box-shadow: 0 0 7px rgba($progress-heroic, 0.7);
      transition-delay: 150ms;
    }
  }

  .progress-row--mythic {
    .progress-label,
    .progress-count {
      color: $quality-legendary;
    }

    .progress-count {
      text-shadow: 0 0 8px rgba(255, 128, 0, 0.6);
    }

    .progress-track {
      background: rgba(255, 128, 0, 0.15);
    }

    .progress-fill {
      background: $quality-legendary;
      box-shadow: 0 0 7px rgba(255, 128, 0, 0.65);
      transition-delay: 300ms;
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
    gap: $space-1;
  }

  /* ── Boss rows ── */
  .boss-entry {
    position: relative;
    border-radius: $radius-md;
    transition:
      background $duration-fast,
      border-color $duration-fast;

    .difficulty-bar {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      transition: width 0.5s ease;
      pointer-events: none;

      &.normal {
        background: rgba($quality-rare, 0.18);
      }
      &.heroic {
        background: rgba($quality-epic, 0.25);
      }
      &.mythic {
        background: rgba($quality-legendary, 0.18);
      }
    }

    &.killed {
      border: 1px solid rgba(255, 255, 255, 0.13);
      border-top-color: rgba(255, 255, 255, 0.22);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    }

    &.in-progress {
      border: 1px solid rgba($quality-epic, 0.28);
      box-shadow: 0 2px 10px rgba($quality-epic, 0.08);
    }

    &:not(.killed):not(.in-progress) {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.07);
      opacity: 0.35;
    }

    &.expandable .boss-row {
      cursor: pointer;
    }
  }

  .boss-row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    min-height: 2.2rem;

    @include tablet-sm {
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

    @include tablet-sm {
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
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.18);
    border: 1px solid transparent;
    transition:
      background $duration-fast,
      color $duration-fast,
      border-color $duration-fast;

    &.active {
      background: rgba($quality-uncommon, 0.14);
      color: $quality-uncommon;
      border-color: rgba($quality-uncommon, 0.28);
    }

    @include tablet-sm {
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

    @include tablet-sm {
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

    @include tablet-sm {
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

    @include tablet-sm {
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
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-top-color: rgba(255, 255, 255, 0.2);
    border-radius: $radius-md;
    transition:
      background $duration-fast,
      border-color $duration-fast;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.18);
    }
  }

  @include reduced-motion {
    .progress-fill {
      transition: none;
      width: var(--progress);
    }
  }
}
</style>
