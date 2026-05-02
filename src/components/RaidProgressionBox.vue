<template>
  <div class="raid-progression">
    <template v-if="!raids.length">
      <div class="skeleton-pills">
        <Skeleton class="h-14 w-[120px]" />
        <Skeleton class="h-14 w-[120px]" />
        <Skeleton class="h-14 w-[120px]" />
      </div>
      <Skeleton class="h-0.5 w-full" />
      <div class="skeleton-bosses">
        <Skeleton v-for="i in 5" :key="i" class="h-9 w-full" />
      </div>
    </template>
    <template v-else>
      <div class="box-header">
        <h3 class="box-title">Raids</h3>
        <p v-if="formattedUpdated" class="box-updated">Updated {{ formattedUpdated }}</p>
      </div>
      <div class="instances">
        <div v-for="raid in raids" :key="raid.name" class="instance difficulty-section">
          <h3 class="instance-name">{{ raid.name }}</h3>
          <div class="boss-list">
            <div v-for="boss in raid.bosses" :key="boss.name" class="boss-line">
              <span class="boss-status">
                <span :class="['pip', 'normal', { active: boss.normal }]">N</span>
                <span :class="['pip', 'heroic', { active: boss.heroic }]">HC</span>
                <span v-if="summary.mythic > 0" :class="['pip', 'mythic', { active: boss.mythic }]"
                  >M</span
                >
              </span>
              <div
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
                <div
                  class="boss-row"
                  :tabindex="hasRoster(boss) ? 0 : undefined"
                  :role="hasRoster(boss) ? 'button' : undefined"
                  :aria-expanded="hasRoster(boss) ? String(!!expanded[boss.name]) : undefined"
                  :aria-label="hasRoster(boss) ? `${boss.name} kill roster` : undefined"
                  @click="toggle(boss.name)"
                  @keydown.enter.prevent="hasRoster(boss) && toggle(boss.name)"
                  @keydown.space.prevent="hasRoster(boss) && toggle(boss.name)"
                >
                  <span class="boss-name">{{ boss.name }}</span>
                  <span class="meta-best">{{
                    boss.bestPercent != null ? `Best: ${boss.bestPercent.toFixed(1)}%` : ''
                  }}</span>
                  <span class="meta-pulls">{{ pullsText(boss) || '' }}</span>
                  <span class="meta-date">{{
                    boss.killedAt ? formatDate(boss.killedAt) : ''
                  }}</span>
                  <span class="meta-raiders">{{
                    hasRoster(boss) ? `${rosterSize(boss)} raiders` : ''
                  }}</span>
                  <span
                    class="expand-caret"
                    :class="{ open: expanded[boss.name], hidden: !hasRoster(boss) }"
                    >&#9662;</span
                  >
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
      </div>

      <div class="footer-links">
        <a
          class="footer-link"
          :href="latestReport || 'https://www.warcraftlogs.com/guild/eu/alakir/aztecs'"
          target="_blank"
          rel="noopener noreferrer"
          @click="
            trackEvent('click', {
              link_type: 'external',
              link_url: latestReport || 'https://www.warcraftlogs.com/guild/eu/alakir/aztecs',
              link_text: latestReport ? 'Latest Log' : 'Warcraft Logs',
            })
          "
        >
          {{ latestReport ? 'Latest Log' : 'Warcraft Logs' }}
        </a>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'
import RosterList from '@/components/RosterList.vue'
import { Skeleton } from '@/components/ui/skeleton'
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
  lastUpdated: {
    type: String,
    default: null,
  },
})

