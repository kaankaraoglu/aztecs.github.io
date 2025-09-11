import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('@/views/HomeView.vue')
const ContactView = () => import('@/views/ContactView.vue')
const RaidingView = () => import('@/views/RaidingView.vue')
const WowKillsView = () => import('@/views/WowKillsView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView },
    { path: '/contact', component: ContactView },
    { path: '/raiding', component: RaidingView },
    { path: '/wow-kills', component: WowKillsView },
  ],
})

export default router
