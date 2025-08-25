<template>
  <footer class="footer">
    <p>&copy; {{ new Date().getFullYear() }} Aztecs.</p>
  </footer>
</template>

<script>
export default {
  name: 'FooterView',
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.footer {
  width: 100%;
  color: $text-color;
  background-color: $background-color;
  text-align: center;
  padding: 5rem 0;
}
</style>
