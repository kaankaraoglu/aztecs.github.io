import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('vue-router', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    createWebHistory: () => mod.createMemoryHistory('/'),
  }
})

const { default: router } = await import('@/router/index.js')

const routes = router.options.routes

describe('Router — route definitions', () => {
  const findRoute = (path) => routes.find((r) => r.path === path)

  it('defines exactly 9 routes', () => {
    expect(routes).toHaveLength(9)
  })

  it.each([
    ['/', "Aztecs - Horde Guild on Al'Akir"],
    ['/contact', 'Aztecs - Contact & Roster'],
    ['/raiding', 'Aztecs - Raiding'],
    ['/achievements', 'Aztecs - Achievements'],
    ['/about', 'Aztecs - About Us'],
    ['/in-memoriam', 'Aztecs - In Memoriam'],
    ['/next-tier', 'Aztecs - Next Tier Signups'],
  ])('%s has correct meta title', (path, expectedTitle) => {
    expect(findRoute(path)?.meta?.title).toBe(expectedTitle)
  })

  it('/wow-kills redirects to /achievements', () => {
    expect(findRoute('/wow-kills')?.redirect).toBe('/achievements')
  })

  it('catch-all route has name NotFound', () => {
    const catchAll = routes.find((r) => r.name === 'NotFound')
    expect(catchAll).toBeDefined()
    expect(catchAll.path).toBe('/:pathMatch(.*)*')
  })
})

describe('Router — lazy-loading', () => {
  it.each(['/', '/contact', '/raiding', '/achievements', '/about', '/in-memoriam', '/next-tier'])(
    '%s component is a lazy factory function',
    (path) => {
      const route = routes.find((r) => r.path === path)
      expect(typeof route?.component).toBe('function')
    },
  )

  it('NotFound component is a lazy factory function', () => {
    const catchAll = routes.find((r) => r.name === 'NotFound')
    expect(typeof catchAll?.component).toBe('function')
  })

  it('lazy factories return a Promise when called', () => {
    const route = routes.find((r) => r.path === '/')
    const result = route.component()
    expect(result).toBeInstanceOf(Promise)
  })
})

describe('Router — navigation guard', () => {
  beforeEach(async () => {
    // Reset to a non-existent path (catch-all) so every named route test triggers real navigation
    await router.push('/__reset__')
    await router.isReady()
    document.title = ''
  })

  it.each([
    ['/', "Aztecs - Horde Guild on Al'Akir"],
    ['/contact', 'Aztecs - Contact & Roster'],
    ['/raiding', 'Aztecs - Raiding'],
    ['/achievements', 'Aztecs - Achievements'],
    ['/about', 'Aztecs - About Us'],
    ['/in-memoriam', 'Aztecs - In Memoriam'],
    ['/next-tier', 'Aztecs - Next Tier Signups'],
  ])('navigating to %s sets document.title to "%s"', async (path, expectedTitle) => {
    await router.push(path)
    await router.isReady()
    expect(document.title).toBe(expectedTitle)
  })

  it('unknown route sets document.title to "Aztecs"', async () => {
    await router.push('/some/unknown/path')
    await router.isReady()
    expect(document.title).toBe('Aztecs - Page Not Found')
  })

  it('/wow-kills redirect resolves document.title to achievements title', async () => {
    await router.push('/wow-kills')
    await router.isReady()
    expect(document.title).toBe('Aztecs - Achievements')
  })
})

describe('Router — head metadata', () => {
  const metaContent = (selector) => document.querySelector(selector)?.getAttribute('content')

  beforeEach(async () => {
    document.head.innerHTML = ''
    await router.push('/__reset__')
    await router.isReady()
  })

  it('navigating to /about writes that route description and Open Graph tags', async () => {
    await router.push('/about')

    const description = "Learn about Aztecs, a Horde guild on Al'Akir (EU) raiding since 2005."
    expect(metaContent('meta[name="description"]')).toBe(description)
    expect(metaContent('meta[property="og:title"]')).toBe('Aztecs - About Us')
    expect(metaContent('meta[property="og:description"]')).toBe(description)
    expect(metaContent('meta[property="og:url"]')).toBe('https://aztecs.se/about')
  })

  it('navigating to /about writes the twitter tags', async () => {
    await router.push('/about')

    expect(metaContent('meta[name="twitter:title"]')).toBe('Aztecs - About Us')
    expect(metaContent('meta[name="twitter:description"]')).toBe(
      "Learn about Aztecs, a Horde guild on Al'Akir (EU) raiding since 2005.",
    )
  })

  it('twitter tags use `name`, never `property`, and are never duplicated', async () => {
    await router.push('/about')
    await router.push('/raiding')

    expect(document.querySelectorAll('meta[name="twitter:title"]')).toHaveLength(1)
    expect(document.querySelectorAll('meta[name="twitter:description"]')).toHaveLength(1)
    expect(document.querySelectorAll('meta[property="twitter:title"]')).toHaveLength(0)
    expect(document.querySelectorAll('meta[property="twitter:description"]')).toHaveLength(0)
    expect(metaContent('meta[name="twitter:title"]')).toBe('Aztecs - Raiding')
  })

  it('og:url uses a bare slash on the home route', async () => {
    await router.push('/')
    expect(metaContent('meta[property="og:url"]')).toBe('https://aztecs.se/')
  })

  it('canonical link tracks the route and stays a single element', async () => {
    await router.push('/contact')
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://aztecs.se/contact',
    )

    await router.push('/next-tier')
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://aztecs.se/next-tier',
    )
  })

  it('the catch-all route adds a noindex robots tag', async () => {
    await router.push('/no/such/page')
    expect(metaContent('meta[name="robots"]')).toBe('noindex')
  })

  it('navigating from the catch-all back to a real route removes the robots tag', async () => {
    await router.push('/no/such/page')
    expect(document.querySelectorAll('meta[name="robots"]')).toHaveLength(1)

    await router.push('/achievements')
    expect(document.querySelector('meta[name="robots"]')).toBeNull()
  })

  it('/wow-kills redirects to /achievements and takes its metadata', async () => {
    await router.push('/wow-kills')

    expect(router.currentRoute.value.path).toBe('/achievements')
    expect(metaContent('meta[property="og:url"]')).toBe('https://aztecs.se/achievements')
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://aztecs.se/achievements',
    )
  })
})
