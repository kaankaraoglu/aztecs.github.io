<template>
  <div class="roster-list">
    <div v-if="tanks?.length" class="role-group">
      <RoleIcon v-if="showIcons" role="tank" />
      <span v-else class="role-label">Tanks: </span>
      <ul class="player-list" aria-label="Tanks">
        <li v-for="(player, index) in tanks" :key="'tank-' + index" class="player-item">
          <PlayerChip
            :player="player"
            :linked="linked"
            :tooltip-fn="tooltipFn"
            :needs-comma="!linked && index < tanks.length - 1"
          />
        </li>
      </ul>
      <br v-if="!showIcons" />
    </div>
    <div v-if="healers?.length" class="role-group">
      <RoleIcon v-if="showIcons" role="healer" />
      <span v-else class="role-label">Healers: </span>
      <ul class="player-list" aria-label="Healers">
        <li v-for="(player, index) in healers" :key="'healer-' + index" class="player-item">
          <PlayerChip
            :player="player"
            :linked="linked"
            :tooltip-fn="tooltipFn"
            :needs-comma="!linked && index < healers.length - 1"
          />
        </li>
      </ul>
      <br v-if="!showIcons" />
    </div>
    <div v-if="dps?.length" class="role-group">
      <RoleIcon v-if="showIcons" role="dps" />
      <span v-else class="role-label">DDs: </span>
      <ul class="player-list" aria-label="Damage dealers">
        <li v-for="(player, index) in dps" :key="'dd-' + index" class="player-item">
          <PlayerChip
            :player="player"
            :linked="linked"
            :tooltip-fn="tooltipFn"
            :needs-comma="!linked && index < dps.length - 1"
          />
        </li>
      </ul>
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

defineProps({
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
  /** Optional function to generate tooltip text for a player */
  tooltipFn: { type: Function, default: null },
})

/**
 * Inline chip that wraps each player. When a tooltip is available the name
 * is wrapped in a shadcn HoverCard; otherwise we render the raw link/span
 * so we don't pay the HoverCard cost for every raider in a 20-man kill.
 */
const PlayerChip = {
  name: 'PlayerChip',
  props: {
    player: { type: Object, required: true },
    linked: { type: Boolean, default: false },
    tooltipFn: { type: Function, default: null },
    needsComma: { type: Boolean, default: false },
  },
  setup(props) {
    const tooltip = computed(() => (props.tooltipFn ? props.tooltipFn(props.player) : null))
    return { tooltip }
  },
  components: { HoverCard, HoverCardContent, HoverCardTrigger },
  template: `
    <HoverCard v-if="tooltip" :open-delay="150" :close-delay="80">
      <HoverCardTrigger as-child>
        <component
          :is="linked ? 'a' : 'span'"
          :class="['player', player.class]"
          v-bind="linked ? { href: player.armory, target: '_blank', rel: 'noopener noreferrer' } : {}"
        >{{ player.name }}<span v-if="needsComma">,</span></component>
      </HoverCardTrigger>
      <HoverCardContent class="w-auto text-sm px-3 py-1.5">{{ tooltip }}</HoverCardContent>
    </HoverCard>
    <component
      v-else
      :is="linked ? 'a' : 'span'"
      :class="['player', player.class]"
      v-bind="linked ? { href: player.armory, target: '_blank', rel: 'noopener noreferrer' } : {}"
    >{{ player.name }}<span v-if="needsComma">,</span></component>
  `,
}
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
