import { createApp } from "vue";
import App from "./App.vue";

import { createRouter, createMemoryHistory } from "vue-router";

import HomeView from "./components/HomeView.vue";
import ContactView from "./components/ContactView.vue";
import WowView from "./components/WowView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/contact", component: ContactView },
  { path: "/wow", component: WowView },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

createApp(App).use(router).mount("#app");
