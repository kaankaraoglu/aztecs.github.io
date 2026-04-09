/**
 * Build-time script that fetches fun raid stats from Warcraft Logs.
 * Writes to src/data/wcl-stats.json with:
 * - Most Deaths: player with the highest total deaths across all reports
 * - Iron Raider: player who attended the most kills without ever dying
 * - Highest Damage Done: highest single-report damage total by any one player
 * - Highest Damage Done in M+: highest single-encounter damage total by any one player in M+
 *
 * Requires WCL_CLIENT_ID and WCL_CLIENT_SECRET env vars.
 * Usage: node scripts/fetch-wcl-stats.js
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { loadEnv } from './load-env.js'
import {
  GUILD_ID,
  CURRENT_ZONE_ID,
  CURRENT_MPLUS_ZONE_ID,
  CLASS_MAP,
  getToken,
  graphql,
} from './wcl-api.js'

loadEnv()

const LOG_PREFIX = '[wcl-stats]'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'wcl-stats.json')

const EMPTY_OUTPUT = {
  zone: null,
  stats: {
    mostDeaths: null,
    ironRaider: null,
    highestDamageDone: null,
    highestDamageDoneMplus: null,
    bestHealer: null,
  },
}

/**
 * Fetches deaths table for specific boss fights in a report.
 * @param {string} token
 * @param {string} code
 * @param {number[]} fightIDs - only boss encounter fight IDs
 * Returns array of death event entries.
 */
async function fetchDeaths(token, code, fightIDs) {
  if (fightIDs.length === 0) return []

  const query = `{
    reportData {
      report(code: "${code}") {
        table(dataType: Deaths, fightIDs: [${fightIDs.join(',')}])
      }
    }
  }`

  const result = await graphql(token, query, { logPrefix: LOG_PREFIX })
  const raw = result.data?.reportData?.report?.table
  if (!raw) return []

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  return parsed?.data?.entries || []
}

/**
 * Fetches damage done table for specific boss fights in a report.
 * @param {string} token
 * @param {string} code
 * @param {number[]} fightIDs - only boss encounter fight IDs
 * Returns array of { name, type, total } entries.
 */
async function fetchDamageDone(token, code, fightIDs) {
  if (fightIDs.length === 0) return []

  const query = `{
    reportData {
      report(code: "${code}") {
        table(dataType: DamageDone, fightIDs: [${fightIDs.join(',')}])
      }
    }
  }`

  const result = await graphql(token, query, { logPrefix: LOG_PREFIX })
  const raw = result.data?.reportData?.report?.table
  if (!raw) return []

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  return parsed?.data?.entries || []
}

/**
 * Fetches healing done table for specific boss fights in a report.
 * @param {string} token
 * @param {string} code
 * @param {number[]} fightIDs - only boss encounter fight IDs
 * @returns {Promise<Array<{ name: string, type: string, total: number }>>}
 */
async function fetchHealingDone(token, code, fightIDs) {
  if (fightIDs.length === 0) return []

  const query = `{
    reportData {
      report(code: "${code}") {
        table(dataType: Healing, fightIDs: [${fightIDs.join(',')}])
      }
    }
  }`

  const result = await graphql(token, query, { logPrefix: LOG_PREFIX })
  const raw = result.data?.reportData?.report?.table
  if (!raw) return []

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  return parsed?.data?.entries || []
}

/**
 * Fetches playerDetails for a specific fight to collect participant names and classes.
 * @param {string} token
 * @param {string} code
 * @param {number} fightId
 * @returns {Promise<Map<string, {type: string, spec: string}>>} Map of player name → class/spec info
 */
async function fetchFightParticipants(token, code, fightId) {
  const query = `{
    reportData {
      report(code: "${code}") {
        playerDetails(fightIDs: [${fightId}])
      }
    }
  }`

  const result = await graphql(token, query, { logPrefix: LOG_PREFIX })
  const raw = result.data?.reportData?.report?.playerDetails
  if (!raw) return new Map()

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  const pd = parsed?.data?.playerDetails
  if (!pd) return new Map()

  /** @type {Map<string, {type: string, spec: string}>} */
  const players = new Map()
  for (const role of ['tanks', 'healers', 'dps']) {
    for (const player of pd[role] || []) {
      const spec = player.specs?.[0]?.spec || ''
      players.set(player.name, { type: player.type || '', spec })
    }
  }
  return players
}

