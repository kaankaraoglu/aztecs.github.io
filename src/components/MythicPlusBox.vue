<template>
  <InfoBox no-hover class="mythic-plus-box">
    <h3 class="mp-section-title">Mythic+</h3>
    <template v-if="hasData">
      <section class="mp-section">
        <ol class="runners-list">
          <li
            v-for="(runner, index) in topRunners.slice(0, 10)"
            :key="runner.name"
            class="runner-entry"
          >
            <span class="runner-rank">{{ index + 1 }}</span>
            <a
              :href="`https://worldofwarcraft.blizzard.com/en-gb/character/eu/${runner.realmSlug}/${runner.name.toLowerCase()}`"
              target="_blank"
              rel="noopener noreferrer"
              :class="['runner-name', runner.class]"
              >{{ runner.name }}</a
            >
            <span class="runner-score">{{ runner.score }}</span>
            <span v-if="runner.topKeys && runner.topKeys.length" class="runner-keys">
              <span v-for="(key, ki) in runner.topKeys" :key="ki" class="runner-key">{{
                key
              }}</span>
            </span>
          </li>
        </ol>
      </section>

      <section class="mp-section">
        <h3 class="mp-section-title">Dungeon Bests</h3>
        <div class="dungeon-grid">
          <div v-for="best in dungeonBests" :key="best.dungeon" class="dungeon-cell">
            <span class="dungeon-name">{{ best.dungeon }}</span>
            <span class="dungeon-level">+{{ best.level }}</span>
            <span
              :class="['dungeon-timed', best.timed ? 'timed--yes' : 'timed--no']"
              :aria-label="best.timed ? 'Timed' : 'Not timed'"
              role="img"
            >
              {{ best.timed ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </section>
      <p v-if="formattedUpdated" class="mp-updated">Updated {{ formattedUpdated }}</p>
    </template>
    <p v-else class="mp-empty">No M+ data yet this season.</p>
  </InfoBox>
</template>

<script setup>
import { computed } from 'vue'
import InfoBox from '@/components/InfoBox.vue'
import { useMythicPlus } from '@/composables/useMythicPlus'

const { topRunners, dungeonBests, lastUpdated, hasData } = useMythicPlus()

const formattedUpdated = computed(() => {
  if (!lastUpdated) return null
  const date = new Date(lastUpdated)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.mythic-plus-box {
  display: flex;
  flex-direction: column;
  gap: $space-6;
  text-align: left;
}

.mp-empty {
  color: $color-text-subtle;
  font-size: 0.95em;
  margin: $space-4 0 0;
}

.mp-updated {
  margin: $space-2 0 0;
  font-size: 0.7em;
  color: $color-text-muted;
  text-align: right;
  opacity: 0.6;
}

.mp-section {
  display: flex;
  flex-direction: column;
  gap: $space-3;
}

.mp-section-title {
  margin: 0;
  font-size: 0.8em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $accent-color;
  text-shadow: 0 0 20px rgba($accent-color, 0.3);
  opacity: 0.6;
}

/* ── Top Runners ── */
.runners-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
  border-radius: $radius-md;
  overflow: hidden;
}

.runner-entry {
  display: grid;
  grid-template-columns: 1.2rem minmax(6rem, auto) auto 1fr;
  align-items: center;
  gap: $space-3;
  padding: $space-2 $space-3;
  background: $surface-2;
  min-height: 2.2rem;

  @include mobile {
    gap: $space-2;
    padding: $space-2;
    grid-template-columns: 1.2rem 1fr auto auto;
  }
}

.runner-rank {
  font-size: 0.75em;
  font-weight: 700;
  color: $color-text-subtle;
  text-align: right;
}

.runner-name {
  font-size: 1em;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.runner-score {
  font-size: 0.85em;
  font-weight: 700;
  color: $accent-color;
}

.runner-keys {
  display: flex;
  gap: $space-2;
  flex-wrap: nowrap;
  justify-content: flex-end;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.runner-key {
  font-size: 0.72em;
  color: $color-text-muted;
  background: $surface-1;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  padding: 0.1rem $space-2;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Dungeon Grid ── */
.dungeon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(200px, 100%), 1fr));
  gap: $space-2;

  @include mobile {
    grid-template-columns: 1fr;
  }
}

.dungeon-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: $space-2;
  padding: $space-2 $space-3;
  background: $surface-2;
  border-radius: $radius-md;
  border: 1px solid $color-border;
}

.dungeon-name {
  flex: 1;
  font-size: 0.85em;
  font-weight: 500;
  color: $color-text-muted;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dungeon-level {
  font-size: 0.9em;
  font-weight: 700;
  color: $accent-color;
  flex-shrink: 0;
}

.dungeon-timed {
  font-size: 0.85em;
  font-weight: 700;
  flex-shrink: 0;

  &.timed--yes {
    color: $quality-uncommon;
  }

  &.timed--no {
    color: $color-red;
  }
}
</style>
