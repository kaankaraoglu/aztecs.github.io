<script setup>
import { Skeleton } from '@/components/ui/skeleton'

defineProps({
  width: { type: String, default: '100%' },
  height: { type: String, default: '1rem' },
})
</script>

<template>
  <Skeleton class="skeleton" :style="{ width, height }">
    <div class="skeleton-shimmer" />
  </Skeleton>
</template>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.skeleton {
  background: $surface-1;
  border-radius: $radius-md;
  overflow: hidden;
  position: relative;
}

.skeleton-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent);
  animation: shimmer-skeleton 1.5s infinite;
}

@keyframes shimmer-skeleton {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@include reduced-motion {
  .skeleton-shimmer {
    animation: none;
  }
}
</style>
