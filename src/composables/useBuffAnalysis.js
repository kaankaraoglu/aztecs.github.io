import { computed } from 'vue'
import { WOW_CLASSES, RAID_BUFFS } from '@/data/wow-classes.js'

/**
 * @typedef {import('@/data/wow-classes.js').BuffDef} BuffDef
 * @typedef {BuffDef & { count: number }} CoveredBuff
 *
 * @param {import('vue').Ref<Array<{ className: string, specName: string }>>} submissions
 * @returns {{
 *   coveredBuffs: import('vue').ComputedRef<CoveredBuff[]>,
 *   missingBuffs: import('vue').ComputedRef<BuffDef[]>,
 *   roleCounts: import('vue').ComputedRef<{ tank: number, healer: number, melee: number, ranged: number }>
 * }}
 */
export function useBuffAnalysis(submissions) {
  /**
   * How many signed-up players actually bring each buff.
   *
   * Counted per spec, not per class: `RAID_BUFFS[x].classes` says which classes
   * can bring a buff, but several are spec-locked (Abomination Limb and
   * Gorefiend's Grasp are Blood-only), so a Frost death knight used to mark
   * both as covered.
   * @type {import('vue').ComputedRef<Map<string, number>>}
   */
  const buffProviderCounts = computed(() => {
    const counts = new Map()
    for (const s of submissions.value) {
      const specDef = WOW_CLASSES[s.className]?.specs?.[s.specName]
      if (!specDef) continue
      for (const buffKey of specDef.buffs ?? []) {
        counts.set(buffKey, (counts.get(buffKey) || 0) + 1)
      }
    }
    return counts
  })

  const coveredBuffs = computed(() =>
    Object.entries(RAID_BUFFS)
      .filter(([key]) => (buffProviderCounts.value.get(key) || 0) > 0)
      .map(([key, buff]) => ({ ...buff, count: buffProviderCounts.value.get(key) })),
  )

  const missingBuffs = computed(() =>
    Object.entries(RAID_BUFFS)
      .filter(([key]) => (buffProviderCounts.value.get(key) || 0) === 0)
      .map(([, buff]) => buff),
  )

  const roleCounts = computed(() => {
    const counts = { tank: 0, healer: 0, melee: 0, ranged: 0 }
    for (const sub of submissions.value) {
      const classDef = WOW_CLASSES[sub.className]
      if (!classDef) continue
      const specDef = classDef.specs[sub.specName]
      if (!specDef) continue
      counts[specDef.role]++
    }
    return counts
  })

  return { coveredBuffs, missingBuffs, roleCounts }
}
