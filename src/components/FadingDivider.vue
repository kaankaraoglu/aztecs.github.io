<template>
  <hr class="fading-divider" />
</template>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;
@use '@/assets/styles/tokens' as *;

.fading-divider {
  border: none;
  height: 1px;
  margin: $space-8 0;
  background: linear-gradient(to right, transparent, $accent-color, transparent);
  opacity: 0.4;
  box-shadow: 0 0 12px rgba($accent-color, 0.15);
}
</style>
