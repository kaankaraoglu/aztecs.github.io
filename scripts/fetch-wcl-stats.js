/* global process */
/**
 * Build-time script that fetches fun raid stats from Warcraft Logs.
 * Writes to src/data/wcl-stats.json with:
 * - Most Deaths: player with the highest total deaths across all reports
 * - Iron Raider: player who attended the most kills without ever dying
 * - Biggest Hit: highest single-report damage total by any one player
 *
 * Requires WCL_CLIENT_ID and WCL_CLIENT_SECRET env vars.
 * Usage: node scripts/fetch-wcl-stats.js
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const GUILD_ID = 18606
const CURRENT_ZONE_ID = 46 // VS / DR / MQD (Midnight Season 1)
const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token'
const API_URL = 'https://www.warcraftlogs.com/api/v2/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'wcl-stats.json')

const EMPTY_OUTPUT = {
  zone: null,
  stats: {
    mostDeaths: null,
    ironRaider: null,
    biggestHit: null,
  },
}

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

async function getToken() {
  const clientId = process.env.WCL_CLIENT_ID
  const clientSecret = process.env.WCL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.warn('[wcl-stats] WCL_CLIENT_ID or WCL_CLIENT_SECRET not set, skipping')
    return null
  }

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`,
  })

  if (!res.ok) {
    console.warn(`[wcl-stats] Token request failed: ${res.status}`)
    return null
  }

  return (await res.json()).access_token
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

  if (!res.ok) throw new Error(`GraphQL request failed: ${res.status}`)
  const data = await res.json()
  if (data.errors?.length) throw new Error(data.errors[0].message)
  return data
}

/**
 * Fetches deaths table for a report.
 * Returns array of { name, type, total } entries.
 */
async function fetchDeaths(token, code) {
  const query = `{
    reportData {
      report(code: "${code}") {
        table(dataType: Deaths, startTime: 0, endTime: 999999999999)
      }
    }
  }`

  const result = await graphql(token, query)
  const raw = result.data?.reportData?.report?.table
  if (!raw) return []

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  return parsed?.data?.entries || []
}

/**
 * Fetches damage done table for a report.
 * Returns array of { name, type, total } entries.
 */
async function fetchDamageDone(token, code) {
  const query = `{
    reportData {
      report(code: "${code}") {
        table(dataType: DamageDone, startTime: 0, endTime: 999999999999)
      }
    }
  }`

  const result = await graphql(token, query)
  const raw = result.data?.reportData?.report?.table
  if (!raw) return []

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  return parsed?.data?.entries || []
}

/**
 * Fetches playerDetails for a specific fight to collect participant names.
 * Returns a Set of player names.
 */
async function fetchFightParticipants(token, code, fightId) {
  const query = `{
    reportData {
      report(code: "${code}") {
        playerDetails(fightIDs: [${fightId}])
      }
    }
  }`

  const result = await graphql(token, query)
  const raw = result.data?.reportData?.report?.playerDetails
  if (!raw) return new Set()

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  const pd = parsed?.data?.playerDetails
  if (!pd) return new Set()

  const names = new Set()
  for (const role of ['tanks', 'healers', 'dps']) {
    for (const player of pd[role] || []) {
      names.add(player.name)
    }
  }
  return names
}

