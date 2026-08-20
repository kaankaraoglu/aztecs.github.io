<script setup>
import { useVModel } from '@vueuse/core'
import { cn } from '@/lib/utils'

const props = defineProps({
  defaultValue: { type: [String, Number], required: false },
  modelValue: { type: [String, Number], required: false },
  class: {
    type: [Boolean, null, String, Object, Array],
    required: false,
    skipCheck: true,
  },
})

const emit = defineEmits(['update:modelValue'])

// `:value` + `@input` fires mid-composition, so IME input (and anything else
// that composes characters) fought the binding. `v-model` on the native input
// defers until composition ends.
const modelValue = useVModel(props, 'modelValue', emit, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input
    :class="
      cn(
        'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        props.class,
      )
    "
    v-model="modelValue"
  />
</template>
