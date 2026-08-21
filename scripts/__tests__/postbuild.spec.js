import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { withRouteMeta } from '../postbuild.js'
import { SITE_ROUTES, SITE_ORIGIN, DEFAULT_DESCRIPTION } from '../../src/data/site-routes.js'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
// The real file on purpose. These rewrites are regexes over the built HTML, so
// reformatting index.html could silently turn them into no-ops and hand every
// route the home page's metadata again.
const INDEX_HTML = readFileSync(join(REPO_ROOT, 'index.html'), 'utf-8')

const HOME_TITLE = "Aztecs - Horde Guild on Al'Akir"

/** The rewrite escapes for HTML, so compare on the decoded value. */
function decode(value) {
  return (
    value
      ?.replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&') ?? null
  )
}

/** @param {string} html @param {string} name */
function metaContent(html, name) {
  const attr = name.startsWith('og:') ? 'property' : 'name'
  const match = new RegExp(`<meta\\s+${attr}="${name}"\\s+content="([^"]*)"`).exec(html)
  return decode(match?.[1])
}

function tagContent(html, tag) {
  return decode(new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(html)?.[1])
}

function canonical(html) {
  return decode(/<link\s+rel="canonical"\s+href="([^"]*)"/.exec(html)?.[1])
}

const routeFiles = SITE_ROUTES.filter((r) => r.path !== '/')

describe('withRouteMeta', () => {
  it.each(routeFiles)('rewrites every head field for $path', (route) => {
    const html = withRouteMeta(INDEX_HTML, route)
    const url = `${SITE_ORIGIN}${route.path}`

    expect(tagContent(html, 'title')).toBe(route.title)
    expect(metaContent(html, 'description')).toBe(route.description)
    expect(metaContent(html, 'og:title')).toBe(route.title)
    expect(metaContent(html, 'og:description')).toBe(route.description)
    expect(metaContent(html, 'og:url')).toBe(url)
    expect(metaContent(html, 'twitter:title')).toBe(route.title)
    expect(metaContent(html, 'twitter:description')).toBe(route.description)
    expect(canonical(html)).toBe(url)
  })

  it.each(routeFiles)('leaves none of the home page metadata behind for $path', (route) => {
    const html = withRouteMeta(INDEX_HTML, route)

    expect(html).not.toContain(HOME_TITLE)
    expect(html).not.toContain(DEFAULT_DESCRIPTION)
    expect(html).not.toContain(`content="${SITE_ORIGIN}/"`)
  })

  it('keeps the parts of the head that are not per-route', () => {
    const html = withRouteMeta(INDEX_HTML, routeFiles[0])

    expect(metaContent(html, 'og:image')).toBe(`${SITE_ORIGIN}/og-image.png`)
    expect(metaContent(html, 'og:site_name')).toBe('Aztecs')
    expect(metaContent(html, 'twitter:card')).toBe('summary_large_image')
    expect(html).toContain('application/ld+json')
    expect(html).toContain('<div id="app"></div>')
  })

  it('escapes characters that would break out of an attribute', () => {
    const html = withRouteMeta(INDEX_HTML, {
      path: '/x',
      title: 'A "quoted" & <angled> title',
      description: 'plain',
    })

    // Decoded round trip, plus a raw check that nothing escaped the attribute.
    expect(tagContent(html, 'title')).toBe('A "quoted" & <angled> title')
    expect(html).toContain('A &quot;quoted&quot; &amp; &lt;angled> title')
    expect(html).not.toContain('<angled>')
  })
})
