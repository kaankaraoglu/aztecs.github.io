/**
 * Post-build step for the GitHub Pages deploy.
 *
 * GitHub Pages serves `404.html` for any path it has no file for, and it serves
 * it with an HTTP 404 status. For a client-routed SPA that meant every route
 * except `/` answered with a 404 — the page rendered fine for humans, but
 * crawlers saw "not found" for exactly the URLs the sitemap advertises.
 *
 * Writing `dist/<route>/index.html` for each public route makes Pages serve
 * those paths as real files with a 200, while `404.html` stays behind as the
 * fallback for genuinely unknown URLs. Each copy gets that route's own title,
 * description and canonical baked in, so link unfurls and non-JS crawlers see
 * per-route metadata instead of the home page's.
 *
 * The sitemap is emitted from the same route list, so the two cannot drift.
 */

import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { SITE_ROUTES, SITE_ORIGIN } from '../src/data/site-routes.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DIST = join(__dirname, '..', 'dist')
const INDEX = join(DIST, 'index.html')

/** Date of the last commit — "when the site last changed" for an SPA where every route ships the same bundle. */
function lastModified() {
  try {
    return execFileSync('git', ['log', '-1', '--format=%cs'], { encoding: 'utf-8' }).trim()
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}

/** @param {string} value */
function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

/**
 * Rewrites the head of the built HTML for one route.
 * @param {string} html
 * @param {{ path: string, title: string, description: string }} route
 */
function withRouteMeta(html, route) {
  const title = escapeAttribute(route.title)
  const description = escapeAttribute(route.description)
  const url = `${SITE_ORIGIN}${route.path}`

  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[\s\S]*?(")/, `$1${description}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[\s\S]*?(")/, `$1${title}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/, `$1${description}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[\s\S]*?(")/, `$1${url}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[\s\S]*?(")/, `$1${title}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[\s\S]*?(")/, `$1${description}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[\s\S]*?(")/, `$1${url}$2`)
}

function writeRouteFiles(html) {
  let written = 0
  for (const route of SITE_ROUTES) {
    if (route.path === '/') continue
    const dir = join(DIST, route.path.replace(/^\//, ''))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), withRouteMeta(html, route))
    written++
  }
  return written
}

function writeSitemap(lastmod) {
  const urls = SITE_ROUTES.map(
    ({ path, priority }) =>
      `  <url>\n    <loc>${SITE_ORIGIN}${path}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`,
  ).join('\n')

  writeFileSync(
    join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  )
}

const html = readFileSync(INDEX, 'utf-8')

copyFileSync(INDEX, join(DIST, '404.html'))
const routeCount = writeRouteFiles(html)
writeSitemap(lastModified())

console.log(`[postbuild] Wrote 404.html, ${routeCount} route index files, and sitemap.xml`)
