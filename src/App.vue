<template>
  <div class="gradient-line"></div>

  <HeaderView />

  <main>
    <RouterView />
  </main>

  <FooterView />
</template>

<script>
import FooterView from '@/views/FooterView.vue'
import HeaderView from '@/views/HeaderView.vue'

export default {
  name: 'App',
  components: {
    HeaderView,
    FooterView,
  },
}
</script>

<style lang="scss" scoped>
.gradient-line {
  top: 0;
  height: 5px;
  background: linear-gradient(to right, #f54545, #fe691e, #ff8a05, #ffa203, #f5bd25);
}
</style>

<style lang="scss">
@use '@/assets/styles/_variables.scss' as *;

html {
  color: whitesmoke;
  background-color: $background-color;
  font-family: 'Cal Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  body {
    margin: 0;
    display: flex;
    flex-direction: column;
    min-height: 100vh;

    main {
      flex: 1;
    }
  }
}
</style>
