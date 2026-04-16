<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="open"
        ref="overlayRef"
        class="lightbox-overlay"
        role="dialog"
        aria-modal="true"
        :aria-label="alt || 'Image lightbox'"
        @click.self="$emit('close')"
      >
        <button class="lightbox-close" @click="$emit('close')" aria-label="Close lightbox">
          &times;
        </button>
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
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  src: { type: String, required: true },
  alt: { type: String, default: '' },
})

const emit = defineEmits(['close'])

const imageError = ref(false)
const overlayRef = ref(null)

/** @type {HTMLElement | null} */
let previouslyFocused = null

/** Selector for all focusable elements within the dialog. */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * Returns all focusable elements inside the overlay.
 * @returns {HTMLElement[]}
 */
function getFocusableElements() {
  if (!overlayRef.value) return []
  return Array.from(overlayRef.value.querySelectorAll(FOCUSABLE_SELECTORS))
}

/**
 * Trap Tab / Shift+Tab focus within the dialog and handle Escape.
 * @param {KeyboardEvent} e
 */
function onKeydown(e) {
  if (e.key === 'Escape' && props.open) {
    emit('close')
    return
  }

  if (e.key === 'Tab' && props.open) {
    const focusable = getFocusableElements()
    if (focusable.length === 0) {
      e.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}

watch(
  () => props.src,
  () => {
    imageError.value = false
  },
)

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      previouslyFocused = /** @type {HTMLElement} */ (document.activeElement)
      await nextTick()
      const focusable = getFocusableElements()
      if (focusable.length > 0) {
        focusable[0].focus()
      }
    } else {
      document.body.style.overflow = ''
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus()
      }
      previouslyFocused = null
    }
  },
)

window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  // Ensure scroll is restored if component is destroyed while open
  document.body.style.overflow = ''
})
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