const formattedUpdated = computed(() => {
  if (!props.lastUpdated) return null
  const date = new Date(props.lastUpdated)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const expanded = reactive({})

function toggle(bossName) {
  expanded[bossName] = !expanded[bossName]
  if (expanded[bossName]) {
    trackEvent('select_content', { content_type: 'boss_roster', item_id: bossName })
  }
}

function formatDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const DIFFICULTY_LABEL = { normal: 'N', heroic: 'HC', mythic: 'M' }

function pullsText(boss) {
  const p = boss.pullsByDifficulty
  if (!p) return null
  const parts = []
  for (const diff of ['normal', 'heroic', 'mythic']) {
    if (p[diff]) parts.push(`${p[diff]} ${DIFFICULTY_LABEL[diff]}`)
  }
  if (!parts.length) return null
  return `Pulls: ${parts.join(' & ')}`
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
  const difficulties = ['normal', 'heroic', 'mythic']
  if (boss.bestPercent == null) return []
  const nextDiff = difficulties.find((d) => !boss[d])
  if (!nextDiff) return []
  return [{ difficulty: nextDiff, width: `${boss.bestPercent}%` }]
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
@use '@/assets/styles/tokens' as *;

.raid-progression {
  text-align: left;
  min-width: 0;
  overflow: hidden;

  .box-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: $space-3;
    margin-bottom: 0.75rem;
  }

  .box-title {
    margin: 0;
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
  }

  .box-updated {
    margin: 0;
    font-size: 0.7em;
    color: $color-text-muted;
    text-align: right;
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

  /* ── Instances list ── */
  .instances {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .difficulty-section {
    break-inside: avoid;
    margin-bottom: $space-4;
  }

  .instance-name {
    margin: 0 0 0.3rem;
    font-size: 0.8em;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: $accent-color;
    padding-left: 0.15rem;
  }

  .boss-list {
    display: flex;
    flex-direction: column;
    gap: $space-2;
  }

  .boss-line {
    display: flex;
    align-items: stretch;
    gap: $space-2;

    > .boss-status {
      flex-shrink: 0;
      align-self: stretch;

      .pip {
        height: auto;
        width: 2.6rem;
        align-self: stretch;
      }
    }

    > .boss-entry {
      flex: 1;
      min-width: 0;
      border-radius: $radius-md;
      overflow: hidden;
    }
  }

  /* ── Boss rows ── */
  .boss-entry {
    position: relative;
    background: $surface-2;
    transition: background $duration-fast;

    .difficulty-bar {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      transition: width 0.5s ease;
      pointer-events: none;

      &.normal {
        background: rgba($quality-rare, 0.25);
      }
      &.heroic {
        background: rgba($quality-epic, 0.3);
      }
      &.mythic {
        background: rgba($quality-legendary, 0.25);
      }
    }

    &:hover {
      background: $surface-3;
    }

    &.expandable .boss-row {
      cursor: pointer;
    }
  }

  .boss-row {
    position: relative;
    display: grid;
    grid-template-columns:
      [name] minmax(0, 1fr)
      [best] max-content
      [pulls] max-content
      [date] max-content
      [raiders] max-content
      [caret] 0.7rem;
    align-items: center;
    gap: 1.2rem;
    padding: 0.7rem 0.75rem;
    min-height: 3rem;
    font-size: 0.75em;

    .boss-name {
      font-size: 1.33em;
    }

    .meta-best,
    .meta-date,
    .meta-raiders,
    .meta-pulls {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: left;
    }

    @include tablet-sm {
      grid-template-columns: minmax(0, 1fr) auto;
      grid-auto-flow: row;
      gap: 0.2rem 0.5rem;
      padding: 0.6rem 0.6rem;
      min-height: 2.6rem;

      .boss-name {
        grid-row: 1;
        grid-column: 1;
      }
      .expand-caret {
        grid-row: 1;
        grid-column: 2;
      }
      .meta-best,
      .meta-pulls,
      .meta-date,
      .meta-raiders {
        grid-row: 2;
        grid-column: 1 / -1;
        text-align: left;
        opacity: 0.5;
        font-size: 0.95em;

        &:empty {
          display: none;
        }
      }
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
    background: rgba(var(--t-text-primary-rgb), 0.03);
    color: rgba(var(--t-text-primary-rgb), 0.15);
    transition:
      background $duration-fast,
      color $duration-fast;

    &.normal.active {
      background: rgba($quality-rare, 0.18);
      color: $quality-rare;
    }
    &.heroic.active {
      background: rgba($quality-epic, 0.25);
      color: $quality-epic;
    }
    &.mythic.active {
      background: rgba($quality-legendary, 0.2);
      color: $quality-legendary;
    }

    @include tablet-sm {
      width: 1.5rem;
      height: 1.1rem;
      font-size: 0.6em;
    }
  }

  .boss-name {
    font-weight: 500;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .expand-caret {
    opacity: 0.25;
    font-size: 0.9em;
    transition: transform 0.2s;
    line-height: 1;
    text-align: center;

    &.open {
      transform: rotate(180deg);
    }

    &.hidden {
      visibility: hidden;
    }
  }

  /* ── Roster ── */
  .roster-panel {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.3rem 0.6rem 0.5rem 3rem;
    border-top: 1px solid rgba(var(--t-text-primary-rgb), 0.03);

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
    gap: 0.5rem;
    margin-top: 0.85rem;
  }

  .footer-link {
    flex: 1 1 0;
    text-align: center;
    font-size: 0.8em;
    font-weight: 600;
    color: $accent-color;
    text-decoration: none;
    padding: 0.9rem 0.85rem;
    border: 1px solid rgba(var(--t-accent-rgb), 0.3);
    border-radius: $radius-md;
    transition:
      background $duration-fast,
      border-color $duration-fast;

    &:hover {
      background: rgba(var(--t-accent-rgb), 0.1);
      border-color: rgba(var(--t-accent-rgb), 0.6);
    }
  }
}
</style>
