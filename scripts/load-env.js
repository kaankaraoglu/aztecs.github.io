/**
 * Lightweight .env file loader for build scripts.
 *
 * Reads `.env` and `.env.local` from the project root (in that order)
 * and injects any variables that are not already set in `process.env`.
 * Later files win when the same key appears in both.
 *
 * Follows the same priority Vite uses:
 *   shell env > .env.local > .env
 *
 * No external dependencies required.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Parse a single .env file into a key-value map.
 * Supports `KEY=VALUE`, optional quoting, and `#` comments.
 * @param {string} filePath
 * @returns {Record<string, string>}
 */
function parseEnvFile(filePath) {
  /** @type {Record<string, string>} */
  const vars = {}

  let content
  try {
    content = readFileSync(filePath, 'utf-8')
  } catch {
    return vars // file doesn't exist — not an error
  }

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue

    const key = trimmed.slice(0, eqIndex).trim()
    let value = trimmed.slice(eqIndex + 1).trim()

    // Strip surrounding quotes (single or double)
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    vars[key] = value
  }

  return vars
}

/**
 * Load `.env` and `.env.local` into `process.env`.
 * Existing env vars (set in shell / CI) are never overwritten.
 */
export function loadEnv() {
  // .env first, then .env.local overrides it — matching Vite's order
  const base = parseEnvFile(join(PROJECT_ROOT, '.env'))
  const local = parseEnvFile(join(PROJECT_ROOT, '.env.local'))

  const merged = { ...base, ...local }
  let loaded = 0

  for (const [key, value] of Object.entries(merged)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
      loaded++
    }
  }

  if (loaded > 0) {
    console.log(`[env] Loaded ${loaded} variable(s) from .env files`)
  }
}
