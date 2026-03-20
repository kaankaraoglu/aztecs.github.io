<template>
  <svg
    class="role-icon"
    :class="role"
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    :aria-label="role"
  >
    <!-- Tank: shield shape (WoW dungeon finder style) -->
    <template v-if="role === 'tank'">
      <path d="M8 1L2 4v4c0 3.3 2.6 5.6 6 7 3.4-1.4 6-3.7 6-7V4L8 1z" fill="currentColor" />
    </template>

    <!-- Healer: plus/cross (WoW dungeon finder style) -->
    <template v-if="role === 'healer'">
      <path d="M6 1h4v5h5v4h-5v5H6v-5H1V6h5V1z" fill="currentColor" />
    </template>

    <!-- DPS: sword (WoW dungeon finder style) -->
    <template v-if="role === 'dps'">
      <path
        d="M13.5 1L6 8.5 4.5 7 1 10.5 2.5 12l-1 2.5L4 13.5l1.5-1L7 14l3.5-3.5L9 9l7.5-7.5L15 1h-1.5z"
        fill="currentColor"
      />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  role: {
    type: String,
    required: true,
    validator: (v) => ['tank', 'healer', 'dps'].includes(v),
  },
})
</script>

<style scoped>
.role-icon {
  width: 0.85em;
  height: 0.85em;
  vertical-align: -0.1em;
  flex-shrink: 0;
}

.role-icon.tank {
  color: #6a9cdb;
}

.role-icon.healer {
  color: #4ec44e;
}

.role-icon.dps {
  color: #c74545;
}
</style>
