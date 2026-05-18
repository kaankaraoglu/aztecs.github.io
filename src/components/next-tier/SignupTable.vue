<template>
  <Card class="signup-table-card">
    <CardContent class="p-6">
      <h2 class="section-title">All Signups ({{ submissions.length }})</h2>
      <Table v-if="submissions.length > 0" class="signup-table">
        <TableHeader>
          <TableRow>
            <TableHead class="col-char">Character</TableHead>
            <TableHead class="col-class">Class</TableHead>
            <TableHead class="col-spec">Spec</TableHead>
            <TableHead class="col-role hide-mobile">Role</TableHead>
            <TableHead class="col-discord hide-mobile">Discord</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="sub in submissions" :key="sub.discordId">
            <TableCell class="col-char">
              <span :class="toCssClass(sub.className)" class="char-name">{{
                sub.characterName
              }}</span>
            </TableCell>
            <TableCell class="col-class">
              <span :class="toCssClass(sub.className)">{{ getClassName(sub.className) }}</span>
            </TableCell>
            <TableCell class="col-spec">{{ getSpecName(sub.className, sub.specName) }}</TableCell>
            <TableCell class="col-role hide-mobile">{{
              getRoleName(sub.className, sub.specName)
            }}</TableCell>
            <TableCell class="col-discord hide-mobile discord-col">{{
              sub.discordUsername
            }}</TableCell>
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

.col-char {
  width: 22%;
}

.col-class {
  width: 18%;
}

.col-spec {
  width: 20%;
}

.col-role {
  width: 12%;
}

.col-discord {
  width: 28%;
}

@include mobile {
  .col-char {
    width: 34%;
  }

  .col-class {
    width: 33%;
  }

  .col-spec {
    width: 33%;
  }

  .hide-mobile {
    display: none;
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
