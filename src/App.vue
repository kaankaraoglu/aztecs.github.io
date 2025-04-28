<template>
  <HeaderView />

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
    HeaderView
  },
};
</script>

<style lang="scss">
@import "@/assets/styles/_variables.scss";

html {
  color: whitesmoke;
  background-color: $background-color;
  font-family: "Cal Sans", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
