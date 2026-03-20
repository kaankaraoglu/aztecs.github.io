<template>
  <!-- Deprecated: use <AchievementsView> via /achievements route. Keeping for backward compatibility. -->
  <AchievementsView />
</template>

<script>
import AchievementsView from '@/views/AchievementsView.vue'

export default {
  name: 'WowKillsView',
  components: {
    AchievementsView,
  },
}
</script>
