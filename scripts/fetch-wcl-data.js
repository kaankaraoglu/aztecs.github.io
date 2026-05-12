/**
 * Build-time script that fetches full raid progression from Warcraft Logs.
 * Writes to src/data/wcl-progression.json with per-boss data including:
 * - Kill status per difficulty (Normal/Heroic/Mythic)
 * - Kill date, pull count, best % on unkilled bosses
 * - Full kill roster grouped by role (tanks/healers/dps) with class and spec
 *
 * Requires WCL_CLIENT_ID and WCL_CLIENT_SECRET env vars.
 * Usage: node scripts/fetch-wcl-data.js
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { loadEnv } from './load-env.js'
import { GUILD_ID, CURRENT_ZONE_ID, CLASS_MAP, getToken, graphql } from './wcl-api.js'

loadEnv()

const LOG_PREFIX = '[wcl]'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'wcl-progression.json')

const EMPTY_OUTPUT = {
  zone: null,
  raids: [],
  summary: { total: 0, normal: 0, heroic: 0, mythic: 0 },
  latestReport: null,
}

const RAID_INSTANCE_ENCOUNTERS = {
  'The Voidspire': [
    'Imperator Averzian',
    'Vorasius',
    'Fallen-King Salhadaar',
    'Vaelgor & Ezzorak',
    'Lightblinded Vanguard',
    'Crown of the Cosmos',
  ],
  'The Dreamrift': ['Chimaerus, the Undreamt God'],
  "March on Quel'Danas": ["Belo'ren, Child of Al'ar", 'Midnight Falls'],
}

const DIFF_NAME = { 3: 'normal', 4: 'heroic', 5: 'mythic' }

function mapPlayer(p) {
  const server = p.server || "Al'Akir"
  const realmSlug = server.toLowerCase().replace(/'/g, '').replace(/\s+/g, '-')
  return {
    name: p.name,
    class: CLASS_MAP[p.type] || p.type.toLowerCase(),
    spec: p.specs?.[0]?.spec || null,
    armory: `https://worldofwarcraft.blizzard.com/en-gb/character/eu/${realmSlug}/${encodeURIComponent(p.name.toLowerCase())}`,
  }
}

/**
 * Fetches playerDetails for a specific fight, returning roster grouped by role.
 */
async function fetchRoster(token, reportCode, fightId) {
  const query = `{
    reportData {
      report(code: "${reportCode}") {
        playerDetails(fightIDs: [${fightId}])
      }
    }
  }`

  const result = await graphql(token, query)
  const raw = result.data?.reportData?.report?.playerDetails
  if (!raw) return null

  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
  const pd = parsed?.data?.playerDetails
  if (!pd) return null

  return {
    tanks: (pd.tanks || []).map(mapPlayer),
    healers: (pd.healers || []).map(mapPlayer),
    dps: (pd.dps || []).map(mapPlayer),
  }
}

