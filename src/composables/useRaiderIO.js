import { ref, onMounted } from 'vue'
import { raids as fallbackRaids } from '@/data/progression.js'

const API_BASE = 'https://raider.io/api/v1'
const GUILD_URL = `${API_BASE}/guilds/profile?region=eu&realm=al-akir&name=Aztecs&fields=raid_progression`
const CACHE_KEY = 'raiderio_raid_progression'
const CACHE_DURATION = 60 * 60 * 1000

/**
 * Maps Raider.IO encounter slugs to the raid instance they belong to.
 * The Midnight tier (tier-mn-1) has 9 bosses across 3 raid instances.
 * Boss order within each instance determines which bosses are marked killed
 * based on aggregate kill counts from the API.
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
 * Fetches the static raid data for the current expansion to get encounter
 * display names, then fetches guild progression to get kill counts.
 * Combines them into the Raid[] shape that RaidProgressionBox expects.
 *
 * @param {object} staticRaid - Static raid data from Raider.IO
 * @param {object} guildTier - Guild progression for the tier
 * @returns {Raid[]}
 */
function buildRaids(staticRaid, guildTier) {
  const encounterNames = new Map(staticRaid.encounters.map((e) => [e.slug, e.name]))

  const normalKilled = guildTier.normal_bosses_killed
  const heroicKilled = guildTier.heroic_bosses_killed

  // Raider.IO gives aggregate counts, not per-boss. We distribute kills
  // across raid instances in encounter order (matching how raids are
  // typically progressed).
  let normalCount = 0
  let heroicCount = 0

  return RAID_INSTANCES.map((instance) => ({
    name: instance.name,
    bosses: instance.encounters.map((slug) => {
      const boss = {
        name: encounterNames.get(slug) || slug,
        normal: normalCount < normalKilled,
        heroic: heroicCount < heroicKilled,
      }
      normalCount++
      heroicCount++
      return boss
    }),
  }))
}

/**
 * Composable that provides live raid progression data from Raider.IO.
 * Falls back to static data from progression.js if the API is unavailable.
 */
export function useRaiderIO() {
  /** @type {import('vue').Ref<Raid[]>} */
  const raids = ref(fallbackRaids)
  const loading = ref(true)

  async function fetchProgression() {
    const cached = getCached()
    if (cached) {
      raids.value = cached
      loading.value = false
      return
    }

    try {
      const [staticRes, guildRes] = await Promise.all([
        fetch(`${API_BASE}/raiding/static-data?expansion_id=11`),
        fetch(GUILD_URL),
      ])

      if (!staticRes.ok || !guildRes.ok) {
        loading.value = false
        return
      }

      const staticData = await staticRes.json()
      const guildData = await guildRes.json()

      const currentRaid = staticData.raids?.[0]
      const tierSlug = currentRaid?.slug
      const guildTier = guildData.raid_progression?.[tierSlug]

      if (!currentRaid || !guildTier) {
        loading.value = false
        return
      }

      const built = buildRaids(currentRaid, guildTier)
      raids.value = built
      setCache(built)
    } catch {
      // Keep fallback data
    } finally {
      loading.value = false
    }
  }

  onMounted(fetchProgression)

  return { raids, loading }
}
