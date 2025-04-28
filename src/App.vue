<template>
  <div class="top-line"></div>

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
    HeaderView,
  },
};
</script>

<style lang="scss" scoped>
@import "@/assets/styles/_variables.scss";

.top-line {
  top: 0;
  height: 5px;
  background: linear-gradient(to right, #F54545, #FE691E, #FF8A05, #FFA203, #F5BD25);  
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
