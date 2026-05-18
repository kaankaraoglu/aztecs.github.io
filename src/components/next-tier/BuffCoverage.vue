<template>
  <Card class="buff-coverage">
    <CardContent class="p-6">
      <h2 class="section-title">Raid Buff Coverage</h2>
      <div class="buff-grid">
        <Badge v-for="buff in coveredBuffs" :key="buff.name" variant="success" class="buff-pill">
          <img
            :src="`https://wow.zamimg.com/images/wow/icons/small/${buff.icon}.jpg`"
            :alt="buff.name"
            class="buff-icon"
          />
          {{ buff.name }}
        </Badge>
        <Badge v-for="buff in missingBuffs" :key="buff.name" variant="danger" class="buff-pill">
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
  font-size: 0.8125rem;
  display: inline-flex;
  align-items: center;
  gap: $space-1;
}

.buff-icon {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  flex-shrink: 0;
}
</style>
