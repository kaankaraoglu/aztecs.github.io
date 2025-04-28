<template>
  <div class="divider"></div>

  <HeaderView />

  <div class="nav-divider"></div>

  <main>
    <RouterView />
  </main>

  <!-- FOOTER WILL GO HERE -->
</template>

<script>
import HeaderView from "./components/HeaderView.vue";

export default {
  name: "App",
  components: {
    HeaderView,
  },
};
</script>

<style lang="scss" scoped>
.divider {
  top: 0;
  height: 5px;
  background: linear-gradient(to right, #9000ff, #ff0000);
}

.nav-divider {
  height: 2px;
  margin: 1em 0 4em 0;
  background: linear-gradient(to right, #ffa600, #ffffff);
}
</style>

<style lang="scss">
@import "@/assets/styles/_variables.scss";

html {
  color: whitesmoke;
  background-color: $background-color;
  font-family: "Cal Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;

  body {
    margin: 0;
  }
}
</style>
