/**
 * Shared Warcraft Logs API utilities used by all WCL build-time scripts.
 *
 * Provides OAuth2 token retrieval, GraphQL client with retry logic,
 * report table/playerDetails helpers, WoW class name mapping, and common
 * guild/API constants.
 */

const GUILD_ID = 18606
// Season 1: VS / DR / MQD (46) + Sporefall (50). Season 2: The Venomous Abyss (53) +
// The Tidebound Grotto (57).
//
// WCL lists a second zone also named "The Venomous Abyss" at id 54; guild reports
// land in 53, so 54 returns nothing. Confirm an id against a real report's
// /zone/rankings/<id> link before adding it here, not against the zone's name.
const CURRENT_ZONE_IDS = [46, 50, 53, 57]
const CURRENT_MPLUS_ZONE_ID = 47 // Midnight Season 1 M+
const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token'
const API_URL = 'https://www.warcraftlogs.com/api/v2/client'

/** Default timeout for individual fetch requests (30 seconds). */
const REQUEST_TIMEOUT_MS = 30_000

/**
 * Upper bound on a single retry sleep. WCL meters points over a rolling hour,
 * so a `Retry-After` can be several minutes — long enough to park the fetcher
 * past the next cron tick. Cap it and let the retries run out into the
 * caller's writeFallback path instead.
 */
const MAX_RETRY_DELAY_MS = 30_000

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
 * Converts a WCL realm name into the slug Blizzard's armory uses in character
 * URLs.
 *
 * WCL reports a multi-word realm with the space already gone
 * ("TwistingNether"), so splitting on whitespace alone yielded
 * `/character/eu/twistingnether/...`, which the armory 404s. Split on the
 * camel-case seam as well. That seam is a lowercase letter directly followed by
 * an uppercase one, so "Al'Akir" is left alone and still slugs to `alakir`
 * rather than `al-akir`.
 * @param {string} server - Realm name as WCL reports it
 * @returns {string} Armory realm slug
 */
function toRealmSlug(server) {
  return server
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/'/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

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
    // URLSearchParams percent-encodes the credentials; a secret containing
    // '&' or '+' would otherwise corrupt the body.
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!res.ok) {
    console.warn(`${logPrefix} Token request failed: ${res.status}`)
    return null
  }

  const token = (await res.json()).access_token
  if (!token) {
    console.warn(`${logPrefix} Token response contained no access_token`)
    return null
  }
  return token
}

/**
 * Sends a GraphQL query to the Warcraft Logs API, retrying on 5xx and on 429
 * rate limits. Honours `Retry-After` when present, capped at MAX_RETRY_DELAY_MS.
 * @param {string} token - OAuth2 access token
 * @param {string} query - GraphQL query string
 * @param {{ retries?: number, logPrefix?: string }} [options]
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On non-retryable HTTP errors, GraphQL errors, or exhausted retries
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

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      const retryAfter = Number(res.headers.get('Retry-After'))
      const delay = Math.min(
        Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : 1000 * 2 ** (attempt - 1),
        MAX_RETRY_DELAY_MS,
      )
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

  throw new Error(`GraphQL request failed: retries exhausted after ${retries} attempts`)
}

/**
 * Unwraps a WCL report field that the API returns as a JSON-encoded string.
 * @param {unknown} raw
 * @returns {any}
 */
function parseReportField(raw) {
  if (!raw) return null
  return typeof raw === 'string' ? JSON.parse(raw) : raw
}

/**
 * Fetches one of the report `table` datasets for a set of fights.
 * @param {string} token
 * @param {string} code - report code
 * @param {number[]} fightIDs
 * @param {'Deaths' | 'DamageDone' | 'Healing'} dataType
 * @param {string} [logPrefix]
 * @returns {Promise<Array<Record<string, any>>>} table entries, or [] when unavailable
 */
async function fetchReportTable(token, code, fightIDs, dataType, logPrefix = '[wcl]') {
  if (fightIDs.length === 0) return []

  const query = `{
    reportData {
      report(code: "${code}") {
        table(dataType: ${dataType}, fightIDs: [${fightIDs.join(',')}])
      }
    }
  }`

  const result = await graphql(token, query, { logPrefix })
  const parsed = parseReportField(result.data?.reportData?.report?.table)
  return parsed?.data?.entries || []
}

/**
 * Fetches the role-grouped playerDetails payload for a set of fights.
 * @param {string} token
 * @param {string} code - report code
 * @param {number[]} fightIDs
 * @param {string} [logPrefix]
 * @returns {Promise<{ tanks?: any[], healers?: any[], dps?: any[] } | null>}
 */
async function fetchPlayerDetails(token, code, fightIDs, logPrefix = '[wcl]') {
  if (fightIDs.length === 0) return null

  const query = `{
    reportData {
      report(code: "${code}") {
        playerDetails(fightIDs: [${fightIDs.join(',')}])
      }
    }
  }`

  const result = await graphql(token, query, { logPrefix })
  const parsed = parseReportField(result.data?.reportData?.report?.playerDetails)
  return parsed?.data?.playerDetails || null
}

export {
  GUILD_ID,
  CURRENT_ZONE_IDS,
  CURRENT_MPLUS_ZONE_ID,
  CLASS_MAP,
  toRealmSlug,
  getToken,
  graphql,
  fetchReportTable,
  fetchPlayerDetails,
}
