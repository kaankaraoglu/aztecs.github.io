/* global process */
/**
 * Build-time script that fetches kill rosters from Warcraft Logs.
 * Writes to src/data/wcl-rosters.json, keyed by boss name.
 *
 * Requires WCL_CLIENT_ID and WCL_CLIENT_SECRET env vars.
 *
 * Usage: node scripts/fetch-wcl-rosters.js
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const GUILD_ID = 18606
const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token'
const API_URL = 'https://www.warcraftlogs.com/api/v2/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'wcl-rosters.json')

async function getToken() {
  const clientId = process.env.WCL_CLIENT_ID
  const clientSecret = process.env.WCL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.warn('[wcl] WCL_CLIENT_ID or WCL_CLIENT_SECRET not set, skipping roster fetch')
    return null
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  })

  if (!res.ok) {
    console.warn(`[wcl] Token request failed: ${res.status}`)
    return null
  }

  const data = await res.json()
  return data.access_token
}

async function graphql(token, query) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`)
  }

  return res.json()
}

/**
 * WCL subType values mapped to the CSS class names used in _variables.scss
 */
const CLASS_MAP = {
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
}

async function fetchRosters(token) {
  const query = `{
    reportData {
      reports(guildID: ${GUILD_ID}, limit: 10) {
        data {
          code
          startTime
          fights(killType: Kills) {
            name
            friendlyPlayers
          }
          masterData {
            actors(type: "Player") {
              id
              name
              subType
            }
          }
        }
      }
    }
  }`

  const result = await graphql(token, query)
  const reports = result.data?.reportData?.reports?.data || []

  // Build a map: bossName -> { players: [{ name, class }] }
  // Use the FIRST kill found per boss (most recent report first)
  /** @type {Record<string, { players: { name: string, class: string }[] }>} */
  const rosters = {}

  for (const report of reports) {
    const actorMap = new Map(
      (report.masterData?.actors || []).map((a) => [
        a.id,
        { name: a.name, class: CLASS_MAP[a.subType] || a.subType.toLowerCase() },
      ]),
    )

    for (const fight of report.fights || []) {
      if (rosters[fight.name]) continue

      const players = (fight.friendlyPlayers || [])
        .map((id) => actorMap.get(id))
        .filter(Boolean)
        .sort((a, b) => a.name.localeCompare(b.name))

      rosters[fight.name] = { players }
    }
  }

  return rosters
}

async function main() {
  const token = await getToken()
  if (!token) {
    writeFileSync(OUTPUT_PATH, '{}\n')
    console.log('[wcl] Wrote empty rosters (no credentials)')
    return
  }

  try {
    const rosters = await fetchRosters(token)
    const bossCount = Object.keys(rosters).length
    const playerCount = Object.values(rosters).reduce((sum, r) => sum + r.players.length, 0)

    writeFileSync(OUTPUT_PATH, JSON.stringify(rosters, null, 2) + '\n')
    console.log(`[wcl] Wrote rosters for ${bossCount} bosses (${playerCount} total players)`)
  } catch (err) {
    console.warn(`[wcl] Failed to fetch rosters: ${err.message}`)
    writeFileSync(OUTPUT_PATH, '{}\n')
  }
}

main()
