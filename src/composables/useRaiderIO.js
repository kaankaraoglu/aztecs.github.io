import { ref, onMounted } from 'vue'
import { raids as fallbackRaids } from '@/data/progression.js'

const API_BASE = 'https://raider.io/api/v1'
const CACHE_KEY = 'raiderio_boss_progression_v2'
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
 * @typedef {{
 *   name: string,
 *   normal: boolean,
 *   heroic: boolean,
 *   killedAt?: string,
 *   pulls?: number,
 *   bestPercent?: number
 * }} Boss
 *
 * @typedef {{ name: string, bosses: Boss[] }} Raid
 * @typedef {{ total: number, normal: number, heroic: number, mythic: number }} ProgressSummary
 *
 * @typedef {{
 *   defeated: Map<string, { firstDefeated: string }>,
 *   pulled: Map<string, { numPulls: number, bestPercent: number, isDefeated: boolean }>
 * }} GuildRaidData
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
 * Returns full encounter data including kills, pulls, and best percent.
 *
 * @param {string} raidSlug
 * @param {string} difficulty
 * @returns {Promise<GuildRaidData>}
 */
async function fetchGuildRaidData(raidSlug, difficulty) {
  const empty = { defeated: new Map(), pulled: new Map() }

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
      const defeated = new Map((guild.encountersDefeated || []).map((e) => [e.slug, e]))
      const pulled = new Map((guild.encountersPulled || []).map((e) => [e.slug, e]))
      return { defeated, pulled }
    }
  }
  return empty
}

/**
 * Builds the Raid[] data by combining static encounter names with
 * per-boss kill/pull data from the raid-rankings endpoint.
 *
 * @param {{ encounters: { slug: string, name: string }[] }} staticRaid
 * @param {GuildRaidData} normalData
 * @param {GuildRaidData} heroicData
 * @returns {Raid[]}
 */
function buildRaids(staticRaid, normalData, heroicData) {
  const encounterNames = new Map(staticRaid.encounters.map((e) => [e.slug, e.name]))

  return RAID_INSTANCES.map((instance) => ({
    name: instance.name,
    bosses: instance.encounters.map((slug) => {
      const normalKill = normalData.defeated.get(slug)
      const heroicKill = heroicData.defeated.get(slug)
      const normalPull = normalData.pulled.get(slug)

      return {
        name: encounterNames.get(slug) || slug,
        normal: !!normalKill,
        heroic: !!heroicKill,
        killedAt: normalKill?.firstDefeated || heroicKill?.firstDefeated || undefined,
        pulls: normalPull?.numPulls || undefined,
        bestPercent:
          normalPull && !normalPull.isDefeated && normalPull.bestPercent > 0
            ? normalPull.bestPercent
            : undefined,
      }
    }),
  }))
}

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

      const [normalData, heroicData] = await Promise.all([
        fetchGuildRaidData(currentRaid.slug, 'normal'),
        fetchGuildRaidData(currentRaid.slug, 'heroic'),
      ])

      const built = buildRaids(currentRaid, normalData, heroicData)
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
