<template>
  <div class="roster-list">
    <div v-if="tanks?.length" class="role-group">
      <RoleIcon v-if="showIcons" role="tank" />
      <span v-else class="role-label">Tanks: </span>
      <component
        :is="linked ? 'a' : 'span'"
        v-for="(player, index) in tanks"
        :key="'tank-' + index"
        :class="['player', player.class]"
        v-bind="linked ? linkAttrs(player) : {}"
        :title="tooltipFn?.(player)"
      >
        {{ player.name }}<span v-if="!linked && index < tanks.length - 1">,</span>
      </component>
      <br v-if="!showIcons" />
    </div>
    <div v-if="healers?.length" class="role-group">
      <RoleIcon v-if="showIcons" role="healer" />
      <span v-else class="role-label">Healers: </span>
      <component
        :is="linked ? 'a' : 'span'"
        v-for="(player, index) in healers"
        :key="'healer-' + index"
        :class="['player', player.class]"
        v-bind="linked ? linkAttrs(player) : {}"
        :title="tooltipFn?.(player)"
      >
        {{ player.name }}<span v-if="!linked && index < healers.length - 1">,</span>
      </component>
      <br v-if="!showIcons" />
    </div>
    <div v-if="dps?.length" class="role-group">
      <RoleIcon v-if="showIcons" role="dps" />
      <span v-else class="role-label">DDs: </span>
      <component
        :is="linked ? 'a' : 'span'"
        v-for="(player, index) in dps"
        :key="'dd-' + index"
        :class="['player', player.class]"
        v-bind="linked ? linkAttrs(player) : {}"
        :title="tooltipFn?.(player)"
      >
        {{ player.name }}<span v-if="!linked && index < dps.length - 1">,</span>
      </component>
    </div>
  </div>
</template>

<script setup>
import RoleIcon from '@/components/icons/RoleIcon.vue'

/**
 * @typedef {{ name: string, class: string, armory?: string, spec?: string }} Player
 */

defineProps({
  /** @type {import('vue').PropType<Player[]>} */
  tanks: {
    type: Array,
    default: () => [],
  },
  /** @type {import('vue').PropType<Player[]>} */
  healers: {
    type: Array,
    default: () => [],
  },
  /** @type {import('vue').PropType<Player[]>} */
  dps: {
    type: Array,
    default: () => [],
  },
  /** Render players as <a> links using player.armory */
  linked: {
    type: Boolean,
    default: false,
  },
  /** Show RoleIcon SVGs instead of text labels */
  showIcons: {
    type: Boolean,
    default: false,
  },
  /** Optional function to generate tooltip text for a player */
  tooltipFn: {
    type: Function,
    default: null,
  },
})

function linkAttrs(player) {
  return {
    href: player.armory,
    target: '_blank',
    rel: 'noopener noreferrer',
  }
}
</script>

<style scoped lang="scss">
.role-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.15rem 0.35rem;
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
  color: rgba(255, 255, 255, 0.12);
  text-decoration: none;
}

a.player:last-of-type::after {
  content: '';
}
</style>
