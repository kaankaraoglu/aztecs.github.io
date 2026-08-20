/**
 * Vitest global setup — ensures build-time-generated JSON files exist
 * so Vite's import-analysis plugin doesn't reject imports in composables.
 *
 * The real data is fetched by scripts/fetch-*.js during `prebuild`.
 * In CI (test job) these files don't exist, so we write minimal stubs.
 */
import { existsSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const dataDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data')

const stubs = [
  [
    'wcl-progression.json',
    { zone: '', raids: [], summary: { total: 0, normal: 0, heroic: 0, mythic: 0 } },
  ],
  [
    'wcl-stats.json',
    {
      zone: '',
      stats: {
        mostDeaths: null,
        highestDamageDone: null,
        highestDamageDoneMplus: null,
        bestHealer: null,
        bestHealerMplus: null,
      },
    },
  ],
  ['rio-mythicplus.json', { season: '', topRunners: [], dungeonBests: [] }],
]

for (const [filename, data] of stubs) {
  const filePath = resolve(dataDir, filename)
  if (!existsSync(filePath)) {
    writeFileSync(filePath, JSON.stringify(data, null, 2))
  }
}

// jsdom has no layout, so the router's scrollBehavior floods the run with
// "Not implemented: Window's scrollTo()". Stub it out.
if (typeof window !== 'undefined') {
  window.scrollTo = () => {}
}
