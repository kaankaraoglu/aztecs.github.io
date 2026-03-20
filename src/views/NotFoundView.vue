<template>
  <div class="not-found-view content-wrapper">
    <h1>Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <RouterLink to="/" class="home-link">Go Home</RouterLink>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/_variables.scss' as *;

.not-found-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;

  h1 {
    font-size: 3em;
    color: $accent-color;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.2em;
    margin-bottom: 2rem;
  }

  .home-link {
    color: $color-yellow;
    font-weight: 700;
    font-size: 1.2em;
    text-decoration: none;
    padding: 0.5rem 1.5rem;
    border: 1px solid $accent-color;
    border-radius: 8px;
    transition:
      background 0.2s ease,
      color 0.2s ease;

    &:hover {
      background: rgba($color-yellow, 0.1);
      color: $accent-color-hover;
    }
  }
}
</style>
