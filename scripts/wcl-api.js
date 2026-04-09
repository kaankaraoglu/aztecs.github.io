/* global process */
/**
 * Shared Warcraft Logs API utilities used by all WCL build-time scripts.
 *
 * Provides OAuth2 token retrieval, GraphQL client with retry logic,
 * WoW class name mapping, and common guild/API constants.
 */

const GUILD_ID = 18606
const CURRENT_ZONE_ID = 46 // VS / DR / MQD (Midnight Season 1)
const CURRENT_MPLUS_ZONE_ID = 47 // Midnight Season 1 M+
const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token'
const API_URL = 'https://www.warcraftlogs.com/api/v2/client'

/** Default timeout for individual fetch requests (30 seconds). */
const REQUEST_TIMEOUT_MS = 30_000

/**
 * Maps WCL class names to the CSS class names used for styling.
 * @type {Readonly<Record<string, string>>}
 */
const CLASS_MAP = Object.freeze({
  DeathKnight: 'death-knight',
  DemonHunter: 'demon-hunter',
  Druid: 'druid',
  Evoker: 'evoker',
  Hunter: 'hunter',
  Mage: 'mage',
  Monk: 'monk',
  Paladin: 'paladin',
  Priest: 'priest',
  Rogue: 'rogue',
  Shaman: 'shaman',
  Warlock: 'warlock',
  Warrior: 'warrior',
})

/**
 * Fetches an OAuth2 access token from Warcraft Logs.
 * Requires WCL_CLIENT_ID and WCL_CLIENT_SECRET env vars.
 * @param {string} logPrefix - Log prefix for identifying the calling script (e.g. '[wcl]')
 * @returns {Promise<string | null>} Access token, or null if credentials are missing or request fails
 */
async function getToken(logPrefix = '[wcl]') {
  const clientId = process.env.WCL_CLIENT_ID
  const clientSecret = process.env.WCL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.warn(`${logPrefix} WCL_CLIENT_ID or WCL_CLIENT_SECRET not set, skipping`)
    return null
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    console.warn(`${logPrefix} Token request failed: ${res.status}`)
    return null
  }

  return (await res.json()).access_token
}

/**
 * Sends a GraphQL query to the Warcraft Logs API with retry on 5xx errors.
 * @param {string} token - OAuth2 access token
 * @param {string} query - GraphQL query string
 * @param {{ retries?: number, logPrefix?: string }} [options]
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On non-retryable HTTP errors or GraphQL errors
 */
async function graphql(token, query, { retries = 3, logPrefix = '[wcl]' } = {}) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    if (res.status >= 500 && attempt < retries) {
      const delay = 1000 * 2 ** (attempt - 1)
      console.warn(
        `${logPrefix} GraphQL ${res.status}, retrying in ${delay}ms (${attempt}/${retries})`,
      )
      await new Promise((r) => setTimeout(r, delay))
      continue
    }

    if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`)
    const data = await res.json()
    if (data.errors?.length) throw new Error(data.errors[0].message)
    return data
  }
}

export { GUILD_ID, CURRENT_ZONE_ID, CURRENT_MPLUS_ZONE_ID, CLASS_MAP, getToken, graphql }
