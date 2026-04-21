<template>
  <div class="roster-list">
    <div v-for="group in renderedGroups" :key="group.role" class="role-group">
      <RoleIcon v-if="showIcons" :role="group.role" />
      <span v-else class="role-label">{{ group.label }}: </span>
      <ul class="player-list" :aria-label="group.ariaLabel">
        <li
          v-for="(player, index) in group.players"
          :key="`${group.role}-${index}`"
          class="player-item"
        >
          <HoverCard v-if="tooltipFn" :open-delay="150" :close-delay="80">
            <HoverCardTrigger as-child>
              <a
                v-if="linked"
                :class="['player', player.class]"
                :href="player.armory"
                target="_blank"
                rel="noopener noreferrer"
                >{{ player.name }}</a
              >
              <span v-else :class="['player', player.class]"
                >{{ player.name }}<span v-if="index < group.players.length - 1">,</span></span
              >
            </HoverCardTrigger>
            <HoverCardContent class="w-auto text-sm px-3 py-1.5">{{
              tooltipFn(player)
            }}</HoverCardContent>
          </HoverCard>
          <template v-else>
            <a
              v-if="linked"
              :class="['player', player.class]"
              :href="player.armory"
              target="_blank"
              rel="noopener noreferrer"
              >{{ player.name }}</a
            >
            <span v-else :class="['player', player.class]"
              >{{ player.name }}<span v-if="index < group.players.length - 1">,</span></span
            >
          </template>
        </li>
      </ul>
      <br v-if="!showIcons && !group.isLast" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import RoleIcon from '@/components/icons/RoleIcon.vue'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'

/**
 * @typedef {{ name: string, class: string, armory?: string, spec?: string }} Player
 */

const props = defineProps({
  /** @type {import('vue').PropType<Player[]>} */
  tanks: { type: Array, default: () => [] },
  /** @type {import('vue').PropType<Player[]>} */
  healers: { type: Array, default: () => [] },
  /** @type {import('vue').PropType<Player[]>} */
  dps: { type: Array, default: () => [] },
  /** Render players as <a> links using player.armory */
  linked: { type: Boolean, default: false },
  /** Show RoleIcon SVGs instead of text labels */
  showIcons: { type: Boolean, default: false },
  /** Optional function that returns tooltip text for a player */
  tooltipFn: { type: Function, default: null },
})

/**
 * Collapse props into an iterable list of { role, label, players } so the
 * template can render all three groups with one v-for, and we don't get
 * the "only v-for shows markers" edge case from the old triple-section
 * layout.
 */
const renderedGroups = computed(() => {
  const groups = []
  if (props.tanks?.length)
    groups.push({ role: 'tank', label: 'Tanks', ariaLabel: 'Tanks', players: props.tanks })
  if (props.healers?.length)
    groups.push({ role: 'healer', label: 'Healers', ariaLabel: 'Healers', players: props.healers })
  if (props.dps?.length)
    groups.push({ role: 'dps', label: 'DDs', ariaLabel: 'Damage dealers', players: props.dps })
  return groups.map((g, i) => ({ ...g, isLast: i === groups.length - 1 }))
})
</script>

<style scoped lang="scss">
.role-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.15rem 0.35rem;
}

.player-list {
  display: contents;
  list-style: none;
  margin: 0;
  padding: 0;
}

.player-item {
  display: contents;
}

.role-label {
  font-weight: 600;
}

.player {
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

/* Comma separators via CSS for linked variant */
a.player::after {
  content: ',';
  color: rgba(var(--t-text-primary-rgb), 0.12);
  text-decoration: none;
}

a.player:last-of-type::after {
  content: '';
}
</style>
