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

const ROLE_DEFS = [
  { role: 'tank', prop: 'tanks', label: 'Tanks', ariaLabel: 'Tanks' },
  { role: 'healer', prop: 'healers', label: 'Healers', ariaLabel: 'Healers' },
  { role: 'dps', prop: 'dps', label: 'DDs', ariaLabel: 'Damage dealers' },
]

const renderedGroups = computed(() => {
  const groups = ROLE_DEFS.filter((def) => props[def.prop]?.length).map((def) => ({
    role: def.role,
    label: def.label,
    ariaLabel: def.ariaLabel,
    players: props[def.prop],
  }))
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

/* No comma separators in the linked variant: each anchor sits alone in its own
   <li>, so a `:last-of-type` exception would match every one of them. The
   unlinked variant renders its separators in the template instead. */
</style>
