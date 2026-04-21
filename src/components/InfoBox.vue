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
.info-box {
  position: relative;
  border-radius: 20px;
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  -webkit-backdrop-filter: blur(var(--glass-blur)) saturate(1.1);
  box-shadow: var(--glass-shadow);
  padding: 1.5rem;
  box-sizing: border-box;
  transition:
    background 250ms ease,
    border-color 250ms ease,
    box-shadow 250ms ease,
    transform 250ms ease;

  @media (max-width: 600px) {
    padding: 1rem;
    border-radius: 16px;
  }
}

.info-box--hoverable:hover {
  background: var(--glass-bg-strong);
  border-color: var(--glass-border-strong);
  transform: translateY(-1px);
}
</style>
