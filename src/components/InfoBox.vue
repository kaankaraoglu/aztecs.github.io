<script setup>
import { computed } from 'vue'
import { Card } from '@/components/ui/card'
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
    // Shadcn Card's defaults give us rounded border + bg-card; override gap/padding to match site spacing.
    '!gap-0 !py-0 !shadow-none p-6 transition-colors',
    !props.noHover && 'hover:bg-accent/5 hover:border-accent/40',
    props.class,
  ),
)
</script>

<template>
  <Card :class="classes">
    <slot />
  </Card>
</template>
