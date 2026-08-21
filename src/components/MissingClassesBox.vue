<template>
  <InfoBox v-if="missingClasses.length > 0" no-hover class="missing-classes-box">
    <p class="box-label">Classes We Need for Next Tier</p>
    <div class="class-list">
      <span
        v-for="cls in missingClasses"
        :key="cls.key"
        :class="['class-pill', toClassColorCss(cls.key)]"
      >
        {{ cls.name }}
      </span>
    </div>
    <router-link to="/next-tier" class="signup-link">Sign up for next tier &rarr;</router-link>
  </InfoBox>
</template>

<script setup>
import { computed } from 'vue'
import { WOW_CLASSES } from '@/data/wow-classes.js'
import InfoBox from '@/components/InfoBox.vue'
import { toClassColorCss } from '@/lib/utils'

const props = defineProps({
  submissions: { type: Array, required: true },
})

const missingClasses = computed(() => {
  // Before signups load, every class looks "missing" — the home page briefly
  // advertised that the guild needs all thirteen.
  if (props.submissions.length === 0) return []

  const signedUpClasses = new Set(props.submissions.map((s) => s.className))
  return Object.entries(WOW_CLASSES)
    .filter(([key]) => !signedUpClasses.has(key))
    .map(([key, def]) => ({ key, name: def.name }))
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.missing-classes-box {
  text-align: center;
  margin-bottom: $space-6;
}

.box-label {
  font-size: 0.75em;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: $color-text-subtle;
  margin: 0 0 $space-4;
}

.class-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: $space-2;
  margin-bottom: $space-4;
}

.class-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: $space-2 $space-3;
  border-radius: $radius-md;
  background: color-mix(in srgb, currentColor 15%, transparent);
  cursor: default;
}

.signup-link {
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: $accent-color;
  text-decoration: none;
  transition: color $duration-fast $ease-default;

  &:hover {
    text-decoration: underline;
    color: $accent-color-hover;
  }
}
</style>
