<script setup>
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  noHover: { type: Boolean, default: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
})

const classes = computed(() => cn('info-box', !props.noHover && 'info-box--hoverable', props.class))
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.info-box {
  position: relative;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
  box-shadow: var(--glass-shadow);
  padding: 1.5rem;
  box-sizing: border-box;
  transition:
    background $duration-normal $ease-default,
    border-color $duration-normal $ease-default,
    box-shadow $duration-normal $ease-default,
    transform $duration-normal $ease-default;

  @include mobile {
    padding: $space-4;
    border-radius: $radius-lg;
  }
}

.info-box--hoverable:hover {
  background: var(--glass-bg-strong);
  border-color: var(--glass-border-strong);
  transform: translateY(-1px);
}
</style>
