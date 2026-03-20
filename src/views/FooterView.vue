<template>
  <footer class="footer">
    <FadingDivider class="footer-divider" />
    <p>&copy; {{ new Date().getFullYear() }} Aztecs.</p>
  </footer>
</template>

<script>
import FadingDivider from '@/components/FadingDivider.vue'
export default {
  name: 'FooterView',
  components: { FadingDivider },
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_variables.scss' as *;

.footer {
  width: 100%;
  color: $text-color;
  background-color: $background-color;
  text-align: center;
  padding: 3rem 0 5rem;

  .footer-divider {
    max-width: 80rem;
    margin: 0 auto 2rem;
    opacity: 0.3;
  }

  p {
    margin: 0;
    font-size: 0.9em;
    opacity: 0.6;
  }
}
</style>
