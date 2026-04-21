import { onBeforeUnmount, onMounted } from 'vue'

/**
 * Attach a lerped cursor-tracking spotlight to <html>.
 *
 * Writes two CSS custom properties on the document element:
 *   --cursor-x / --cursor-y  (percentage strings, e.g. "42%")
 *
 * Stylesheets can consume them with e.g.
 *   radial-gradient(circle at var(--cursor-x) var(--cursor-y), … )
 *
 * The update loop uses requestAnimationFrame with a lerp so the spotlight
 * eases toward the cursor instead of snapping. Disabled when the user
 * has prefers-reduced-motion, or when no pointer can hover (touch only),
 * so we're not spinning a rAF loop for zero visual gain.
 */
export function useCursorSpotlight({ lerp = 0.12 } = {}) {
  if (typeof window === 'undefined') return

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches
  if (reducedMotion || !canHover) return

  const root = document.documentElement
  let rafId = null

  // Start the spotlight off-screen (top-right) so there's no sudden jump
  // to (0,0) on first paint before the user moves the mouse.
  let targetX = window.innerWidth * 0.75
  let targetY = window.innerHeight * 0.2
  let currentX = targetX
  let currentY = targetY

  function onMove(e) {
    targetX = e.clientX
    targetY = e.clientY
    if (rafId == null) rafId = requestAnimationFrame(tick)
  }

  function tick() {
    currentX += (targetX - currentX) * lerp
    currentY += (targetY - currentY) * lerp

    root.style.setProperty('--cursor-x', `${((currentX / window.innerWidth) * 100).toFixed(2)}%`)
    root.style.setProperty('--cursor-y', `${((currentY / window.innerHeight) * 100).toFixed(2)}%`)

    // Keep looping until we've effectively caught up; then idle.
    if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
      rafId = requestAnimationFrame(tick)
    } else {
      rafId = null
    }
  }

  onMounted(() => {
    // Prime the CSS vars before any movement so the spotlight is painted
    // from first render instead of popping in on first pointer event.
    root.style.setProperty('--cursor-x', '75%')
    root.style.setProperty('--cursor-y', '20%')
    window.addEventListener('pointermove', onMove, { passive: true })
  })

  onBeforeUnmount(() => {
    window.removeEventListener('pointermove', onMove)
    if (rafId != null) cancelAnimationFrame(rafId)
  })
}
