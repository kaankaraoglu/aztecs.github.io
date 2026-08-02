/**
 * Shared fallback writer for the build-time data fetch scripts.
 *
 * The fetched JSON files are committed to the repo, so an existing file
 * normally holds real data. Overwriting it with empty output whenever a fetch
 * fails is destructive twice over: locally it wipes committed data when
 * credentials are absent, and in CI `fetch-data.yml` commits the blanked file
 * and deploys it, so an upstream outage empties the live site.
 *
 * Keeping the previous file turns a failed fetch into a no-op — the site keeps
 * serving the last good data until the next successful run.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { basename } from 'node:path'

/**
 * Returns true when the path holds parseable JSON worth keeping.
 * A corrupt or truncated file is treated as absent so it gets repaired.
 * @param {string} outputPath
 * @returns {boolean}
 */
function hasUsableData(outputPath) {
  if (!existsSync(outputPath)) return false

  try {
    JSON.parse(readFileSync(outputPath, 'utf-8'))
    return true
  } catch {
    return false
  }
}

/**
 * Writes `emptyOutput` only when there is no previous data to preserve.
 * @param {string} outputPath - Absolute path to the data JSON file
 * @param {unknown} emptyOutput - Empty shape to write when no data exists yet
 * @param {string} logPrefix - Log prefix of the calling script (e.g. '[wcl]')
 * @param {string} reason - Why the fetch produced no data (e.g. 'no credentials')
 * @returns {void}
 */
export function writeFallback(outputPath, emptyOutput, logPrefix, reason) {
  const name = basename(outputPath)

  if (hasUsableData(outputPath)) {
    console.warn(`${logPrefix} ${reason}, keeping existing ${name}`)
    return
  }

  writeFileSync(outputPath, JSON.stringify(emptyOutput, null, 2) + '\n')
  console.log(`${logPrefix} ${reason}, wrote empty ${name}`)
}
