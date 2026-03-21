<template>
  <div ref="containerRef" class="in-memoriam-view content-wrapper">
    <div class="memoriam-inner">
      <h1 class="memoriam-heading">In Loving Memory</h1>
      <FadingDivider />

      <div class="memorials-list">
        <div v-for="memorial in memorials" :key="memorial.name" class="memorial-entry reveal">
          <span class="memorial-name" :class="memorial.class">{{ memorial.name }}</span>
          <span class="memorial-server">{{ memorial.server }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { memorials } from '@/data/in-memoriam.js'
import { useScrollReveal } from '@/composables/useScrollReveal.js'
import FadingDivider from '@/components/FadingDivider.vue'

const containerRef = ref(null)
useScrollReveal(containerRef)
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.in-memoriam-view {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  padding: 2rem 2rem 4rem;
  box-sizing: border-box;

  @include mobile {
    padding: 1rem 1rem 3rem;
  }
}

.memoriam-inner {
  width: 100%;
  max-width: 780px;
  text-align: center;
}

.memoriam-heading {
  color: rgba($accent-color, 0.75);
  font-size: 2.2em;
  font-weight: 800;
  margin: 0 0 $space-4;
  letter-spacing: 0.02em;

  @include mobile {
    font-size: 1.6em;
  }
}

.memorials-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-8;
  margin-top: $space-8;
}

.memorial-entry {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-1;
  padding: $space-12 0;
}

.memorial-name {
  font-size: 1.8em;
  font-weight: 800;
  letter-spacing: 0.03em;

  @include mobile {
    font-size: 1.4em;
  }
}

.memorial-server {
  font-size: 0.95em;
  color: $color-text-subtle;
  font-weight: 500;
}

// Fade-only reveal — no transform (scoped to this view only)
.in-memoriam-view :deep(.reveal) {
  opacity: 0;
  transition: opacity 0.6s ease;
}

.in-memoriam-view :deep(.reveal.revealed) {
  opacity: 1;
}
</style>
