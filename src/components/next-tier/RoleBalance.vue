<template>
  <Card class="role-balance">
    <CardContent class="p-6">
      <h2 class="section-title">Role Balance</h2>
      <div class="role-grid">
        <div class="role-stat role-stat--tank">
          <span class="role-count">{{ roleCounts.tank }}</span>
          <span class="role-label">Tanks</span>
        </div>
        <div class="role-stat role-stat--healer">
          <span class="role-count">{{ roleCounts.healer }}</span>
          <span class="role-label">Healers</span>
        </div>
        <div class="role-stat role-stat--melee">
          <span class="role-count">{{ roleCounts.melee }}</span>
          <span class="role-label">Melee DPS</span>
        </div>
        <div class="role-stat role-stat--ranged">
          <span class="role-count">{{ roleCounts.ranged }}</span>
          <span class="role-label">Ranged DPS</span>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'

defineProps({
  roleCounts: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-text-subtle;
  margin: 0 0 $space-4 0;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $space-4;

  @include mobile {
    grid-template-columns: repeat(2, 1fr);
  }
}

.role-stat {
  text-align: center;
  padding: $space-4;
  background: var(--t-surface-raised);
  border-radius: $radius-md;
  border: 1px solid var(--t-border);
}

.role-count {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
}

.role-label {
  display: block;
  font-size: 0.75rem;
  color: $color-text-subtle;
  margin-top: $space-1;
}

.role-stat--tank .role-count {
  color: #4a90d9;
}

.role-stat--healer .role-count {
  color: #50c878;
}

.role-stat--melee .role-count {
  color: #cc6633;
}

.role-stat--ranged .role-count {
  color: #9b59b6;
}
</style>
