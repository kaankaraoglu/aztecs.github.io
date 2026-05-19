import { createRouter, createWebHistory } from 'vue-router'

const HomeView = () => import('@/views/HomeView.vue')
const ContactView = () => import('@/views/ContactView.vue')
const RaidingView = () => import('@/views/RaidingView.vue')
const AchievementsView = () => import('@/views/AchievementsView.vue')
const AboutView = () => import('@/views/AboutView.vue')
const InMemoriamView = () => import('@/views/InMemoriamView.vue')
const NextTierView = () => import('@/views/NextTierView.vue')

const DEFAULT_DESCRIPTION =
  "Aztecs - an established Horde guild on Al'Akir since 2005. Raiding, Mythic+, and good times."

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: HomeView,
      meta: {
        title: "Aztecs - Horde Guild on Al'Akir",
        description: DEFAULT_DESCRIPTION,
      },
    },
    {
      path: '/contact',
      component: ContactView,
      meta: {
        title: 'Aztecs - Contact & Roster',
        description:
          "Get in touch with Aztecs or browse our current roster. Horde guild on Al'Akir (EU).",
      },
    },
    {
      path: '/raiding',
      component: RaidingView,
      meta: {
        title: 'Aztecs - Raiding',
        description:
          "Live raid progression, boss kills, and Mythic+ rankings for Aztecs on Al'Akir (EU).",
      },
    },
    {
      path: '/achievements',
      component: AchievementsView,
      meta: {
        title: 'Aztecs - Achievements',
        description:
          'Our proudest raid achievements, boss kills, and guild milestones throughout the years.',
      },
    },
    {
      path: '/about',
      component: AboutView,
      meta: {
        title: 'Aztecs - About Us',
        description: "Learn about Aztecs, a Horde guild on Al'Akir (EU) raiding since 2005.",
      },
    },
    { path: '/wow-kills', redirect: '/achievements' },
    {
      path: '/in-memoriam',
      component: InMemoriamView,
      meta: {
        title: 'Aztecs - In Memoriam',
        description: "Remembering the friends and guildmates we've lost along the way.",
      },
    },
    {
      path: '/next-tier',
      component: NextTierView,
      meta: {
        title: 'Aztecs - Next Tier Signups',
        description: "Sign up for the next raid tier with Aztecs on Al'Akir (EU).",
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

/**
 * @param {string} name
 * @param {string} content
 */
function setMetaTag(name, content) {
  const attr = name.startsWith('og:') || name.startsWith('twitter:') ? 'property' : 'name'
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (el) {
    el.setAttribute('content', content)
  } else {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    el.setAttribute('content', content)
    document.head.appendChild(el)
  }
}

router.beforeEach((to) => {
  const title = to.meta.title || 'Aztecs'
  const description = to.meta.description || DEFAULT_DESCRIPTION
  const canonicalUrl = `https://aztecs.se${to.path === '/' ? '/' : to.path}`

  document.title = title

  setMetaTag('description', description)

  setMetaTag('og:title', title)
  setMetaTag('og:description', description)
  setMetaTag('og:url', canonicalUrl)

  setMetaTag('twitter:title', title)
  setMetaTag('twitter:description', description)

  let canonical = document.querySelector('link[rel="canonical"]')
  if (canonical) {
    canonical.setAttribute('href', canonicalUrl)
  } else {
    canonical = document.createElement('link')
    canonical.setAttribute('rel', 'canonical')
    canonical.setAttribute('href', canonicalUrl)
    document.head.appendChild(canonical)
  }
})

export default router
