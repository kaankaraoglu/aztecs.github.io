<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { theme } = useTheme()

const canvasRef = ref(null)
let animationId = null
let particles = []
let onVisibilityChange = null
let onResize = null
let resizeTimeout = null

const COLORS = ['#ffa203', '#ff8a05', '#f5bd25', '#fe691e']

// ~50 particles at 1920x1080; clamped so tiny phones don't feel empty
// and ultrawide displays don't choke on overdraw.
const PIXELS_PER_PARTICLE = 41472
const MIN_PARTICLES = 20
const MAX_PARTICLES = 80

function targetParticleCount(canvas) {
  const raw = Math.round((canvas.width * canvas.height) / PIXELS_PER_PARTICLE)
  return Math.max(MIN_PARTICLES, Math.min(MAX_PARTICLES, raw))
}

function createParticle(canvas) {
  return {
    x: Math.random() * canvas.width,
    y: canvas.height + Math.random() * 20,
    size: 1 + Math.random() * 2,
    speedY: 0.3 + Math.random() * 0.7,
    speedX: (Math.random() - 0.5) * 0.3,
    opacity: 0.15 + Math.random() * 0.4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  }
}

// Particles are mutated in-place intentionally — this is a performance-critical
// animation loop where allocating new objects per frame would cause GC pressure.
function draw(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  for (const p of particles) {
    ctx.globalAlpha = p.opacity
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()

    p.y -= p.speedY
    p.x += Math.sin(p.y * 0.01) * p.speedX

    if (p.y < -10) {
      Object.assign(p, createParticle(canvas))
    }
  }

  animationId = requestAnimationFrame(() => draw(canvas, ctx))
}

onMounted(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  particles = Array.from({ length: targetParticleCount(canvas) }, () => createParticle(canvas))
  for (const p of particles) {
    p.y = Math.random() * canvas.height
  }

  // The guard matters: draw() reassigns animationId unconditionally, so a
  // second start() would orphan the first loop and leave two running.
  const start = () => {
    if (!animationId) draw(canvas, ctx)
  }
  const stop = () => {
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
  }

  const shouldRun = () => theme.value === 'dark' && !document.hidden

  if (shouldRun()) start()

  onVisibilityChange = () => {
    if (shouldRun()) start()
    else stop()
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  // The light theme hides the canvas with `display: none`, but the loop knew
  // nothing about it and kept clearing and repainting a full viewport at 60 fps
  // for no visible output.
  watch(theme, () => {
    if (shouldRun()) start()
    else stop()
  })

  onResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight

      const desired = targetParticleCount(canvas)
      if (desired > particles.length) {
        for (let i = particles.length; i < desired; i++) {
          particles.push(createParticle(canvas))
        }
      } else if (desired < particles.length) {
        particles.length = desired
      }

      for (const p of particles) {
        if (p.x > canvas.width) p.x = Math.random() * canvas.width
        if (p.y > canvas.height) p.y = canvas.height
      }
    }, 150)
  }
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (onVisibilityChange) document.removeEventListener('visibilitychange', onVisibilityChange)
  if (onResize) window.removeEventListener('resize', onResize)
  clearTimeout(resizeTimeout)
})
</script>

<template>
  <canvas ref="canvasRef" class="ember-canvas" aria-hidden="true" />
</template>

<style scoped lang="scss">
.ember-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

/* Brief: light mode is black/white only — the warm ember particles would
   reintroduce brand color, so hide them when the light theme is active. */
:root[data-theme='light'] .ember-canvas {
  display: none;
}
</style>
