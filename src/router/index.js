import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('@/views/HomeView.vue')
const ContactView = () => import('@/views/ContactView.vue')
const RaidingView = () => import('@/views/RaidingView.vue')
const AchievementsView = () => import('@/views/AchievementsView.vue')
const AboutView = () => import('@/views/AboutView.vue')
const InMemoriamView = () => import('@/views/InMemoriamView.vue')
const NextTierView = () => import('@/views/NextTierView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: HomeView, meta: { title: "Aztecs - Horde Guild on Al'Akir" } },
    { path: '/contact', component: ContactView, meta: { title: 'Aztecs - Contact & Roster' } },
    { path: '/raiding', component: RaidingView, meta: { title: 'Aztecs - Raiding' } },
    {
      path: '/achievements',
      component: AchievementsView,
      meta: { title: 'Aztecs - Achievements' },
    },
    { path: '/about', component: AboutView, meta: { title: 'Aztecs - About Us' } },
    { path: '/wow-kills', redirect: '/achievements' },
    { path: '/in-memoriam', component: InMemoriamView, meta: { title: 'Aztecs - In Memoriam' } },
    { path: '/next-tier', component: NextTierView, meta: { title: 'Aztecs - Next Tier Signups' } },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  document.title = to.meta.title || 'Aztecs'
})

export default router
