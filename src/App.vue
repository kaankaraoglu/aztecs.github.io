<template>
  <div class="noise-overlay" aria-hidden="true" />
  <EmberParticles />
  <Progress :model-value="loadProgress" class="top-progress" />

  <HeaderView />

  <main>
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <FooterView />
</template>

<script setup>
import { onMounted, ref } from 'vue'
import FooterView from '@/components/FooterView.vue'
import HeaderView from '@/components/HeaderView.vue'
import EmberParticles from '@/components/EmberParticles.vue'
import { Progress } from '@/components/ui/progress'

/**
 * Top-of-page page-load progress bar. Starts at 0, jumps to ~30 right away
 * (so the user sees motion), then eases to 100 when the document is ready.
 * Once complete it stays parked at 100 — the bar remains in place as a
 * thin decorative line rather than disappearing.
 */
const loadProgress = ref(0)

onMounted(() => {
  // Ramp the bar up in a few steps so users see a loading progression
  // even on fast connections. Once filled, the bar stays at 100 — it
  // doubles as a decorative top border when the page is idle.
  requestAnimationFrame(() => {
    loadProgress.value = 35
  })
  setTimeout(() => {
    loadProgress.value = 72
  }, 180)
  const finalize = () => {
    loadProgress.value = 100
  }
  if (document.readyState === 'complete') {
    setTimeout(finalize, 420)
  } else {
    window.addEventListener('load', () => setTimeout(finalize, 220), { once: true })
    // Safety fallback if the load event is ever missed (cached SPA nav).
    setTimeout(finalize, 1400)
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/tokens' as *;

.noise-overlay {
  position: fixed;
  inset: 0;
  opacity: 0.03;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
}

/* Page-load progress bar, pinned to the very top of the viewport. Once it
   finishes (filled at 100) it stays visible as a thin line so it reads
   as both a loader during boot and a decorative top border afterward. */
.top-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 4px;
  z-index: 40;
  border-radius: 0;

  // Override shadcn's default bg-primary/20 track — we want a subtle
  // background tinted with the accent color, and a solid accent-colored
  // fill that matches the site's theming in both light and dark.
  :deep([data-slot='progress']),
  &[data-slot='progress'] {
    background: rgba(var(--t-accent-rgb), 0.18);
  }

  :deep([data-slot='progress-indicator']) {
    background: $accent-color;
    transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1);
  }
}
</style>

<style lang="scss">
@use '@/assets/styles/variables' as *;
@use '@/assets/styles/tokens' as *;

html {
  color: $color-text-primary;
  background-color: $surface-0;
  font-family: 'Cal Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  body {
    margin: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    overflow-x: hidden;

    #app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    main {
      flex: 1;
      position: relative;
      z-index: 1;
    }
  }
}

.content-wrapper {
  max-width: 100rem;
  margin: 0 auto;
  padding: 0 $space-8 $space-10;
  width: 100%;
  box-sizing: border-box;

  @include tablet {
    padding: 0 $space-6 $space-8;
  }

  @include mobile {
    padding: 0 $space-4 $space-8;
  }
}

.page-enter-active {
  transition:
    opacity $duration-normal $ease-out,
    transform $duration-normal $ease-out;
}
.page-leave-active {
  transition: opacity $duration-fast $ease-default;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.page-leave-to {
  opacity: 0;
}

@include reduced-motion {
  .page-enter-active,
  .page-leave-active {
    transition: none;
  }
}

.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity $duration-slow $ease-out,
    transform $duration-slow $ease-out;

  &.revealed {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal-stagger > .reveal {
  @for $i from 1 through 8 {
    &:nth-child(#{$i}) {
      transition-delay: #{($i - 1) * 100}ms;
    }
  }
}

@include reduced-motion {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

:focus-visible {
  outline: 2px solid $accent-color;
  outline-offset: 3px;
  border-radius: $radius-sm;
}

:focus:not(:focus-visible) {
  outline: none;
}
</style>
