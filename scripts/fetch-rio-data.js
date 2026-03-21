/**
 * Build-time script that fetches M+ data from Raider.IO.
 * Writes to src/data/rio-mythicplus.json with:
 * - Top 10 runners by M+ score with their top keys
 * - Best key level per dungeon across all guild members
 *
 * No authentication required.
 * Usage: node scripts/fetch-rio-data.js
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const RIO_URL =
  'https://raider.io/api/v1/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=members'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'rio-mythicplus.json')

const EMPTY_OUTPUT = { season: null, topRunners: [], dungeonBests: [] }

/**
 * @param {string} className
 * @returns {string}
 */
function toKebabClass(className) {
  return className.toLowerCase().replace(/\s+/g, '-')
}

/**
 * @param {{ dungeon: string, mythic_level: number, num_keystone_upgrades: number, score: number }[]} runs
 * @returns {string[]}
 */
function formatTopKeys(runs) {
  if (!runs || runs.length === 0) return []
  return runs.slice(0, 2).map((run) => `+${run.mythic_level} ${run.dungeon}`)
}

async function fetchRioData() {
  const res = await fetch(RIO_URL)
  if (!res.ok) throw new Error(`Raider.IO request failed: ${res.status}`)
  return res.json()
}

async function main() {
  try {
    const data = await fetchRioData()

    /** @type {Array<{ character: { name: string, class: string, mythic_plus_scores_by_season: Array<{ season: string, scores: { all: number } }>, mythic_plus_best_runs: Array<{ dungeon: string, mythic_level: number, num_keystone_upgrades: number, score: number }> } }>} */
    const members = data.members || []

    // Determine season name from first member that has scores
    let season = 'TWW Season 2'
    for (const member of members) {
      const seasons = member.character?.mythic_plus_scores_by_season
      if (seasons && seasons.length > 0) {
        season = seasons[0].season
        break
      }
    }

    // Filter members with M+ scores > 0
    const scoredMembers = members
      .map((member) => {
        const char = member.character
        if (!char) return null

        const seasons = char.mythic_plus_scores_by_season
        const score = seasons && seasons.length > 0 ? seasons[0].scores.all : 0

        if (score <= 0) return null

        return {
          name: char.name,
          class: toKebabClass(char.class),
          score,
          topKeys: formatTopKeys(char.mythic_plus_best_runs),
        }
      })
      .filter(Boolean)

    // Sort by score descending, take top 10
    const topRunners = scoredMembers
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Find highest key per dungeon across all members
    /** @type {Map<string, { dungeon: string, level: number, timed: boolean, team: string[] }>} */
    const dungeonMap = new Map()

    for (const member of members) {
      const char = member.character
      if (!char) continue

      const runs = char.mythic_plus_best_runs || []
      for (const run of runs) {
        const existing = dungeonMap.get(run.dungeon)
        if (!existing || run.mythic_level > existing.level) {
          dungeonMap.set(run.dungeon, {
            dungeon: run.dungeon,
            level: run.mythic_level,
            timed: run.num_keystone_upgrades > 0,
            team: run.roster
              ? run.roster.map((r) => r.character?.name).filter(Boolean)
              : [char.name],
          })
        }
      }
    }

    const dungeonBests = [...dungeonMap.values()].sort((a, b) => b.level - a.level)

    const output = { season, topRunners, dungeonBests }

    writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n')
    console.log(
      `[rio] Wrote M+ data: ${topRunners.length} top runners, ${dungeonBests.length} dungeon bests`,
    )
  } catch (err) {
    console.warn(`[rio] Failed to fetch M+ data: ${err.message}`)
    writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
  }
}

main()
