import { ref } from 'vue'
import { raids as fallbackRaids } from '@/data/progression.js'
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
 * @typedef {{ name: string, bosses: Boss[] }} Raid
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

  /** @type {import('vue').Ref<Raid[]>} */
  const raids = ref(hasWclData ? wclData.raids : fallbackRaids)
  /** @type {import('vue').Ref<ProgressSummary>} */
  const summary = ref(hasWclData ? wclData.summary : computeSummary(fallbackRaids))
  const latestReport = hasWclData ? wclData.latestReport || null : null
  // When true, the mythic tier is relabelled "MX" / "Mythic Flex" in the UI.
  // Only set on the new raid's zone data; falls back to false everywhere else.
  const mythicFlex = hasWclData ? (wclData.mythicFlex ?? false) : false

  return { raids, summary, latestReport, mythicFlex }
}
