<template>
  <div class="noise-overlay" aria-hidden="true" />
  <EmberParticles />
  <div class="gradient-line"></div>

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
import FooterView from '@/components/FooterView.vue'
import HeaderView from '@/components/HeaderView.vue'
import EmberParticles from '@/components/EmberParticles.vue'
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

.gradient-line {
  background: linear-gradient(
    90deg,
    $color-red,
    $color-orange,
    $color-yellow,
    $color-light-orange,
    $color-light-yellow,
    $color-red
  );
  background-size: 200% 100%;
  height: 5px;
  animation: shimmer-gradient 8s linear infinite;
}

:root[data-theme='light'] .gradient-line {
  /* Brief: light mode uses only black/white. Replace brand gradient with
     a neutral grayscale shimmer so the top edge remains an identifying
     element without reintroducing color. */
  background: linear-gradient(90deg, #09090b, #3f3f46, #71717a, #a1a1aa, #3f3f46, #09090b);
  background-size: 200% 100%;
}

@keyframes shimmer-gradient {
  0% {
    background-position: 0% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@include reduced-motion {
  .gradient-line {
    animation: none;
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