async function fetchProgression(token) {
  // Phase 1: fetch zone structure + all fights (kills and wipes)
  const query = `{
    worldData {
      zone(id: ${CURRENT_ZONE_ID}) {
        name
        encounters { id name }
      }
    }
    reportData {
      reports(guildID: ${GUILD_ID}, zoneID: ${CURRENT_ZONE_ID}, limit: 50) {
        data {
          code
          startTime
          fights {
            id
            name
            encounterID
            kill
            difficulty
            startTime
            fightPercentage
          }
        }
      }
    }
  }`

  console.log(`${LOG_PREFIX} Fetching zone info and reports for zone ${CURRENT_ZONE_ID}...`)
  const result = await graphql(token, query)
  const zone = result.data?.worldData?.zone
  const reports = result.data?.reportData?.reports?.data || []

  if (!zone) throw new Error('Zone not found')

  const totalFights = reports.reduce((sum, r) => sum + (r.fights?.length || 0), 0)
  console.log(
    `${LOG_PREFIX} Zone: ${zone.name}, ${reports.length} reports, ${totalFights} total fights`,
  )

  // Build per-boss data across all reports
  // Key: "bossName|difficulty"
  // Process reports oldest-first so `killed`/`killedAt`/`pulls` reflect the
  // FIRST kill, not whichever kill iteration happened to encounter first.
  // WCL returns reports newest-first; sort ascending by startTime.
  const bossData = new Map()
  const reportsChronological = [...reports].sort((a, b) => a.startTime - b.startTime)

  for (const report of reportsChronological) {
    for (const fight of report.fights || []) {
      if (fight.encounterID === 0) continue

      const diffKey = DIFF_NAME[fight.difficulty]
      if (!diffKey) continue

      const key = `${fight.name}|${diffKey}`

      if (!bossData.has(key)) {
        bossData.set(key, {
          name: fight.name,
          difficulty: diffKey,
          killed: false,
          killedAt: null,
          pulls: 0,
          bestPercent: null,
          killReportCode: null,
          killFightId: null,
        })
      }

      const entry = bossData.get(key)
      if (!entry.killed) entry.pulls++

      if (fight.kill && !entry.killed) {
        entry.killed = true
        entry.killedAt = new Date(report.startTime + fight.startTime).toISOString()
        entry.killReportCode = report.code
        entry.killFightId = fight.id
      }

      if (!fight.kill) {
        const pct = fight.fightPercentage
        if (pct != null && (entry.bestPercent === null || pct < entry.bestPercent)) {
          entry.bestPercent = pct
        }
      }
    }
  }

  const bossCount = new Set([...bossData.values()].map((e) => e.name)).size
  const killedCount = [...bossData.values()].filter((e) => e.killed).length
  console.log(
    `${LOG_PREFIX} Processed ${reports.length} reports: ${bossCount} bosses tracked, ${killedCount} difficulty kills found`,
  )

  // Phase 2: fetch playerDetails for each kill (role-grouped roster)
  const killEntries = [...bossData.values()].filter((e) => e.killed && e.killReportCode)

  // Fetch rosters in parallel (bounded to avoid rate limits)
  const BATCH_SIZE = 5
  const rosterMap = new Map()
  const totalBatches = Math.ceil(killEntries.length / BATCH_SIZE)

  console.log(
    `${LOG_PREFIX} Fetching rosters for ${killEntries.length} kills in ${totalBatches} batches...`,
  )

  for (let i = 0; i < killEntries.length; i += BATCH_SIZE) {
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1
    const batch = killEntries.slice(i, i + BATCH_SIZE)
    const batchNames = batch.map((e) => `${e.name} (${e.difficulty})`).join(', ')
    console.log(`${LOG_PREFIX}   Batch ${batchIndex}/${totalBatches}: ${batchNames}`)

    const results = await Promise.all(
      batch.map(async (entry) => {
        const key = `${entry.name}|${entry.difficulty}`
        const roster = await fetchRoster(token, entry.killReportCode, entry.killFightId)
        return [key, roster]
      }),
    )
    for (const [key, roster] of results) {
      if (roster) rosterMap.set(key, roster)
    }
  }

  console.log(`${LOG_PREFIX} Fetched ${rosterMap.size}/${killEntries.length} rosters successfully`)

  // Build output grouped by raid instance
  const raids = Object.entries(RAID_INSTANCE_ENCOUNTERS).map(([instanceName, bossNames]) => ({
    name: instanceName,
    bosses: bossNames.map((bossName) => {
      const normalData = bossData.get(`${bossName}|normal`)
      const heroicData = bossData.get(`${bossName}|heroic`)
      const mythicData = bossData.get(`${bossName}|mythic`)

      const highestKill = mythicData?.killed
        ? mythicData
        : heroicData?.killed
          ? heroicData
          : normalData?.killed
            ? normalData
            : null

      const pullsByDifficulty = {}
      if (normalData?.pulls) pullsByDifficulty.normal = normalData.pulls
      if (heroicData?.pulls) pullsByDifficulty.heroic = heroicData.pulls
      if (mythicData?.pulls) pullsByDifficulty.mythic = mythicData.pulls

      const progressEntry = [mythicData, heroicData, normalData].find(
        (d) => d && !d.killed && d.bestPercent != null,
      )

      const rosterKey = highestKill ? `${highestKill.name}|${highestKill.difficulty}` : null
      const roster = rosterKey ? rosterMap.get(rosterKey) : undefined

      return {
        name: bossName,
        normal: !!normalData?.killed,
        heroic: !!heroicData?.killed,
        mythic: !!mythicData?.killed,
        killedAt: highestKill?.killedAt || undefined,
        pullsByDifficulty: Object.keys(pullsByDifficulty).length ? pullsByDifficulty : undefined,
        bestPercent: progressEntry?.bestPercent ?? undefined,
        roster: roster || undefined,
      }
    }),
  }))

  const allBosses = raids.flatMap((r) => r.bosses)
  const summary = {
    total: allBosses.length,
    normal: allBosses.filter((b) => b.normal).length,
    heroic: allBosses.filter((b) => b.heroic).length,
    mythic: allBosses.filter((b) => b.mythic).length,
  }

  // Latest report link (reports are returned most recent first)
  const latestReport = reports[0]?.code
    ? `https://www.warcraftlogs.com/reports/${reports[0].code}`
    : null

  return { zone: zone.name, raids, summary, latestReport }
}

async function main() {
  const token = await getToken(LOG_PREFIX)
  if (!token) {
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
    console.log(`${LOG_PREFIX} Wrote empty progression (no credentials)`)
    return
  }

  try {
    const data = await fetchProgression(token)
    const bosses = data.raids.flatMap((r) => r.bosses)
    const killed = bosses.filter((b) => b.normal || b.heroic || b.mythic).length
    const rosterCount = bosses.filter((b) => b.roster).length

    writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(
      `${LOG_PREFIX} Wrote progression: ${killed}/${bosses.length} bosses killed, ` +
        `${rosterCount} rosters, ` +
        `${data.summary.normal}N ${data.summary.heroic}HC ${data.summary.mythic}M`,
    )
  } catch (err) {
    console.warn(`${LOG_PREFIX} Failed to fetch progression: ${err.message}`)
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
  }
}

main()
