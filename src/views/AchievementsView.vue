<template>
  <div class="achievements-view content-wrapper">
    <template v-for="(kill, idx) in kills" :key="kill.raidName + '-' + idx">
      <FadingDivider v-if="idx > 0" />
      <KillCard
        :raidName="kill.raidName"
        :imageUrl="kill.imageUrl"
        :date="kill.date"
        :attempts="kill.attempts"
        :tanks="kill.tanks"
        :healers="kill.healers"
        :dds="kill.dds"
      />
    </template>
  </div>
</template>

<script setup>
import KillCard from '@/components/KillCard.vue'
import FadingDivider from '@/components/FadingDivider.vue'
import { kills } from '@/data/kills.js'
</script>

<style scoped lang="scss">
.achievements-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
