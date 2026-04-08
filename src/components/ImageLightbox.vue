<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="open" class="lightbox-overlay" @click.self="$emit('close')">
        <button class="lightbox-close" @click="$emit('close')" aria-label="Close">&times;</button>
        <div v-if="imageError" class="lightbox-error">
          <span class="lightbox-error-icon">&#x26A0;</span>
          <p>Image failed to load</p>
        </div>
        <img v-else :src="src" :alt="alt" class="lightbox-image" @error="imageError = true" />
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  src: { type: String, required: true },
  alt: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const imageError = ref(false)

watch(
  () => props.src,
  () => {
    imageError.value = false
  },
)

function onKeydown(e) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.lightbox-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
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
  color: rgba(255, 255, 255, 0.6);
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
  position: absolute;
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

  &:hover {
    opacity: 1;
  }
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity $duration-normal $ease-default;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}
</style>
