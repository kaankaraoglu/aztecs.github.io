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

const classes = computed(() =>
  cn(
    'bg-card text-card-foreground border rounded-[20px] p-6 box-border transition-colors max-[600px]:p-4 max-[600px]:rounded-2xl',
    !props.noHover && 'hover:bg-accent/5 hover:border-accent/40',
    props.class,
  ),
)
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
