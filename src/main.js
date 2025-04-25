import { createApp } from "vue";
import App from "./App.vue";

import { createRouter, createMemoryHistory } from "vue-router";

import HomeView from "./components/HomeView.vue";
import KillsView from "./components/KillsView.vue";
import ContactView from "./components/ContactView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/contact", component: ContactView },
  { path: "/kills", component: KillsView },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

createApp(App).use(router).mount("#app");
