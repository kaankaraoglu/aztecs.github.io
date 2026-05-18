<template>
  <Card class="signup-table-card">
    <CardContent class="p-6">
      <h2 class="section-title">All Signups ({{ submissions.length }})</h2>
      <Table v-if="submissions.length > 0" class="signup-table">
        <colgroup>
          <col style="width: 22%" />
          <col style="width: 18%" />
          <col style="width: 20%" />
          <col style="width: 12%" />
          <col style="width: 28%" />
        </colgroup>
        <TableHeader>
          <TableRow>
            <TableHead>Character</TableHead>
            <TableHead>Class</TableHead>
            <TableHead>Spec</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Discord</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="sub in submissions" :key="sub.discordId">
            <TableCell>
              <span :class="toCssClass(sub.className)" class="char-name">{{
                sub.characterName
              }}</span>
            </TableCell>
            <TableCell>
              <span :class="toCssClass(sub.className)">{{ getClassName(sub.className) }}</span>
            </TableCell>
            <TableCell>{{ getSpecName(sub.className, sub.specName) }}</TableCell>
            <TableCell>{{ getRoleName(sub.className, sub.specName) }}</TableCell>
            <TableCell class="discord-col">{{ sub.discordUsername }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p v-else class="empty-state">No signups yet. Be the first!</p>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { WOW_CLASSES } from '@/data/wow-classes.js'

defineProps({
  submissions: { type: Array, required: true },
})

function toCssClass(classKey) {
  return classKey.replace(/([A-Z])/g, '-$1').toLowerCase()
}

function getClassName(classKey) {
  return WOW_CLASSES[classKey]?.name ?? classKey
}

function getSpecName(classKey, specKey) {
  return WOW_CLASSES[classKey]?.specs[specKey]?.name ?? specKey
}

function getRoleName(classKey, specKey) {
  const role = WOW_CLASSES[classKey]?.specs[specKey]?.role ?? ''
  return role.charAt(0).toUpperCase() + role.slice(1)
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.section-title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-text-subtle;
  margin: 0 0 $space-4 0;
}

.signup-table :deep(table) {
  table-layout: fixed;
}

@include mobile {
  .signup-table :deep(th:nth-child(n + 4)),
  .signup-table :deep(td:nth-child(n + 4)) {
    display: none;
  }

  .signup-table :deep(col:nth-child(1)) {
    width: 34%;
  }
  .signup-table :deep(col:nth-child(2)) {
    width: 33%;
  }
  .signup-table :deep(col:nth-child(3)) {
    width: 33%;
  }
}

.char-name {
  font-weight: 600;
}

.discord-col {
  color: $color-text-subtle;
}

.empty-state {
  text-align: center;
  color: $color-text-subtle;
  font-size: 0.875rem;
  padding: $space-6 0;
}
</style>
