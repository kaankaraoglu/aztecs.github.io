import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Adds a 3D tilt effect on mouse hover. Returns a reactive style object
 * to bind to the element. Desktop only (requires hover capability).
 * @param {import('vue').Ref<HTMLElement|null>} elementRef
 * @param {{ maxTilt?: number, scale?: number }} options
 * @returns {{ tiltStyle: import('vue').Ref<object> }}
 */
export function useTiltEffect(elementRef, { maxTilt = 8, scale = 1.02 } = {}) {
  const tiltStyle = ref({})

  const supportsHover = window.matchMedia('(hover: hover)').matches
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!supportsHover || prefersReduced) {
    return { tiltStyle }
  }

  function handleMouseMove(e) {
    const rect = elementRef.value.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5

    tiltStyle.value = {
      transform: `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) scale(${scale})`,
      willChange: 'transform',
    }
  }

  function handleMouseLeave() {
    tiltStyle.value = { willChange: 'auto' }
  }

  onMounted(() => {
    const el = elementRef.value
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)
  })

  onUnmounted(() => {
    const el = elementRef.value
    if (!el) return
    el.removeEventListener('mousemove', handleMouseMove)
    el.removeEventListener('mouseleave', handleMouseLeave)
  })

  return { tiltStyle }
}
