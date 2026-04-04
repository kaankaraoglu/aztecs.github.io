/**
 * Build-time script that fetches M+ data from Raider.IO.
 * Writes to src/data/rio-mythicplus.json with:
 * - Top 10 runners by M+ score with their top keys
 * - Best key level per dungeon across all guild members
 *
 * Two-phase fetch:
 * 1. Guild members endpoint → list of character names/realms
 * 2. Individual character profiles → M+ scores and best runs
 *
 * No authentication required (public API).
 * Usage: node scripts/fetch-rio-data.js
 */

import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const GUILD_URL =
  'https://raider.io/api/v1/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=members'
const CHAR_URL = 'https://raider.io/api/v1/characters/profile'
const CHAR_FIELDS = 'mythic_plus_scores_by_season:current,mythic_plus_best_runs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'rio-mythicplus.json')

const EMPTY_OUTPUT = { season: null, topRunners: [], dungeonBests: [] }

const BATCH_SIZE = 5
const BATCH_DELAY_MS = 300

function toKebabClass(className) {
  return className.toLowerCase().replace(/\s+/g, '-')
}

function formatTopKeys(runs) {
  if (!runs || runs.length === 0) return []
  return runs
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((run) => `+${run.mythic_level} ${run.short_name || run.dungeon}`)
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

/**
 * Fetch a character profile from Raider.IO.
 * @param {string} name
 * @param {string} realmSlug – pre-extracted slug from the guild API profile_url
 * @returns {Promise<object | null>} profile data, or null if the character is not tracked (HTTP 400)
 */
async function fetchCharacterProfile(name, realmSlug) {
  const url = `${CHAR_URL}?region=eu&realm=${realmSlug}&name=${encodeURIComponent(name)}&fields=${CHAR_FIELDS}`
  const res = await fetch(url)

  if (res.status === 400) return null // character not tracked by RIO (e.g. low-level alt)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  return res.json()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  try {
    // Phase 1: Get guild member list
    const guildData = await fetchJson(GUILD_URL)
    const members = guildData.members || []

    if (members.length === 0) {
      console.warn('[rio] No guild members found')
      writeFileSync(OUTPUT_PATH, JSON.stringify(EMPTY_OUTPUT, null, 2) + '\n')
      return
    }

    // Deduplicate by character name (guild may have alts)
    const seen = new Set()
    const uniqueMembers = members.filter((m) => {
      const key = `${m.character.name}-${m.character.realm?.slug || 'al-akir'}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    const totalBatches = Math.ceil(uniqueMembers.length / BATCH_SIZE)
    console.log(
      `[rio] Found ${uniqueMembers.length} unique guild members, fetching M+ profiles in ${totalBatches} batches of ${BATCH_SIZE}...`,
    )

    // Phase 2: Fetch individual character profiles in batches
    const profiles = []
    let succeeded = 0
    let skipped = 0
    let failed = 0

    for (let i = 0; i < uniqueMembers.length; i += BATCH_SIZE) {
      const batchIndex = Math.floor(i / BATCH_SIZE) + 1
      const batch = uniqueMembers.slice(i, i + BATCH_SIZE)
      const batchNames = batch.map((m) => m.character.name).join(', ')
      console.log(`[rio]   Batch ${batchIndex}/${totalBatches}: ${batchNames}`)

      const results = await Promise.allSettled(
        batch.map((m) => {
          // Extract realm slug from the profile_url provided by the guild API
          const slug = m.character.profile_url.split('/')[5]
          return fetchCharacterProfile(m.character.name, slug)
        }),
      )

      for (let j = 0; j < results.length; j++) {
        const result = results[j]
        const charName = batch[j].character.name
        if (result.status === 'fulfilled' && result.value !== null) {
          succeeded++
          profiles.push(result.value)
        } else if (result.status === 'fulfilled' && result.value === null) {
          skipped++
        } else {
          failed++
          console.warn(`[rio]     ✗ ${charName}: ${result.reason?.message || 'unknown error'}`)
        }
      }

      // Rate-limit between batches
      if (i + BATCH_SIZE < uniqueMembers.length) {
        await sleep(BATCH_DELAY_MS)
      }
    }

    console.log(
      `[rio] Profile fetch complete: ${succeeded} succeeded, ${skipped} skipped (not on RIO), ${failed} failed`,
    )

    // Determine season name
    let season = null
    for (const profile of profiles) {
      const seasons = profile.mythic_plus_scores_by_season
      if (seasons && seasons.length > 0 && seasons[0].season) {
        season = seasons[0].season
        break
      }
    }

    // Build top runners
    const scoredMembers = profiles
      .map((profile) => {
        const seasons = profile.mythic_plus_scores_by_season
        const score = seasons && seasons.length > 0 ? seasons[0].scores?.all || 0 : 0

        if (score <= 0) return null

        return {
          name: profile.name,
          class: toKebabClass(profile.class),
          score: Math.round(score),
          topKeys: formatTopKeys(profile.mythic_plus_best_runs),
        }
      })
      .filter(Boolean)

    const topRunners = scoredMembers
      .slice()
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    // Build dungeon bests
    /** @type {Map<string, { dungeon: string, level: number, timed: boolean, team: string[] }>} */
    const dungeonMap = new Map()

    for (const profile of profiles) {
      const runs = profile.mythic_plus_best_runs || []
      for (const run of runs) {
        const key = run.short_name || run.dungeon
        const existing = dungeonMap.get(key)
        if (!existing || run.mythic_level > existing.level) {
          const team = (run.roster || []).map((r) => r.character?.name).filter(Boolean)
          dungeonMap.set(key, {
            dungeon: run.dungeon,
            level: run.mythic_level,
            timed: run.num_keystone_upgrades > 0,
            team: team.length > 0 ? team : [profile.name],
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
