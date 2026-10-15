/**
 * Build-time script that fetches full raid progression from Warcraft Logs.
 * Writes to src/data/wcl-progression.json with per-boss data including:
 * - Kill status per difficulty (Normal/Heroic/Mythic)
 * - Kill date, pull count, best % on unkilled bosses
 * - Roster grouped by role (tanks/healers/dps) with class and spec, taken from the first kill,
 *   or from the best pull for bosses not killed on any difficulty
 *
 * Requires WCL_CLIENT_ID and WCL_CLIENT_SECRET env vars.
 * Usage: node scripts/fetch-wcl-data.js
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { loadEnv } from './load-env.js'
import { writeFallback } from './write-fallback.js'
import {
  GUILD_ID,
  CURRENT_ZONE_IDS,
  CLASS_MAP,
  toRealmSlug,
  getToken,
  graphql,
  fetchPlayerDetails,
} from './wcl-api.js'

loadEnv()

const IS_CI = !!process.env.CI
// Progression is recomputed wholesale from this window, so a smaller local
// window would rewrite the committed file with fewer kills. Keep local and CI
// identical unless WCL_REPORT_LIMIT explicitly opts out.
const REPORT_LIMIT = Number(process.env.WCL_REPORT_LIMIT) || 50

const LOG_PREFIX = '[wcl]'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'wcl-progression.json')

const EMPTY_OUTPUT = {
  zone: null,
  raids: [],
  summary: { total: 0, normal: 0, heroic: 0, mythic: 0 },
  latestReport: null,
  lastUpdated: null,
}

// Raid instances whose mythic tier is the "Mythic Flex" difficulty. Their mythic
// pip is relabelled "MX" / "Mythic Flex" in the UI (same legendary colour); the
// underlying data still uses the `mythic` field. Add an instance name here when a
// Mythic Flex tier launches, alongside CURRENT_ZONE_IDS / RAID_INSTANCE_ENCOUNTERS.
const MYTHIC_FLEX_INSTANCES = new Set(['Sporefall', 'The Tidebound Grotto'])
// TODO @launch: if WCL assigns Mythic Flex a NEW difficulty id (not 5),
// add it to DIFF_NAME and map it to 'mythic'.

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
  Sporefall: ['Rotmire'],
  'The Tidebound Grotto': ['Nymrissa Wavecaller'],
  'The Venomous Abyss': [
    "Nek'zali the Soulcoiler",
    'Entombed Sentinels',
    'Vashnik the Malignant',
    'The Lost Explorers',
    'Sszorak',
    'The Twin Fangs',
    'The Coiled Altar',
    "Ula'tek",
  ],
  "The Unbinding of Kith'ix": ["Kith'ix"],
}

const DIFF_NAME = { 3: 'normal', 4: 'heroic', 5: 'mythic' }

function mapPlayer(p) {
  const server = p.server || "Al'Akir"
  const realmSlug = toRealmSlug(server)
  const type = p.type || ''
  return {
    name: p.name,
    class: CLASS_MAP[type] || type.toLowerCase(),
    spec: p.specs?.[0]?.spec || null,
    armory: `https://worldofwarcraft.blizzard.com/en-gb/character/eu/${realmSlug}/${encodeURIComponent(String(p.name).toLowerCase())}`,
  }
}

/**
 * WCL returns each role's players in an arbitrary order that shifts between
 * requests. Sorting by name keeps the committed JSON stable, so a cron run that
 * fetched identical data produces no diff and therefore no deploy.
 * @param {any[]} players
 */
function sortedRole(players) {
  return (players || []).map(mapPlayer).sort((a, b) => a.name.localeCompare(b.name, 'en'))
}

/**
 * Fetches playerDetails for a specific fight, returning roster grouped by role.
 */
async function fetchRoster(token, reportCode, fightId) {
  const pd = await fetchPlayerDetails(token, reportCode, [fightId], LOG_PREFIX)
  if (!pd) return null

  return {
    tanks: sortedRole(pd.tanks),
    healers: sortedRole(pd.healers),
    dps: sortedRole(pd.dps),
  }
}

