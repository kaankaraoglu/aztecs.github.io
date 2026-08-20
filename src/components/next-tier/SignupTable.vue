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
            <TableHead v-if="isAdmin" class="col-actions"
              ><span class="sr-only">Actions</span></TableHead
            >
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="sub in submissions" :key="sub.handle ?? sub.discordId">
            <TableCell class="col-char text-left">
              <span :class="toClassColorCss(sub.className)" class="char-name">{{
                sub.characterName
              }}</span>
            </TableCell>
            <TableCell class="col-class text-left">
              <span :class="toClassColorCss(sub.className)">{{ getClassName(sub.className) }}</span>
            </TableCell>
            <TableCell class="col-spec text-left">{{
              getSpecName(sub.className, sub.specName)
            }}</TableCell>
            <TableCell class="col-role hide-mobile text-left">{{
              getRoleName(sub.className, sub.specName)
            }}</TableCell>
            <TableCell class="col-discord hide-mobile discord-col text-left">{{
              sub.discordUsername
            }}</TableCell>
            <TableCell v-if="isAdmin" class="col-actions text-right">
              <Button
                variant="destructive"
                size="sm"
                :aria-label="`Remove ${sub.characterName}`"
                @click="confirmDelete(sub)"
              >
                Remove
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <p v-else class="empty-state">No signups yet. Be the first!</p>
    </CardContent>
  </Card>
</template>

<script setup>
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { WOW_CLASSES } from '@/data/wow-classes.js'
import { toClassColorCss } from '@/lib/utils'

defineProps({
  submissions: { type: Array, required: true },
  isAdmin: { type: Boolean, default: false },
})

const emit = defineEmits(['delete'])

function confirmDelete(sub) {
  const ok = window.confirm(`Remove ${sub.characterName}'s signup? This can't be undone.`)
  if (ok) emit('delete', sub)
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

.signup-table :deep(.col-char) {
  width: 22%;
}

.signup-table :deep(.col-class) {
  width: 18%;
}

.signup-table :deep(.col-spec) {
  width: 20%;
}

.signup-table :deep(.col-role) {
  width: 12%;
}

.signup-table :deep(.col-discord) {
  width: 28%;
}

.signup-table :deep(.col-actions) {
  width: 10%;
  white-space: nowrap;
}

@include mobile {
  .signup-table :deep(.col-char) {
    width: 34%;
  }

  .signup-table :deep(.col-class) {
    width: 33%;
  }

  .signup-table :deep(.col-spec) {
    width: 33%;
  }

  .signup-table :deep(.hide-mobile) {
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
