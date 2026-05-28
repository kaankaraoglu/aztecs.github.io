<template>
  <InfoBox no-hover class="flex-mythic-readiness">
    <div class="header-row">
      <div class="title-block">
        <h2 class="section-title">Flex Mythic Readiness</h2>
      </div>
      <Badge :variant="isReady ? 'success' : 'danger'" class="status-badge">
        {{ isReady ? 'Ready' : `Need ${needed} more` }}
      </Badge>
    </div>

    <div class="progress-track">
      <div class="progress-fill" :class="{ ready: isReady }" :style="{ width: progressPct }" />
      <div class="progress-threshold" :style="{ left: thresholdPct }" />
    </div>

    <div class="progress-labels">
      <span class="label-current">
        <span class="count" :class="isReady ? 'text-ready' : 'text-short'">{{ signupCount }}</span>
        signed up
      </span>
      <span class="label-min">{{ MIN_PLAYERS }} min</span>
    </div>
  </InfoBox>
</template>

<script setup>
import { computed } from 'vue'
import InfoBox from '@/components/InfoBox.vue'
import { Badge } from '@/components/ui/badge'

const MIN_PLAYERS = 15
const MAX_DISPLAY = 25

const props = defineProps({
  signupCount: { type: Number, required: true },
})

const isReady = computed(() => props.signupCount >= MIN_PLAYERS)
const needed = computed(() => Math.max(0, MIN_PLAYERS - props.signupCount))
const progressPct = computed(() => {
  const pct = Math.min((props.signupCount / MAX_DISPLAY) * 100, 100)
  return `${pct}%`
})
const thresholdPct = computed(() => `${(MIN_PLAYERS / MAX_DISPLAY) * 100}%`)
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $space-4;
  margin-bottom: $space-4;

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
  }
}

.title-block {
  flex: 1;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: $color-text-subtle;
  margin: 0;
}

.status-badge {
  font-size: 0.875rem;
  padding: $space-2 $space-4;
  white-space: nowrap;
  flex-shrink: 0;
}

.progress-track {
  position: relative;
  height: 8px;
  background: var(--t-surface-raised);
  border-radius: 9999px;
  overflow: visible;
  margin-bottom: $space-2;
}

.progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: #f54545;
  transition: width 0.5s ease;

  &.ready {
    background: #50c878;
  }
}

.progress-threshold {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 14px;
  background: $color-text-subtle;
  border-radius: 1px;
  transform: translateX(-50%);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: $color-text-subtle;
}

.label-current {
  display: flex;
  align-items: baseline;
  gap: $space-1;
}

.count {
  font-size: 1rem;
  font-weight: 700;

  &.text-ready {
    color: #50c878;
  }

  &.text-short {
    color: #f54545;
  }
}
</style>
