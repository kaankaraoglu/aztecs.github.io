<script setup>
import { ref, watch, computed } from 'vue'
import { useScrollLock } from '@vueuse/core'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'

const props = defineProps({
  open: { type: Boolean, required: true },
  src: { type: String, required: true },
  alt: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const imageError = ref(false)
const scrollLocked = useScrollLock(document.body)

const isOpen = computed({
  get: () => props.open,
  set: (v) => {
    if (!v) emit('close')
  },
})

watch(
  () => props.open,
  (open) => {
    scrollLocked.value = open
  },
)

watch(
  () => props.src,
  () => {
    imageError.value = false
  },
)
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent
      class="lightbox-overlay !max-w-[92vw] !w-auto !p-0 !bg-transparent !border-0 !shadow-none !gap-0 !rounded-none"
      :show-close-button="false"
      @click.self="emit('close')"
    >
      <DialogTitle class="sr-only">{{ alt || 'Image lightbox' }}</DialogTitle>
      <DialogDescription class="sr-only">Expanded image view</DialogDescription>
      <button
        type="button"
        class="lightbox-close"
        aria-label="Close lightbox"
        @click="emit('close')"
      >
        &times;
      </button>
      <div v-if="imageError" class="lightbox-error">
        <span class="lightbox-error-icon">&#x26A0;</span>
        <p>Image failed to load</p>
      </div>
      <img v-else :src="src" :alt="alt" class="lightbox-image" @error="imageError = true" />
    </DialogContent>
  </Dialog>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

:deep(.lightbox-overlay) {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: $radius-sm;
}

.lightbox-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: rgba(var(--t-text-primary-rgb), 0.6);
  font-size: 1rem;

  p {
    margin: 0;
  }
}

.lightbox-error-icon {
  font-size: 3rem;
  line-height: 1;
}

.lightbox-close {
  position: fixed;
  top: 1rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: white;
  font-size: 2.5rem;
  cursor: pointer;
  line-height: 1;
  opacity: 0.7;
  transition: opacity $duration-fast $ease-default;
  z-index: 100;

  &:hover {
    opacity: 1;
  }
}
</style>
