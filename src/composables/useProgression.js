import { ref } from 'vue'
import { raids as fallbackRaids } from '@/data/progression.js'
import { upcomingRaids } from '@/data/upcoming.js'
import wclData from '@/data/wcl-progression.json'

/**
 * @typedef {{ name: string, class: string }} RosterPlayer
 *
 * @typedef {{
 *   name: string,
 *   normal: boolean,
 *   heroic: boolean,
 *   mythic?: boolean,
 *   killedAt?: string,
 *   pullsByDifficulty?: { normal?: number, heroic?: number, mythic?: number },
 *   bestPercent?: number,
 *   roster?: RosterPlayer[]
 * }} Boss
 *
 * @typedef {{ name: string, mythicFlex?: boolean, bosses: Boss[] }} Raid
 * @typedef {{ total: number, normal: number, heroic: number, mythic: number }} ProgressSummary
 */

/** @param {Raid[]} raids @returns {ProgressSummary} */
function computeSummary(raids) {
  const allBosses = raids.flatMap((r) => r.bosses)
  return {
    total: allBosses.length,
    normal: allBosses.filter((b) => b.normal).length,
    heroic: allBosses.filter((b) => b.heroic).length,
    mythic: allBosses.filter((b) => b.mythic).length,
  }
}

/**
 * Composable that provides raid progression data.
 *
 * Primary source: Warcraft Logs data fetched at build time (wcl-progression.json).
 * Fallback: static data from progression.js.
 */
export function useProgression() {
  const hasWclData = wclData.raids && wclData.raids.length > 0
  const baseRaids = hasWclData ? wclData.raids : fallbackRaids
  // Announced-but-unlogged tiers (e.g. Mythic Flex raids) show alongside live data.
  const allRaids = [...upcomingRaids, ...[...baseRaids].reverse()]

  /** @type {import('vue').Ref<Raid[]>} */
  const raids = ref(allRaids)
  /** @type {import('vue').Ref<ProgressSummary>} */
  const summary = ref(computeSummary(allRaids))
  const latestReport = hasWclData ? wclData.latestReport || null : null
  // When the raid data itself was last refreshed. The home page used to show
  // the Raider.IO M+ timestamp here, which could advertise a fresh fetch over
  // hours-old progression.
  const lastUpdated = hasWclData ? wclData.lastUpdated || null : null

  return { raids, summary, latestReport, lastUpdated }
}
