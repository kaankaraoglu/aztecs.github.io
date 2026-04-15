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

  it('defines exactly 8 routes', () => {
    expect(routes).toHaveLength(8)
  })

  it.each([
    ['/', "Aztecs - Horde Guild on Al'Akir"],
    ['/contact', 'Aztecs - Contact & Roster'],
    ['/raiding', 'Aztecs - Raiding'],
    ['/achievements', 'Aztecs - Achievements'],
    ['/about', 'Aztecs - About Us'],
    ['/in-memoriam', 'Aztecs - In Memoriam'],
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
  it.each(['/', '/contact', '/raiding', '/achievements', '/about', '/in-memoriam'])(
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
  ])('navigating to %s sets document.title to "%s"', async (path, expectedTitle) => {
    await router.push(path)
    await router.isReady()
    expect(document.title).toBe(expectedTitle)
  })

  it('unknown route sets document.title to "Aztecs"', async () => {
    await router.push('/some/unknown/path')
    await router.isReady()
    expect(document.title).toBe('Aztecs')
  })

  it('/wow-kills redirect resolves document.title to achievements title', async () => {
    await router.push('/wow-kills')
    await router.isReady()
    expect(document.title).toBe('Aztecs - Achievements')
  })
})
