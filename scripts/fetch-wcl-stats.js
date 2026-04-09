/**
 * Build-time script that fetches fun raid stats from Warcraft Logs.
 * Writes to src/data/wcl-stats.json with:
 * - Most Deaths: player with the highest total deaths across all reports
 * - Iron Raider: player who attended the most kills without ever dying
 * - Highest Damage Done in Raid: highest single-fight damage total by any one player in raid
 * - Highest Damage Done in M+: highest single-encounter damage total by any one player in M+
 * - Best Healer in Raid: highest single-fight healing total by any one player in raid
 * - Best Healer in M+: highest single-encounter healing total by any one player in M+
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
    bestHealerMplus: null,
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

async function fetchStats(token) {
  // Fetch zone info (name + encounter IDs) for both raid and M+ zones,
  // plus all reports for each zone, in a single GraphQL call.
  const reportsQuery = `{
    worldData {
      raidZone: zone(id: ${CURRENT_ZONE_ID}) {
        name
        encounters { id }
      }
      mplusZone: zone(id: ${CURRENT_MPLUS_ZONE_ID}) {
        encounters { id }
      }
    }
    reportData {
      raidReports: reports(guildID: ${GUILD_ID}, zoneID: ${CURRENT_ZONE_ID}, limit: 50) {
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
      mplusReports: reports(guildID: ${GUILD_ID}, zoneID: ${CURRENT_MPLUS_ZONE_ID}, limit: 50) {
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
  const zoneName = reportsResult.data?.worldData?.raidZone?.name || null

  // Build encounter ID sets for filtering fights in mixed reports
  /** @type {Set<number>} */
  const raidEncounterIDs = new Set(
    (reportsResult.data?.worldData?.raidZone?.encounters || []).map((e) => e.id),
  )
  /** @type {Set<number>} */
  const mplusEncounterIDs = new Set(
    (reportsResult.data?.worldData?.mplusZone?.encounters || []).map((e) => e.id),
  )

  const raidReports = reportsResult.data?.reportData?.raidReports?.data || []
  const mplusReports = reportsResult.data?.reportData?.mplusReports?.data || []

  // ── Raid accumulators ──
  /** @type {Map<string, { type: string, total: number }>} */
  const deathsByName = new Map()

  /** @type {Map<string, { type: string, count: number }>} */
  const killAttendanceByName = new Map()

  /** @type {{ name: string, type: string, total: number, reportCode: string, bossName: string } | null} */
  let highestDamageDoneEntry = null

  /** @type {{ name: string, type: string, total: number, reportCode: string, bossName: string } | null} */
  let bestHealerEntry = null

  // ── M+ accumulators ──
  /** @type {{ name: string, type: string, total: number, reportCode: string, bossName: string } | null} */
  let highestDamageDoneMplusEntry = null

  /** @type {{ name: string, type: string, total: number, reportCode: string, bossName: string } | null} */
  let bestHealerMplusEntry = null

  const BATCH_SIZE = 2

  // ── Process raid reports ──
  for (let i = 0; i < raidReports.length; i += BATCH_SIZE) {
    const batch = raidReports.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (report) => {
        const code = report.code
        // Filter to only fights that belong to the raid zone
        const bossFights = (report.fights || []).filter(
          (f) => f.encounterID > 0 && raidEncounterIDs.has(f.encounterID),
        )
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

  // ── Process M+ reports ──
  for (let i = 0; i < mplusReports.length; i += BATCH_SIZE) {
    const batch = mplusReports.slice(i, i + BATCH_SIZE)

    await Promise.all(
      batch.map(async (report) => {
        const code = report.code
        // Filter to only fights that belong to the M+ zone
        const bossFights = (report.fights || []).filter(
          (f) => f.encounterID > 0 && mplusEncounterIDs.has(f.encounterID),
        )

        for (const fight of bossFights) {
          const [fightDamage, fightHealing] = await Promise.all([
            fetchDamageDone(token, code, [fight.id]),
            fetchHealingDone(token, code, [fight.id]),
          ])

          for (const entry of fightDamage) {
            const total = entry.total ?? entry.amount ?? 0
            if (!entry.name || total === 0) continue
            if (!highestDamageDoneMplusEntry || total > highestDamageDoneMplusEntry.total) {
              highestDamageDoneMplusEntry = {
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
            if (!bestHealerMplusEntry || total > bestHealerMplusEntry.total) {
              bestHealerMplusEntry = {
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
  let highestDamageDoneMplus = null
  if (highestDamageDoneMplusEntry) {
    highestDamageDoneMplus = {
      name: highestDamageDoneMplusEntry.name,
      class:
        CLASS_MAP[highestDamageDoneMplusEntry.type] ||
        highestDamageDoneMplusEntry.type.toLowerCase() ||
        null,
      amount: highestDamageDoneMplusEntry.total,
      boss: highestDamageDoneMplusEntry.bossName || null,
      report: `https://www.warcraftlogs.com/reports/${highestDamageDoneMplusEntry.reportCode}`,
    }
  }

  // --- Best Healer in M+ ---
  let bestHealerMplus = null
  if (bestHealerMplusEntry) {
    bestHealerMplus = {
      name: bestHealerMplusEntry.name,
      class:
        CLASS_MAP[bestHealerMplusEntry.type] || bestHealerMplusEntry.type.toLowerCase() || null,
      amount: bestHealerMplusEntry.total,
      boss: bestHealerMplusEntry.bossName || null,
      report: `https://www.warcraftlogs.com/reports/${bestHealerMplusEntry.reportCode}`,
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
      bestHealerMplus,
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
        `bestHealer=${data.stats.bestHealer?.name ?? 'none'}, ` +
        `bestHealerMplus=${data.stats.bestHealerMplus?.name ?? 'none'}`,
    )
  } catch (err) {
    console.warn(`${LOG_PREFIX} Failed to fetch stats: ${err.message}`)
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
  }
}

main()
