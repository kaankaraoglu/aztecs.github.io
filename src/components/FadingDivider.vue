<template>
  <hr class="fading-divider" />
</template>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.fading-divider {
  border: none;
  height: 1px;
  margin: 1.75rem 0;
  background: linear-gradient(to right, transparent, $accent-color, transparent);
  opacity: 0.4;
}
</style>