/**
 * Fetches M+ reports and finds the highest single-encounter damage done.
 * @param {string} token
 * @returns {Promise<{ name: string, type: string, total: number, reportCode: string, bossName: string } | null>}
 */
async function fetchMplusHighestDamage(token) {
  const reportsQuery = `{
    reportData {
      reports(guildID: ${GUILD_ID}, zoneID: ${CURRENT_MPLUS_ZONE_ID}, limit: 50) {
        data {
          code
          fights {
            id
            name
            encounterID
          }
        }
      }
    }
  }`

  const reportsResult = await graphql(token, reportsQuery, { logPrefix: LOG_PREFIX })
  const reports = reportsResult.data?.reportData?.reports?.data || []

  /** @type {{ name: string, type: string, total: number, reportCode: string, bossName: string } | null} */
  let highest = null

  const BATCH_SIZE = 2

  for (let i = 0; i < reports.length; i += BATCH_SIZE) {
    const batch = reports.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (report) => {
        const code = report.code
        const bossFights = (report.fights || []).filter((f) => f.encounterID > 0)

        for (const fight of bossFights) {
          const entries = await fetchDamageDone(token, code, [fight.id])

          for (const entry of entries) {
            const total = entry.total ?? entry.amount ?? 0
            if (!entry.name || total === 0) continue
            if (!highest || total > highest.total) {
              highest = {
                name: entry.name,
                type: entry.type || '',
                total,
                reportCode: code,
                bossName: fight.name,
              }
            }
          }
        }
      }),
    )
  }

  return highest
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

  const reportsResult = await graphql(token, reportsQuery, { logPrefix: LOG_PREFIX })
  const zoneName = reportsResult.data?.worldData?.zone?.name || null
  const reports = reportsResult.data?.reportData?.reports?.data || []

  // Accumulators
  /** @type {Map<string, { type: string, total: number }>} */
  const deathsByName = new Map()

  /** @type {Map<string, { type: string, count: number }>} */
  const killAttendanceByName = new Map()

  /** @type {{ name: string, type: string, total: number, reportCode: string, bossName: string } | null} */
  let highestDamageDoneEntry = null

  /** @type {{ name: string, type: string, total: number, reportCode: string, bossName: string } | null} */
  let bestHealerEntry = null

  const BATCH_SIZE = 2

  for (let i = 0; i < reports.length; i += BATCH_SIZE) {
    const batch = reports.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (report) => {
        const code = report.code
        const bossFights = (report.fights || []).filter((f) => f.encounterID > 0)
        const bossFightIDs = bossFights.map((f) => f.id)
        const killFights = bossFights.filter((f) => f.kill === true)

        // Fetch deaths for all boss fights (Most Deaths + Iron Raider)
        const allDeathEntries = await fetchDeaths(token, code, bossFightIDs)

        // Accumulate deaths across all boss attempts
        for (const entry of allDeathEntries) {
          if (!entry.name) continue
          const existing = deathsByName.get(entry.name)
          if (existing) {
            existing.total++
          } else {
            deathsByName.set(entry.name, { type: entry.type || '', total: 1 })
          }
        }

        // Track highest damage done and best healer — query per individual boss fight
        // so we get highest single-fight values, not summed across all fights
        for (const fight of bossFights) {
          const [fightDamage, fightHealing] = await Promise.all([
            fetchDamageDone(token, code, [fight.id]),
            fetchHealingDone(token, code, [fight.id]),
          ])

          for (const entry of fightDamage) {
            const total = entry.total ?? entry.amount ?? 0
            if (!entry.name || total === 0) continue
            if (!highestDamageDoneEntry || total > highestDamageDoneEntry.total) {
              highestDamageDoneEntry = {
                name: entry.name,
                type: entry.type || '',
                total,
                reportCode: code,
                bossName: fight.name,
              }
            }
          }

          for (const entry of fightHealing) {
            const total = entry.total ?? entry.amount ?? 0
            if (!entry.name || total === 0) continue
            if (!bestHealerEntry || total > bestHealerEntry.total) {
              bestHealerEntry = {
                name: entry.name,
                type: entry.type || '',
                total,
                reportCode: code,
                bossName: fight.name,
              }
            }
          }
        }

        // Fetch participants for each kill fight (Iron Raider tracking)
        for (const fight of killFights) {
          const participants = await fetchFightParticipants(token, code, fight.id)
          for (const [name, { type: classType, spec }] of participants) {
            const existing = killAttendanceByName.get(name)
            if (existing) {
              existing.count++
            } else {
              killAttendanceByName.set(name, { type: classType, spec, count: 1 })
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
  // Fewest deaths among regular raiders (≥60% of max attendance), excluding Holy Priests
  let maxAttendance = 0
  for (const { count } of killAttendanceByName.values()) {
    if (count > maxAttendance) maxAttendance = count
  }
  const minKillsForIron = Math.ceil(maxAttendance * 0.6)
  let ironRaider = null
  let ironRaiderDeaths = Infinity
  for (const [name, { type, spec, count }] of killAttendanceByName) {
    if (type === 'Priest' && spec === 'Holy') continue
    if (count < minKillsForIron) continue
    const deaths = deathsByName.get(name)?.total ?? 0
    if (
      deaths < ironRaiderDeaths ||
      (deaths === ironRaiderDeaths && count > (ironRaider?.killsAttended ?? 0))
    ) {
      ironRaiderDeaths = deaths
      ironRaider = {
        name,
        class: CLASS_MAP[type] || type.toLowerCase() || null,
        killsAttended: count,
      }
    }
  }

  // --- Highest Damage Done ---
  let highestDamageDone = null
  if (highestDamageDoneEntry) {
    highestDamageDone = {
      name: highestDamageDoneEntry.name,
      class:
        CLASS_MAP[highestDamageDoneEntry.type] || highestDamageDoneEntry.type.toLowerCase() || null,
      amount: highestDamageDoneEntry.total,
      boss: highestDamageDoneEntry.bossName || null,
      report: `https://www.warcraftlogs.com/reports/${highestDamageDoneEntry.reportCode}`,
    }
  }

  // --- Best Healer ---
  let bestHealer = null
  if (bestHealerEntry) {
    bestHealer = {
      name: bestHealerEntry.name,
      class: CLASS_MAP[bestHealerEntry.type] || bestHealerEntry.type.toLowerCase() || null,
      amount: bestHealerEntry.total,
      boss: bestHealerEntry.bossName || null,
      report: `https://www.warcraftlogs.com/reports/${bestHealerEntry.reportCode}`,
    }
  }

  // --- Highest Damage Done in M+ ---
  const mplusEntry = await fetchMplusHighestDamage(token)
  let highestDamageDoneMplus = null
  if (mplusEntry) {
    highestDamageDoneMplus = {
      name: mplusEntry.name,
      class: CLASS_MAP[mplusEntry.type] || mplusEntry.type.toLowerCase() || null,
      amount: mplusEntry.total,
      boss: mplusEntry.bossName || null,
      report: `https://www.warcraftlogs.com/reports/${mplusEntry.reportCode}`,
    }
  }

  return {
    zone: zoneName,
    stats: {
      mostDeaths,
      ironRaider,
      highestDamageDone,
      highestDamageDoneMplus,
      bestHealer,
    },
  }
}

async function main() {
  const token = await getToken(LOG_PREFIX)
  if (!token) {
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
    console.log(`${LOG_PREFIX} Wrote empty stats (no credentials)`)
    return
  }

  try {
    const data = await fetchStats(token)
    writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(
      `${LOG_PREFIX} Wrote stats: mostDeaths=${data.stats.mostDeaths?.name ?? 'none'}, ` +
        `ironRaider=${data.stats.ironRaider?.name ?? 'none'}, ` +
        `highestDamageDone=${data.stats.highestDamageDone?.name ?? 'none'}, ` +
        `highestDamageDoneMplus=${data.stats.highestDamageDoneMplus?.name ?? 'none'}, ` +
        `bestHealer=${data.stats.bestHealer?.name ?? 'none'}`,
    )
  } catch (err) {
    console.warn(`${LOG_PREFIX} Failed to fetch stats: ${err.message}`)
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
  }
}

main()
