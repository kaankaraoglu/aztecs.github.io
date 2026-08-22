import { createRouter, createWebHistory } from 'vue-router'
import { SITE_ROUTES, DEFAULT_DESCRIPTION, SITE_ORIGIN } from '@/data/site-routes.js'

const VIEWS = {
  '/': () => import('@/views/HomeView.vue'),
  '/contact': () => import('@/views/ContactView.vue'),
  '/raiding': () => import('@/views/RaidingView.vue'),
  '/achievements': () => import('@/views/AchievementsView.vue'),
  '/about': () => import('@/views/AboutView.vue'),
  '/in-memoriam': () => import('@/views/InMemoriamView.vue'),
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Built from the same list the sitemap and the prerendered HTML use, so a
    // new route cannot ship with a stale sitemap or an unindexable URL.
    ...SITE_ROUTES.map(({ path, title, description }) => ({
      path,
      component: VIEWS[path],
      meta: { title, description },
    })),
    { path: '/wow-kills', redirect: '/achievements' },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFoundView.vue'),
      meta: {
        title: 'Aztecs - Page Not Found',
        description: "That page doesn't exist. Head back to the Aztecs home page.",
        noindex: true,
      },
    },
  ],
  // Without this, following a link from halfway down one page lands halfway
  // down the next. Browser back/forward still restores the saved position.
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

/**
 * @param {string} name
 * @param {string} content
 */
function setMetaTag(name, content) {
  // Only og:* uses `property`. Twitter's card spec uses `name`, and index.html
  // declares them that way — selecting on `property` appended a second, unread
  // copy of every twitter tag and left the real one frozen on the home page.
  const attr = name.startsWith('og:') ? 'property' : 'name'
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

/**
 * Adds or removes `<meta name="robots" content="noindex">`.
 * @param {boolean} noindex
 */
function setRobots(noindex) {
  const existing = document.querySelector('meta[name="robots"]')
  if (!noindex) {
    existing?.remove()
    return
  }
  if (existing) {
    existing.setAttribute('content', 'noindex')
    return
  }
  const el = document.createElement('meta')
  el.setAttribute('name', 'robots')
  el.setAttribute('content', 'noindex')
  document.head.appendChild(el)
}

router.beforeEach((to) => {
  const title = to.meta.title || 'Aztecs'
  const description = to.meta.description || DEFAULT_DESCRIPTION
  const canonicalUrl = `${SITE_ORIGIN}${to.path === '/' ? '/' : to.path}`

  document.title = title

  setRobots(to.meta.noindex === true)

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
