import { ref, onMounted } from 'vue'
import { raids as fallbackRaids } from '@/data/progression.js'

const API_BASE = 'https://raider.io/api/v1'
const CACHE_KEY = 'raiderio_boss_progression'
const CACHE_DURATION = 60 * 60 * 1000
const MAX_PAGES = 10

/**
 * Maps Raider.IO encounter slugs to the raid instance they belong to.
 */
const RAID_INSTANCES = [
  {
    name: 'The Voidspire',
    encounters: [
      'imperator-averzian',
      'vorasius',
      'fallenking-salhadaar',
      'vaelgor-ezzorak',
      'lightblinded-vanguard',
      'crown-of-the-cosmos',
    ],
  },
  {
    name: 'The Dreamrift',
    encounters: ['chimaerus-the-undreamt-god'],
  },
  {
    name: "March on Quel'Danas",
    encounters: ['beloren-child-of-alar', 'midnight-falls'],
  },
]

/**
 * @typedef {{ name: string, normal: boolean, heroic: boolean }} Boss
 * @typedef {{ name: string, bosses: Boss[] }} Raid
 * @typedef {{ total: number, normal: number, heroic: number, mythic: number }} ProgressSummary
 */

function getCached() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached = JSON.parse(raw)
    if (Date.now() - cached.timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }
    return cached.data
  } catch {
    return null
  }
}

function setCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // ignore
  }
}

/**
 * Searches the raid-rankings endpoint for Aztecs, paginating until found.
 * Returns the set of encounter slugs the guild has defeated at the given difficulty.
 *
 * @param {string} raidSlug
 * @param {string} difficulty
 * @returns {Promise<Set<string>>}
 */
async function fetchDefeatedEncounters(raidSlug, difficulty) {
  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      `${API_BASE}/raiding/raid-rankings?raid=${raidSlug}` +
      `&difficulty=${difficulty}&region=eu&realm=al-akir&page=${page}`
    const res = await fetch(url)
    if (!res.ok) break

    const data = await res.json()
    const rankings = data.raidRankings || []
    if (rankings.length === 0) break

    const guild = rankings.find((g) => g.guild.name === 'Aztecs')
    if (guild) {
      return new Set((guild.encountersDefeated || []).map((e) => e.slug))
    }
  }
  return new Set()
}

/**
 * Builds the Raid[] data by combining static encounter names with
 * exact per-boss kill data from the raid-rankings endpoint.
 *
 * @param {{ encounters: { slug: string, name: string }[] }} staticRaid
 * @param {Set<string>} normalKills
 * @param {Set<string>} heroicKills
 * @returns {Raid[]}
 */
function buildRaids(staticRaid, normalKills, heroicKills) {
  const encounterNames = new Map(staticRaid.encounters.map((e) => [e.slug, e.name]))

  return RAID_INSTANCES.map((instance) => ({
    name: instance.name,
    bosses: instance.encounters.map((slug) => ({
      name: encounterNames.get(slug) || slug,
      normal: normalKills.has(slug),
      heroic: heroicKills.has(slug),
    })),
  }))
}

/**
 * Composable that provides live raid progression data from Raider.IO
 * with exact per-boss kill data. Falls back to progression.js if unavailable.
 */
/** @param {Raid[]} raids @returns {ProgressSummary} */
function computeSummary(raids) {
  const allBosses = raids.flatMap((r) => r.bosses)
  return {
    total: allBosses.length,
    normal: allBosses.filter((b) => b.normal).length,
    heroic: allBosses.filter((b) => b.heroic).length,
    mythic: 0,
  }
}

/**
 * Composable that provides live raid progression data from Raider.IO
 * with exact per-boss kill data. Falls back to progression.js if unavailable.
 */
export function useRaiderIO() {
  /** @type {import('vue').Ref<Raid[]>} */
  const raids = ref(fallbackRaids)
  /** @type {import('vue').Ref<ProgressSummary>} */
  const summary = ref(computeSummary(fallbackRaids))
  const loading = ref(true)

  async function fetchProgression() {
    const cached = getCached()
    if (cached) {
      raids.value = cached
      summary.value = computeSummary(cached)
      loading.value = false
      return
    }

    try {
      const staticRes = await fetch(`${API_BASE}/raiding/static-data?expansion_id=11`)
      if (!staticRes.ok) {
        loading.value = false
        return
      }

      const staticData = await staticRes.json()
      const currentRaid = staticData.raids?.[0]
      if (!currentRaid) {
        loading.value = false
        return
      }

      const [normalKills, heroicKills] = await Promise.all([
        fetchDefeatedEncounters(currentRaid.slug, 'normal'),
        fetchDefeatedEncounters(currentRaid.slug, 'heroic'),
      ])

      const built = buildRaids(currentRaid, normalKills, heroicKills)
      raids.value = built
      summary.value = computeSummary(built)
      setCache(built)
    } catch {
      // Keep fallback data
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchProgression)

  return { raids, summary, loading }
}
