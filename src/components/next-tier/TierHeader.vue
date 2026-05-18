<template>
  <div class="tier-header">
    <h1 class="tier-title">{{ tierName }}</h1>
    <div class="tier-meta">
      <Badge :variant="isOpen ? 'success' : 'danger'" class="status-badge">
        {{ isOpen ? 'Signups Open' : 'Signups Closed' }}
      </Badge>
      <span class="signup-count">{{ signupCount }} signed up</span>
    </div>
  </div>
</template>

<script setup>
import { Badge } from '@/components/ui/badge'

defineProps({
  tierName: { type: String, required: true },
  isOpen: { type: Boolean, required: true },
  signupCount: { type: Number, required: true },
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.tier-header {
  text-align: center;
  margin-bottom: $space-8;
}

.tier-title {
  font-size: 2rem;
  font-weight: 800;
  color: $color-text-primary;
  margin: 0 0 $space-3 0;

  @include mobile {
    font-size: 1.5rem;
  }
}

.tier-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-2;

  .status-badge {
    font-size: 1rem;
    padding: $space-2 $space-4;
  }
}

.signup-count {
  font-size: 0.875rem;
  color: $color-text-subtle;
}
</style>
