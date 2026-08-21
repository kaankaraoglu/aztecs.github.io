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
import { writeFallback } from './write-fallback.js'
import {
  GUILD_ID,
  CURRENT_ZONE_IDS,
  CURRENT_MPLUS_ZONE_ID,
  CLASS_MAP,
  getToken,
  graphql,
  fetchReportTable,
  fetchPlayerDetails,
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
 * Tank names across the given fights, used to exclude tanks from the death tally.
 * @param {string} token
 * @param {string} code
 * @param {number[]} fightIDs
 * @returns {Promise<Set<string>>}
 */
async function fetchTankNames(token, code, fightIDs) {
  const pd = await fetchPlayerDetails(token, code, fightIDs, LOG_PREFIX)
  return new Set((pd?.tanks || []).map((t) => t.name).filter(Boolean))
}

/**
 * Shapes a winning table entry into the record the UI renders.
 * @param {{ name: string, type: string, total: number, reportCode: string, bossName: string } | null} entry
 */
function toRecord(entry) {
  if (!entry) return null
  return {
    name: entry.name,
    class: CLASS_MAP[entry.type] || entry.type.toLowerCase() || null,
    amount: entry.total,
    boss: entry.bossName || null,
    report: `https://www.warcraftlogs.com/reports/${entry.reportCode}`,
  }
}

/**
 * @param {string} token
 * @param {Set<string>} guildMembers - set of guild member names for filtering
 */
async function fetchStats(token, guildMembers) {
  const filterByGuild = guildMembers.size > 0

  // One query per raid zone — the same shape fetch-wcl-data.js uses, and for the
  // same reason: a single query spanning every tracked zone exceeds WCL's
  // per-request complexity limit.
  const zoneNames = []
  /** @type {Set<number>} */
  const raidEncounterIDs = new Set()
  /** @type {Map<string, { code: string, startTime: number, fights: any[] }>} */
  const raidReportsByCode = new Map()

  for (const zoneId of CURRENT_ZONE_IDS) {
    const zoneQuery = `{
      worldData {
        raidZone: zone(id: ${zoneId}) {
          name
          encounters { id }
        }
      }
      reportData {
        raidReports: reports(guildID: ${GUILD_ID}, zoneID: ${zoneId}, limit: ${REPORT_LIMIT}) {
          data {
            code
            startTime
            fights {
              id
              name
              encounterID
            }
          }
        }
      }
    }`

    const zoneResult = await graphql(token, zoneQuery, { logPrefix: LOG_PREFIX })
    const zone = zoneResult.data?.worldData?.raidZone
    if (zone?.name) zoneNames.push(zone.name)
    for (const encounter of zone?.encounters || []) raidEncounterIDs.add(encounter.id)

    // A raid session can span two zones and come back from both queries.
    for (const report of zoneResult.data?.reportData?.raidReports?.data || []) {
      if (!raidReportsByCode.has(report.code)) raidReportsByCode.set(report.code, report)
    }
  }

  const mplusQuery = `{
    worldData {
      mplusZone: zone(id: ${CURRENT_MPLUS_ZONE_ID}) {
        encounters { id }
      }
    }
    reportData {
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

  const mplusResult = await graphql(token, mplusQuery, { logPrefix: LOG_PREFIX })
  const zoneName = zoneNames.length ? zoneNames.join(' / ') : null

  /** @type {Set<number>} */
  const mplusEncounterIDs = new Set(
    (mplusResult.data?.worldData?.mplusZone?.encounters || []).map((e) => e.id),
  )

  // Newest first, then capped: unioning four zones can otherwise push this well
  // past REPORT_LIMIT, and each report costs two table queries per boss fight.
  const raidReports = [...raidReportsByCode.values()]
    .sort((a, b) => b.startTime - a.startTime)
    .slice(0, REPORT_LIMIT)
  const mplusReports = mplusResult.data?.reportData?.mplusReports?.data || []

  console.log(
    `${LOG_PREFIX} Zones: ${zoneName}, ${raidReports.length} raid reports, ${mplusReports.length} M+ reports`,
  )

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
          fetchReportTable(token, code, bossFightIDs, 'Deaths', LOG_PREFIX),
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
            fetchReportTable(token, code, [fight.id], 'DamageDone', LOG_PREFIX),
            fetchReportTable(token, code, [fight.id], 'Healing', LOG_PREFIX),
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
            fetchReportTable(token, code, [fight.id], 'DamageDone', LOG_PREFIX),
            fetchReportTable(token, code, [fight.id], 'Healing', LOG_PREFIX),
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

  return {
    zone: zoneName,
    stats: {
      mostDeaths,
      highestDamageDone: toRecord(highestDamageDoneEntry),
      highestDamageDoneMplus: toRecord(highestDamageDoneMplusEntry),
      bestHealer: toRecord(bestHealerEntry),
      bestHealerMplus: toRecord(bestHealerMplusEntry),
    },
  }
}

async function main() {
  try {
    // Inside the try so a DNS blip or timeout during the token request also
    // degrades to stale data instead of an unhandled rejection.
    const token = await getToken(LOG_PREFIX)
    if (!token) {
      writeFallback(OUTPUT_PATH, EMPTY_OUTPUT, LOG_PREFIX, 'No credentials')
      if (IS_CI) process.exitCode = 1
      return
    }

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
    writeFallback(OUTPUT_PATH, EMPTY_OUTPUT, LOG_PREFIX, `Failed to fetch stats: ${err.message}`)
    // Automated runs must go red; a local run without credentials should not.
    if (IS_CI) process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(`${LOG_PREFIX} Unexpected failure: ${err.message}`)
  process.exitCode = 1
})
