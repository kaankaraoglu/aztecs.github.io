import { describe, it, expect, vi } from 'vitest'
import { SITE_ROUTES, SITE_ORIGIN, DEFAULT_DESCRIPTION } from '../site-routes.js'

vi.mock('vue-router', async (importOriginal) => {
  const mod = await importOriginal()
  return {
    ...mod,
    createWebHistory: () => mod.createMemoryHistory('/'),
  }
})

const { default: router } = await import('@/router/index.js')

const routes = router.options.routes
const publicRoutes = routes.filter((r) => !r.redirect && !r.path.includes(':pathMatch'))

describe('site routes data', () => {
  it('is a non-empty frozen array', () => {
    expect(Array.isArray(SITE_ROUTES)).toBe(true)
    expect(SITE_ROUTES.length).toBeGreaterThan(0)
    expect(Object.isFrozen(SITE_ROUTES)).toBe(true)
  })

  it('exposes an origin with no trailing slash', () => {
    expect(SITE_ORIGIN).toBe('https://aztecs.se')
    expect(SITE_ORIGIN.endsWith('/')).toBe(false)
  })

  it('paths are unique and root-relative', () => {
    const paths = SITE_ROUTES.map((r) => r.path)
    expect(new Set(paths).size).toBe(paths.length)
    for (const path of paths) {
      expect(path.startsWith('/')).toBe(true)
    }
  })

  it('every route has a non-empty title', () => {
    for (const route of SITE_ROUTES) {
      expect(typeof route.title).toBe('string')
      expect(route.title.trim().length).toBeGreaterThan(0)
    }
  })

  it('every description is non-empty and under 160 characters', () => {
    for (const route of SITE_ROUTES) {
      expect(route.description.trim().length).toBeGreaterThan(0)
      expect(route.description.length).toBeLessThan(160)
    }
  })

  it('every priority parses as a number between 0 and 1', () => {
    for (const route of SITE_ROUTES) {
      const priority = Number(route.priority)
      expect(Number.isNaN(priority)).toBe(false)
      expect(priority).toBeGreaterThanOrEqual(0)
      expect(priority).toBeLessThanOrEqual(1)
    }
  })

  it('the home route carries the default description', () => {
    const home = SITE_ROUTES.find((r) => r.path === '/')
    expect(home?.description).toBe(DEFAULT_DESCRIPTION)
  })
})

describe('site routes — router agreement', () => {
  it.each(SITE_ROUTES.map((r) => [r.path, r]))(
    '%s exists in the router with the same title and description',
    (path, route) => {
      const match = routes.find((r) => r.path === path)
      expect(match).toBeDefined()
      expect(match.meta.title).toBe(route.title)
      expect(match.meta.description).toBe(route.description)
    },
  )

  it('every public router route has a sitemap entry', () => {
    const listed = new Set(SITE_ROUTES.map((r) => r.path))
    const missing = publicRoutes.map((r) => r.path).filter((path) => !listed.has(path))
    expect(missing).toEqual([])
  })

  it('redirects and the catch-all stay out of the list', () => {
    const paths = SITE_ROUTES.map((r) => r.path)
    expect(paths).not.toContain('/wow-kills')
    expect(paths.some((path) => path.includes(':'))).toBe(false)
  })
})
