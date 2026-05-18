<template>
  <Card class="buff-coverage">
    <CardContent class="p-6">
      <h2 class="section-title">Raid Buff Coverage</h2>
      <div class="buff-grid">
        <Badge
          v-for="buff in coveredBuffs"
          :key="buff.name"
          variant="success"
          class="buff-pill"
          :title="buff.description"
        >
          <img
            :src="`https://wow.zamimg.com/images/wow/icons/small/${buff.icon}.jpg`"
            :alt="buff.name"
            class="buff-icon"
          />
          {{ buff.name }}
        </Badge>
        <Badge
          v-for="buff in missingBuffs"
          :key="buff.name"
          variant="danger"
          class="buff-pill"
          :title="buff.description"
        >
          <img
            :src="`https://wow.zamimg.com/images/wow/icons/small/${buff.icon}.jpg`"
            :alt="buff.name"
            class="buff-icon"
          />
          {{ buff.name }}
        </Badge>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

defineProps({
  coveredBuffs: { type: Array, required: true },
  missingBuffs: { type: Array, required: true },
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

.buff-grid {
  display: flex;
  flex-wrap: wrap;
  gap: $space-2;
}

.buff-pill {
  flex: 1 1 auto;
  min-width: fit-content;
  font-size: 0.8125rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  padding: $space-2 $space-3;
  cursor: default;
}

.buff-icon {
  width: 22px;
  height: 22px;
  border-radius: 3px;
  flex-shrink: 0;
}
</style>
