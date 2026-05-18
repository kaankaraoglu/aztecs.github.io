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
  const coveredBuffs = computed(() => {
    const classCounts = new Map()
    for (const s of submissions.value) {
      classCounts.set(s.className, (classCounts.get(s.className) || 0) + 1)
    }

    return Object.values(RAID_BUFFS)
      .filter((buff) => buff.classes.some((cls) => classCounts.has(cls)))
      .map((buff) => ({
        ...buff,
        count: buff.classes.reduce((sum, cls) => sum + (classCounts.get(cls) || 0), 0),
      }))
  })

  const missingBuffs = computed(() => {
    const submittedClasses = new Set(submissions.value.map((s) => s.className))

    return Object.values(RAID_BUFFS).filter(
      (buff) => !buff.classes.some((cls) => submittedClasses.has(cls)),
    )
  })

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
