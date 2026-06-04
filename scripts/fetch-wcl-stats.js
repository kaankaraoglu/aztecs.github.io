/**
 * Build-time script that fetches fun raid stats from Warcraft Logs.
 * Writes to src/data/wcl-stats.json with:
 * - Most Deaths: player with the highest total deaths across all reports
 * - Highest Damage Done in One Raid Encounter: highest single-fight damage total by any one player in raid
 * - Highest Damage Done in M+: highest single-encounter damage total by any one player in M+
 * - Highest Healing Done in One Raid Encounter: highest single-fight healing total by any one player in raid
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

const IS_CI = !!process.env.CI
const REPORT_LIMIT = IS_CI ? 50 : 10
const LOCAL_MEMBER_LIMIT = 20

const LOG_PREFIX = '[wcl-stats]'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'wcl-stats.json')

const RIO_GUILD_URL =
  'https://raider.io/api/v1/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=members'

/**
 * Fetches the current Aztecs guild roster from Raider.IO.
 * Returns a Set of character names that are in the guild.
 * @returns {Promise<Set<string>>}
 */
async function fetchGuildRoster() {
  try {
    const res = await fetch(RIO_GUILD_URL, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    const members = data.members || []
    let memberNames = members.map((m) => m.character.name)
    if (!IS_CI && memberNames.length > LOCAL_MEMBER_LIMIT) {
      console.log(
        `${LOG_PREFIX} Local mode: limiting roster to ${LOCAL_MEMBER_LIMIT} of ${memberNames.length} members`,
      )
      memberNames = memberNames.slice(0, LOCAL_MEMBER_LIMIT)
    }
    const names = new Set(memberNames)
    console.log(`${LOG_PREFIX} Fetched guild roster: ${names.size} members from Raider.IO`)
    return names
  } catch (err) {
    console.warn(`${LOG_PREFIX} Failed to fetch guild roster: ${err.message}`)
    // Return empty set — if roster fetch fails, skip guild filtering
    // (better to show potentially non-guild members than show nothing)
    return new Set()
  }
}

const EMPTY_OUTPUT = {
  zone: null,
  stats: {
    mostDeaths: null,
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
 * Fetches tank names across given fights in a report (via playerDetails).
 * @param {string} token
 * @param {string} code
 * @param {number[]} fightIDs
 * @returns {Promise<Set<string>>}
 */
async function fetchTankNames(token, code, fightIDs) {
  if (fightIDs.length === 0) return new Set()

  const query = `{
    reportData {
      report(code: "${code}") {
        playerDetails(fightIDs: [${fightIDs.join(',')}])
      }
    }
  }`

  const result = await graphql(token, query, { logPrefix: LOG_PREFIX })
  const raw = result.data?.reportData?.report?.playerDetails
  if (!raw) return new Set()

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  const tanks = parsed?.data?.playerDetails?.tanks || []
  return new Set(tanks.map((t) => t.name).filter(Boolean))
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
 * @param {string} token
 * @param {Set<string>} guildMembers - set of guild member names for filtering
 */
async function fetchStats(token, guildMembers) {
  const filterByGuild = guildMembers.size > 0
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
      raidReports: reports(guildID: ${GUILD_ID}, zoneID: ${CURRENT_ZONE_ID}, limit: ${REPORT_LIMIT}) {
        data {
          code
          fights {
            id
            name
            encounterID
          }
        }
      }
      mplusReports: reports(guildID: ${GUILD_ID}, zoneID: ${CURRENT_MPLUS_ZONE_ID}, limit: ${REPORT_LIMIT}) {
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
        // Fetch deaths and tank roster for all boss fights
        const [allDeathEntries, tankNames] = await Promise.all([
          fetchDeaths(token, code, bossFightIDs),
          fetchTankNames(token, code, bossFightIDs),
        ])

        // Accumulate deaths across all boss attempts (guild members only, excluding tanks)
        for (const entry of allDeathEntries) {
          if (!entry.name) continue
          if (tankNames.has(entry.name)) continue
          if (filterByGuild && !guildMembers.has(entry.name)) continue
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
            if (filterByGuild && !guildMembers.has(entry.name)) continue
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
            if (filterByGuild && !guildMembers.has(entry.name)) continue
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
            if (filterByGuild && !guildMembers.has(entry.name)) continue
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
            if (filterByGuild && !guildMembers.has(entry.name)) continue
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
    const guildMembers = await fetchGuildRoster()
    const data = await fetchStats(token, guildMembers)
    writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(
      `${LOG_PREFIX} Wrote stats: mostDeaths=${data.stats.mostDeaths?.name ?? 'none'}, ` +
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
