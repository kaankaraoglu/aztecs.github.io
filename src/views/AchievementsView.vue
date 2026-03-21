<template>
  <div ref="containerRef" class="achievements-view content-wrapper reveal-stagger">
    <KillCard
      v-for="(kill, idx) in kills"
      :key="kill.raidName + '-' + idx"
      class="reveal"
      :raidName="kill.raidName"
      :imageUrl="kill.imageUrl"
      :date="kill.date"
      :attempts="kill.attempts"
      :tanks="kill.tanks"
      :healers="kill.healers"
      :dds="kill.dds"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import KillCard from '@/components/KillCard.vue'
import { kills } from '@/data/kills.js'
import { useScrollReveal } from '@/composables/useScrollReveal.js'

const containerRef = ref(null)
useScrollReveal(containerRef)
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.achievements-view {
  position: relative;
  z-index: 10;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(500px, 100%), 1fr));
  gap: $space-6;
  overflow: hidden;

  @include tablet {
    grid-template-columns: 1fr;
  }
}
</style>
