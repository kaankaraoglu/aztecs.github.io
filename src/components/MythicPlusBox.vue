<template>
  <div class="info-box info-box--no-hover mythic-plus-box">
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
            <span :class="['runner-name', runner.class]">{{ runner.name }}</span>
            <span class="runner-score">{{ runner.score }}</span>
            <span v-if="runner.topKeys && runner.topKeys.length" class="runner-keys">
              <span v-for="(key, ki) in runner.topKeys.slice(0, 2)" :key="ki" class="runner-key">{{
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
            <span :class="['dungeon-timed', best.timed ? 'timed--yes' : 'timed--no']">
              {{ best.timed ? '✓' : '✗' }}
            </span>
          </div>
        </div>
      </section>
    </template>
    <p v-else class="mp-empty">No M+ data yet this season.</p>
  </div>
</template>

<script setup>
import { useMythicPlus } from '@/composables/useMythicPlus'

const { topRunners, dungeonBests, hasData } = useMythicPlus()
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/_info-box.scss';
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
  display: flex;
  align-items: center;
  gap: $space-3;
  padding: $space-2 $space-3;
  background: $surface-2;
  min-height: 2.2rem;
  flex-wrap: wrap;

  @include mobile {
    gap: $space-2;
    padding: $space-2;
  }
}

.runner-rank {
  font-size: 0.75em;
  font-weight: 700;
  color: $color-text-subtle;
  width: 1.2rem;
  text-align: right;
  flex-shrink: 0;
}

.runner-name {
  font-size: 1em;
  font-weight: 600;
  flex: 0 0 auto;
  min-width: 6rem;
}

.runner-score {
  font-size: 0.85em;
  font-weight: 700;
  color: $accent-color;
  flex: 0 0 auto;
}

.runner-keys {
  display: flex;
  gap: $space-2;
  flex-wrap: wrap;
  margin-left: auto;

  @include mobile {
    margin-left: 0;
    width: 100%;
  }
}

.runner-key {
  font-size: 0.72em;
  color: $color-text-muted;
  background: $surface-1;
  border: 1px solid $color-border;
  border-radius: $radius-sm;
  padding: 0.1rem $space-2;
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
