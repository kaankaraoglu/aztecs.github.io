/* global process */
/**
 * Build-time script that fetches full raid progression from Warcraft Logs.
 * Writes to src/data/wcl-progression.json with per-boss data including:
 * - Kill status per difficulty (Normal/Heroic/Mythic)
 * - Kill date, pull count, best % on unkilled bosses
 * - Full kill roster with player names and classes
 *
 * Requires WCL_CLIENT_ID and WCL_CLIENT_SECRET env vars.
 * Usage: node scripts/fetch-wcl-data.js
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const GUILD_ID = 18606
const CURRENT_ZONE_ID = 46 // VS / DR / MQD (Midnight Season 1)
const TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token'
const API_URL = 'https://www.warcraftlogs.com/api/v2/client'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'wcl-progression.json')

const EMPTY_OUTPUT = {
  zone: null,
  raids: [],
  summary: { total: 0, normal: 0, heroic: 0, mythic: 0 },
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

/**
 * Groups encounters into raid instances based on WoW's actual structure.
 * WCL combines all bosses under one zone — this mapping splits them back.
 */
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

async function getToken() {
  const clientId = process.env.WCL_CLIENT_ID
  const clientSecret = process.env.WCL_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    console.warn('[wcl] WCL_CLIENT_ID or WCL_CLIENT_SECRET not set, skipping')
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
  return res.json()
}

const DIFF_NAME = { 3: 'normal', 4: 'heroic', 5: 'mythic' }

async function fetchProgression(token) {
  // Fetch zone encounters for boss list, then all guild reports for the zone
  const query = `{
    worldData {
      zone(id: ${CURRENT_ZONE_ID}) {
        name
        encounters { id name }
      }
    }
    reportData {
      reports(guildID: ${GUILD_ID}, zoneID: ${CURRENT_ZONE_ID}, limit: 25) {
        data {
          startTime
          fights {
            name
            encounterID
            kill
            difficulty
            startTime
            fightPercentage
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
  const zone = result.data?.worldData?.zone
  const reports = result.data?.reportData?.reports?.data || []

  if (!zone) throw new Error('Zone not found')

  // Build per-boss data across all reports and difficulties
  // Key: "bossName|difficulty"
  const bossData = new Map()

  for (const report of reports) {
    const actorMap = new Map(
      (report.masterData?.actors || []).map((a) => [
        a.id,
        { name: a.name, class: CLASS_MAP[a.subType] || a.subType.toLowerCase() },
      ]),
    )

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
          roster: null,
        })
      }

      const entry = bossData.get(key)
      entry.pulls++

      if (fight.kill && !entry.killed) {
        entry.killed = true
        // Convert WCL timestamps (report startTime is epoch ms, fight startTime is ms offset)
        entry.killedAt = new Date(report.startTime + fight.startTime).toISOString()

        const players = (fight.friendlyPlayers || [])
          .map((id) => actorMap.get(id))
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name))
        entry.roster = players
      }

      if (!fight.kill) {
        const pct = fight.fightPercentage
        if (pct != null && (entry.bestPercent === null || pct < entry.bestPercent)) {
          entry.bestPercent = pct
        }
      }
    }
  }

  // Build the output structure grouped by raid instance
  const raids = Object.entries(RAID_INSTANCE_ENCOUNTERS).map(([instanceName, bossNames]) => ({
    name: instanceName,
    bosses: bossNames.map((bossName) => {
      const normalData = bossData.get(`${bossName}|normal`)
      const heroicData = bossData.get(`${bossName}|heroic`)
      const mythicData = bossData.get(`${bossName}|mythic`)

      // Use the highest difficulty kill for roster display
      const killData = mythicData?.killed
        ? mythicData
        : heroicData?.killed
          ? heroicData
          : normalData?.killed
            ? normalData
            : null

      // Aggregate pulls across all difficulties
      const totalPulls =
        (normalData?.pulls || 0) + (heroicData?.pulls || 0) + (mythicData?.pulls || 0)

      // Best % only for the highest difficulty being progressed but NOT yet killed
      const progressEntry = [mythicData, heroicData, normalData].find(
        (d) => d && !d.killed && d.bestPercent != null,
      )

      return {
        name: bossName,
        normal: !!normalData?.killed,
        heroic: !!heroicData?.killed,
        mythic: !!mythicData?.killed,
        killedAt: killData?.killedAt || undefined,
        pulls: totalPulls || undefined,
        bestPercent: progressEntry?.bestPercent ?? undefined,
        roster: killData?.roster || undefined,
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

  return { zone: zone.name, raids, summary }
}

async function main() {
  const token = await getToken()
  if (!token) {
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
    console.log('[wcl] Wrote empty progression (no credentials)')
    return
  }

  try {
    const data = await fetchProgression(token)
    const bosses = data.raids.flatMap((r) => r.bosses)
    const killed = bosses.filter((b) => b.normal || b.heroic || b.mythic).length

    writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(
      `[wcl] Wrote progression: ${killed}/${bosses.length} bosses killed, ` +
        `${data.summary.normal}N ${data.summary.heroic}HC ${data.summary.mythic}M`,
    )
  } catch (err) {
    console.warn(`[wcl] Failed to fetch progression: ${err.message}`)
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
  }
}

main()
