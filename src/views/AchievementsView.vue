<template>
  <div class="achievements-view content-wrapper">
    <KillCardView
      v-for="(kill, idx) in kills"
      :key="kill.raidName + '-' + idx"
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

<script>
import KillCardView from '@/views/KillCardView.vue'
import { kills } from '@/data/kills.js'
export default {
  name: 'AchievementsView',
  components: { KillCardView },
  data() {
    return { kills }
  },
}
</script>

<style scoped lang="scss">
.achievements-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
</style>
