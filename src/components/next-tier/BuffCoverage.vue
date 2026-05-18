<template>
  <Card class="buff-coverage">
    <CardContent class="p-6">
      <div class="buff-columns">
        <div class="buff-section">
          <h2 class="section-title">Throughput Buffs</h2>
          <div
            class="buff-list"
            :style="gridRows(throughputCovered.length + throughputMissing.length)"
          >
            <Badge
              v-for="buff in throughputCovered"
              :key="buff.name"
              variant="success"
              class="buff-pill"
              :title="buff.description"
            >
              {{ buff.name }}
              <span class="buff-meta">
                <span class="buff-class">{{ classNames(buff.classes) }}</span>
                <span class="buff-count">{{ buff.count }}</span>
              </span>
            </Badge>
            <Badge
              v-for="buff in throughputMissing"
              :key="buff.name"
              variant="danger"
              class="buff-pill"
              :title="buff.description"
            >
              {{ buff.name }}
              <span class="buff-class">{{ classNames(buff.classes) }}</span>
            </Badge>
          </div>
        </div>

        <div class="buff-section">
          <h2 class="section-title">Utility</h2>
          <div class="buff-list" :style="gridRows(utilityCovered.length + utilityMissing.length)">
            <Badge
              v-for="buff in utilityCovered"
              :key="buff.name"
              variant="success"
              class="buff-pill"
              :title="buff.description"
            >
              {{ buff.name }}
              <span class="buff-meta">
                <span class="buff-class">{{ classNames(buff.classes) }}</span>
                <span class="buff-count">{{ buff.count }}</span>
              </span>
            </Badge>
            <Badge
              v-for="buff in utilityMissing"
              :key="buff.name"
              variant="danger"
              class="buff-pill"
              :title="buff.description"
            >
              {{ buff.name }}
              <span class="buff-class">{{ classNames(buff.classes) }}</span>
            </Badge>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WOW_CLASSES } from '@/data/wow-classes.js'

const props = defineProps({
  coveredBuffs: { type: Array, required: true },
  missingBuffs: { type: Array, required: true },
})

const throughputCovered = computed(() =>
  props.coveredBuffs.filter((b) => b.category === 'throughput'),
)
const throughputMissing = computed(() =>
  props.missingBuffs.filter((b) => b.category === 'throughput'),
)
const utilityCovered = computed(() => props.coveredBuffs.filter((b) => b.category === 'utility'))
const utilityMissing = computed(() => props.missingBuffs.filter((b) => b.category === 'utility'))

function classNames(classes) {
  return classes.map((key) => WOW_CLASSES[key]?.name ?? key).join(', ')
}

function gridRows(count) {
  if (count <= 1) return {}
  return { gridTemplateRows: `repeat(${Math.ceil(count / 2)}, auto)` }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/tokens' as *;

.buff-columns {
  display: flex;
  gap: $space-8;
  align-items: flex-start;

  @include mobile {
    flex-direction: column;
    gap: $space-6;
  }
}

.buff-section {
  flex: 1;
  min-width: 0;
}

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-text-subtle;
  margin: 0 0 $space-4 0;
}

.buff-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-flow: column;
  gap: $space-2;
}

.buff-pill {
  font-size: 0.8125rem;
  display: inline-flex;
  align-items: center;
  padding: $space-2 $space-3;
  cursor: default;
  width: 100%;
}

.buff-meta {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: $space-2;
}

.buff-class {
  font-size: 0.6875rem;
  opacity: 0.7;
}

.buff-pill > .buff-class {
  margin-left: auto;
}

.buff-count {
  font-size: 0.6875rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
  min-width: 1.25rem;
  height: 1.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 $space-1;
}
</style>