async function fetchProgression(token) {
  // Phase 1: fetch zone structure + all fights (kills and wipes) across all
  // tracked zones. Each zone is queried separately to stay within WCL's
  // per-request query complexity limit.
  const zoneNames = []
  const reportsByCode = new Map()

  for (const zoneId of CURRENT_ZONE_IDS) {
    const query = `{
      worldData {
        zone(id: ${zoneId}) {
          name
          encounters { id name }
        }
      }
      reportData {
        reports(guildID: ${GUILD_ID}, zoneID: ${zoneId}, limit: ${REPORT_LIMIT}) {
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

    console.log(`${LOG_PREFIX} Fetching zone info and reports for zone ${zoneId}...`)
    const result = await graphql(token, query)
    const zone = result.data?.worldData?.zone
    if (zone) zoneNames.push(zone.name)

    // Deduplicate by report code — a single raid session can span multiple
    // zones and appear in both zone queries.
    const zoneReports = result.data?.reportData?.reports?.data || []
    for (const report of zoneReports) {
      if (!reportsByCode.has(report.code)) {
        reportsByCode.set(report.code, report)
      }
    }
  }

  if (!zoneNames.length) throw new Error('No zones found')
  const zoneName = zoneNames.join(' / ')
  const reports = [...reportsByCode.values()].sort((a, b) => b.startTime - a.startTime)

  const totalFights = reports.reduce((sum, r) => sum + (r.fights?.length || 0), 0)
  console.log(
    `${LOG_PREFIX} Zones: ${zoneName}, ${reports.length} reports, ${totalFights} total fights`,
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
          bestReportCode: null,
          bestFightId: null,
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
          entry.bestReportCode = report.code
          entry.bestFightId = fight.id
        }
      }
    }
  }

  const bossCount = new Set([...bossData.values()].map((e) => e.name)).size
  const killedCount = [...bossData.values()].filter((e) => e.killed).length
  console.log(
    `${LOG_PREFIX} Processed ${reports.length} reports: ${bossCount} bosses tracked, ${killedCount} difficulty kills found`,
  )

  // Phase 2: fetch playerDetails (role-grouped roster) for each kill, and for the best pull
  // of every boss that is not killed on any difficulty
  const rosterJobs = [...bossData.values()]
    .filter((e) => e.killed && e.killReportCode)
    .map((e) => ({ entry: e, code: e.killReportCode, fightId: e.killFightId, label: 'kill' }))
  const killedNames = new Set([...bossData.values()].filter((e) => e.killed).map((e) => e.name))
  for (const name of new Set([...bossData.values()].map((e) => e.name))) {
    if (killedNames.has(name)) continue
    const entry = ['mythic', 'heroic', 'normal']
      .map((d) => bossData.get(`${name}|${d}`))
      .find((d) => d && d.bestPercent != null && d.bestReportCode)
    if (entry) {
      rosterJobs.push({
        entry,
        code: entry.bestReportCode,
        fightId: entry.bestFightId,
        label: 'best pull',
      })
    }
  }

  // Fetch rosters in parallel (bounded to avoid rate limits)
  const BATCH_SIZE = 5
  const rosterMap = new Map()
  const totalBatches = Math.ceil(rosterJobs.length / BATCH_SIZE)

  console.log(
    `${LOG_PREFIX} Fetching ${rosterJobs.length} rosters (kills and best pulls) in ${totalBatches} batches...`,
  )

  for (let i = 0; i < rosterJobs.length; i += BATCH_SIZE) {
    const batchIndex = Math.floor(i / BATCH_SIZE) + 1
    const batch = rosterJobs.slice(i, i + BATCH_SIZE)
    const batchNames = batch
      .map((j) => `${j.entry.name} (${j.entry.difficulty}, ${j.label})`)
      .join(', ')
    console.log(`${LOG_PREFIX}   Batch ${batchIndex}/${totalBatches}: ${batchNames}`)

    const results = await Promise.all(
      batch.map(async (job) => {
        const key = `${job.entry.name}|${job.entry.difficulty}`
        const roster = await fetchRoster(token, job.code, job.fightId)
        return [key, roster]
      }),
    )
    for (const [key, roster] of results) {
      if (roster) rosterMap.set(key, roster)
    }
  }

  console.log(`${LOG_PREFIX} Fetched ${rosterMap.size}/${rosterJobs.length} rosters successfully`)

  // Build output grouped by raid instance
  const raids = Object.entries(RAID_INSTANCE_ENCOUNTERS).map(([instanceName, bossNames]) => ({
    name: instanceName,
    mythicFlex: MYTHIC_FLEX_INSTANCES.has(instanceName),
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

      const rosterEntry = highestKill ?? progressEntry
      const rosterKey = rosterEntry ? `${rosterEntry.name}|${rosterEntry.difficulty}` : null
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

  return { zone: zoneName, raids, summary, latestReport, lastUpdated: new Date().toISOString() }
}

/**
 * Writes the progression file, reusing the previous `lastUpdated` when nothing
 * else changed. Without this, the stamp alone would produce a fresh commit —
 * and therefore a full deploy — on every cron run.
 * @param {{ lastUpdated: string }} data
 */
function writeOutput(data) {
  const { lastUpdated, ...payload } = data
  let stamp = lastUpdated
  try {
    const { lastUpdated: prevStamp, ...prevPayload } = JSON.parse(
      readFileSync(OUTPUT_PATH, 'utf-8'),
    )
    if (prevStamp && JSON.stringify(prevPayload) === JSON.stringify(payload)) {
      stamp = prevStamp
    }
  } catch {
    /* no readable previous file — keep the fresh stamp */
  }
  writeFileSync(OUTPUT_PATH, JSON.stringify({ ...payload, lastUpdated: stamp }, null, 2) + '\n')
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

    const data = await fetchProgression(token)
    const bosses = data.raids.flatMap((r) => r.bosses)
    const killed = bosses.filter((b) => b.normal || b.heroic || b.mythic).length
    const rosterCount = bosses.filter((b) => b.roster).length

    writeOutput(data)
    console.log(
      `${LOG_PREFIX} Wrote progression: ${killed}/${bosses.length} bosses killed, ` +
        `${rosterCount} rosters, ` +
        `${data.summary.normal}N ${data.summary.heroic}HC ${data.summary.mythic}M`,
    )
  } catch (err) {
    writeFallback(
      OUTPUT_PATH,
      EMPTY_OUTPUT,
      LOG_PREFIX,
      `Failed to fetch progression: ${err.message}`,
    )
    // Automated runs must go red; a local run without credentials should not.
    if (IS_CI) process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(`${LOG_PREFIX} Unexpected failure: ${err.message}`)
  process.exitCode = 1
})
