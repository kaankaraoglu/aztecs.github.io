/**
 * One-time manual script that fetches historical raid data from Warcraft Logs.
 * Outputs a JSON array to stdout summarising guild kill data per zone per expansion.
 *
 * Requires WCL_CLIENT_ID and WCL_CLIENT_SECRET env vars.
 * Usage: node scripts/fetch-wcl-history.js
 */

import { loadEnv } from './load-env.js'
import { GUILD_ID, getToken, graphql } from './wcl-api.js'

loadEnv()

const LOG_PREFIX = '[wcl-history]'

/** Difficulty IDs as returned by WCL. */
const DIFF = { NORMAL: 3, HEROIC: 4, MYTHIC: 5 }

/**
 * Fetches all expansions (IDs 1–5) and returns a flat list of zones with their encounters.
 * @param {string} token
 * @returns {Promise<Array<{expansionName: string, zoneId: number, zoneName: string, encounters: Array<{id: number, name: string}>}>>}
 */
async function fetchAllZones(token) {
  const EXPANSION_IDS = [1, 2, 3, 4, 5]
  const BATCH_SIZE = 3
  /** @type {Array<{expansionName: string, zoneId: number, zoneName: string, encounters: Array<{id: number, name: string}>}>} */
  const allZones = []

  for (let i = 0; i < EXPANSION_IDS.length; i += BATCH_SIZE) {
    const batch = EXPANSION_IDS.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map(async (expansionId) => {
        const query = `{
          worldData {
            expansion(id: ${expansionId}) {
              name
              zones {
                id
                name
                encounters { id name }
              }
            }
          }
        }`

        try {
          const result = await graphql(token, query, { logPrefix: LOG_PREFIX })
          const expansion = result.data?.worldData?.expansion
          if (!expansion) return []

          return (expansion.zones || []).map((zone) => ({
            expansionName: expansion.name,
            zoneId: zone.id,
            zoneName: zone.name,
            encounters: zone.encounters || [],
          }))
        } catch (err) {
          console.error(`${LOG_PREFIX} Failed to fetch expansion ${expansionId}: ${err.message}`)
          return []
        }
      }),
    )

    for (const zones of results) {
      allZones.push(...zones)
    }
  }

  return allZones
}

/**
 * @typedef {Object} ZoneResult
 * @property {string} expansion
 * @property {string} zone
 * @property {number} zoneId
 * @property {number} encounterCount
 * @property {number} normalKills
 * @property {number} heroicKills
 * @property {number} mythicKills
 * @property {string[]} bossesKilled
 */

/**
 * Fetches up to 5 reports for a zone and counts kills per difficulty.
 * Returns null if the guild has no reports for this zone.
 * @param {string} token
 * @param {string} expansionName
 * @param {number} zoneId
 * @param {string} zoneName
 * @param {Array<{id: number, name: string}>} encounters
 * @returns {Promise<ZoneResult | null>}
 */
async function fetchZoneHistory(token, expansionName, zoneId, zoneName, encounters) {
  const query = `{
    reportData {
      reports(guildID: ${GUILD_ID}, zoneID: ${zoneId}, limit: 5) {
        data {
          code
          fights {
            encounterID
            kill
            difficulty
          }
        }
      }
    }
  }`

  const result = await graphql(token, query, { logPrefix: LOG_PREFIX })
  const reports = result.data?.reportData?.reports?.data || []

  if (reports.length === 0) return null

  /** @type {Map<number, string>} */
  const encounterNameById = new Map(encounters.map((e) => [e.id, e.name]))

  /** @type {Set<string>} */
  const normalKilledNames = new Set()
  /** @type {Set<string>} */
  const heroicKilledNames = new Set()
  /** @type {Set<string>} */
  const mythicKilledNames = new Set()

  for (const report of reports) {
    for (const fight of report.fights || []) {
      if (!fight.kill || fight.encounterID === 0) continue

      const name = encounterNameById.get(fight.encounterID)
      if (!name) continue

      if (fight.difficulty === DIFF.NORMAL) normalKilledNames.add(name)
      else if (fight.difficulty === DIFF.HEROIC) heroicKilledNames.add(name)
      else if (fight.difficulty === DIFF.MYTHIC) mythicKilledNames.add(name)
    }
  }

  /** @type {Set<string>} */
  const allKilledNames = new Set([...normalKilledNames, ...heroicKilledNames, ...mythicKilledNames])

  if (allKilledNames.size === 0) return null

  return {
    expansion: expansionName,
    zone: zoneName,
    zoneId,
    encounterCount: encounters.length,
    normalKills: normalKilledNames.size,
    heroicKills: heroicKilledNames.size,
    mythicKills: mythicKilledNames.size,
    bossesKilled: [...allKilledNames],
  }
}

async function main() {
  const token = await getToken(LOG_PREFIX)
  if (!token) process.exit(1)

  console.error(`${LOG_PREFIX} Fetching expansion and zone data...`)
  const allZones = await fetchAllZones(token)
  console.error(`${LOG_PREFIX} Found ${allZones.length} zones across all expansions`)

  /** @type {ZoneResult[]} */
  const output = []
  const BATCH_SIZE = 3

  for (let i = 0; i < allZones.length; i += BATCH_SIZE) {
    const batch = allZones.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map(async ({ expansionName, zoneId, zoneName, encounters }) => {
        try {
          return await fetchZoneHistory(token, expansionName, zoneId, zoneName, encounters)
        } catch (err) {
          console.error(
            `${LOG_PREFIX} Failed to fetch zone ${zoneName} (${zoneId}): ${err.message}`,
          )
          return null
        }
      }),
    )

    for (const result of results) {
      if (result !== null) {
        console.error(`${LOG_PREFIX} Zone with kills: ${result.zone} (${result.expansion})`)
        output.push(result)
      }
    }
  }

  console.error(`${LOG_PREFIX} Done. Found ${output.length} zones with guild kills.`)
  console.log(JSON.stringify(output, null, 2))
}

main()
