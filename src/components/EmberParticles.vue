<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let particles = []
let onVisibilityChange = null
let onResize = null
let resizeTimeout = null

const PARTICLE_COUNT = 50
const COLORS = ['#ffa203', '#ff8a05', '#f5bd25', '#fe691e']

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

  particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(canvas))
  for (const p of particles) {
    p.y = Math.random() * canvas.height
  }

  draw(canvas, ctx)

  onVisibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId)
      animationId = null
    } else {
      draw(canvas, ctx)
    }
  }
  document.addEventListener('visibilitychange', onVisibilityChange)

  onResize = () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
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
