import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useBuffAnalysis } from '../useBuffAnalysis.js'

function makeSubmission(className, specName) {
  return {
    discordId: `${className}-${specName}`,
    discordUsername: 'TestUser',
    characterName: 'TestChar',
    className,
    specName,
    submittedAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }
}

describe('useBuffAnalysis', () => {
  it('returns all buffs as missing when submissions is empty', () => {
    const submissions = ref([])
    const { missingBuffs, coveredBuffs, roleCounts } = useBuffAnalysis(submissions)

    expect(coveredBuffs.value).toHaveLength(0)
    expect(missingBuffs.value.length).toBeGreaterThan(0)
    expect(roleCounts.value).toEqual({ tank: 0, healer: 0, melee: 0, ranged: 0 })
  })

  it('marks a buff as covered when a class that provides it is submitted', () => {
    const submissions = ref([makeSubmission('warrior', 'arms')])
    const { coveredBuffs, missingBuffs } = useBuffAnalysis(submissions)

    const coveredNames = coveredBuffs.value.map((b) => b.name)
    expect(coveredNames).toContain('Battle Shout')

    const missingNames = missingBuffs.value.map((b) => b.name)
    expect(missingNames).not.toContain('Battle Shout')
  })

  it('counts roles correctly', () => {
    const submissions = ref([
      makeSubmission('warrior', 'protection'),
      makeSubmission('priest', 'holy'),
      makeSubmission('mage', 'fire'),
      makeSubmission('rogue', 'assassination'),
    ])
    const { roleCounts } = useBuffAnalysis(submissions)

    expect(roleCounts.value).toEqual({ tank: 1, healer: 1, melee: 1, ranged: 1 })
  })

  it('handles a class that provides multiple buffs', () => {
    const submissions = ref([makeSubmission('shaman', 'elemental')])
    const { coveredBuffs } = useBuffAnalysis(submissions)

    const coveredNames = coveredBuffs.value.map((b) => b.name)
    expect(coveredNames).toContain('Bloodlust / Heroism')
    expect(coveredNames).toContain('Skyfury')
  })

  it('does not double-count a buff when two classes provide it', () => {
    const submissions = ref([makeSubmission('shaman', 'elemental'), makeSubmission('mage', 'fire')])
    const { coveredBuffs } = useBuffAnalysis(submissions)

    const bloodlustEntries = coveredBuffs.value.filter((b) => b.name === 'Bloodlust / Heroism')
    expect(bloodlustEntries).toHaveLength(1)
  })

  it('reacts to submission changes', () => {
    const submissions = ref([])
    const { coveredBuffs, roleCounts } = useBuffAnalysis(submissions)

    expect(coveredBuffs.value).toHaveLength(0)
    expect(roleCounts.value.tank).toBe(0)

    submissions.value = [makeSubmission('warrior', 'protection')]

    expect(coveredBuffs.value.map((b) => b.name)).toContain('Battle Shout')
    expect(roleCounts.value.tank).toBe(1)
  })
})