async function fetchStats(token) {
  // Fetch zone name and all reports with fight metadata
  const reportsQuery = `{
    worldData {
      zone(id: ${CURRENT_ZONE_ID}) {
        name
      }
    }
    reportData {
      reports(guildID: ${GUILD_ID}, zoneID: ${CURRENT_ZONE_ID}, limit: 50) {
        data {
          code
          fights {
            id
            name
            encounterID
            kill
          }
        }
      }
    }
  }`

  const reportsResult = await graphql(token, reportsQuery)
  const zoneName = reportsResult.data?.worldData?.zone?.name || null
  const reports = reportsResult.data?.reportData?.reports?.data || []

  // Accumulators
  /** @type {Map<string, { type: string, total: number }>} */
  const deathsByName = new Map()

  /** @type {Set<string>} */
  const disqualifiedFromIron = new Set()

  /** @type {Map<string, { type: string, count: number }>} */
  const killAttendanceByName = new Map()

  /** @type {{ name: string, type: string, total: number, reportCode: string } | null} */
  let biggestHitEntry = null

  const BATCH_SIZE = 3

  for (let i = 0; i < reports.length; i += BATCH_SIZE) {
    const batch = reports.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (report) => {
        const code = report.code
        const killFights = (report.fights || []).filter((f) => f.encounterID > 0 && f.kill === true)

        // Fetch deaths and damage done in parallel
        const [deathEntries, damageEntries] = await Promise.all([
          fetchDeaths(token, code),
          fetchDamageDone(token, code),
        ])

        // Accumulate deaths
        for (const entry of deathEntries) {
          if (!entry.name || entry.total == null) continue
          const existing = deathsByName.get(entry.name)
          if (existing) {
            existing.total += entry.total
          } else {
            deathsByName.set(entry.name, { type: entry.type || '', total: entry.total })
          }
          // Anyone who appears in a deaths table is disqualified from Iron Raider
          disqualifiedFromIron.add(entry.name)
        }

        // Track biggest hit (highest total damage in a single report per player)
        for (const entry of damageEntries) {
          if (!entry.name || entry.total == null) continue
          if (!biggestHitEntry || entry.total > biggestHitEntry.total) {
            biggestHitEntry = {
              name: entry.name,
              type: entry.type || '',
              total: entry.total,
              reportCode: code,
            }
          }
        }

        // Fetch participants for each kill fight (Iron Raider tracking)
        for (const fight of killFights) {
          const participants = await fetchFightParticipants(token, code, fight.id)
          for (const name of participants) {
            const existing = killAttendanceByName.get(name)
            if (existing) {
              existing.count++
            } else {
              // We don't know the class yet; will resolve later from deathsByName or damage entries
              const classType =
                damageEntries.find((e) => e.name === name)?.type ||
                deathEntries.find((e) => e.name === name)?.type ||
                ''
              killAttendanceByName.set(name, { type: classType, count: 1 })
            }
          }
        }
      }),
    )
  }

  // --- Most Deaths ---
  let mostDeaths = null
  let mostDeathsCount = 0
  for (const [name, { type, total }] of deathsByName) {
    if (total > mostDeathsCount) {
      mostDeathsCount = total
      mostDeaths = { name, class: CLASS_MAP[type] || type.toLowerCase() || null, count: total }
    }
  }

  // --- Iron Raider ---
  // Eligible: not in disqualifiedFromIron, minimum 3 kills attended
  let ironRaider = null
  let ironRaiderKills = 2 // minimum threshold - 1 so first valid candidate wins
  for (const [name, { type, count }] of killAttendanceByName) {
    if (disqualifiedFromIron.has(name)) continue
    if (count > ironRaiderKills) {
      ironRaiderKills = count
      ironRaider = {
        name,
        class: CLASS_MAP[type] || type.toLowerCase() || null,
        killsAttended: count,
      }
    }
  }

  // --- Biggest Hit ---
  let biggestHit = null
  if (biggestHitEntry) {
    biggestHit = {
      name: biggestHitEntry.name,
      class: CLASS_MAP[biggestHitEntry.type] || biggestHitEntry.type.toLowerCase() || null,
      amount: biggestHitEntry.total,
    }
  }

  return {
    zone: zoneName,
    stats: {
      mostDeaths,
      ironRaider,
      biggestHit,
    },
  }
}

async function main() {
  const token = await getToken()
  if (!token) {
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
    console.log('[wcl-stats] Wrote empty stats (no credentials)')
    return
  }

  try {
    const data = await fetchStats(token)
    writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(
      `[wcl-stats] Wrote stats: mostDeaths=${data.stats.mostDeaths?.name ?? 'none'}, ` +
        `ironRaider=${data.stats.ironRaider?.name ?? 'none'}, ` +
        `biggestHit=${data.stats.biggestHit?.name ?? 'none'}`,
    )
  } catch (err) {
    console.warn(`[wcl-stats] Failed to fetch stats: ${err.message}`)
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
  }
}

main()
