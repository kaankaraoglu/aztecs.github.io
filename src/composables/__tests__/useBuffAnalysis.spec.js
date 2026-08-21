import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useBuffAnalysis } from '../useBuffAnalysis.js'
import { RAID_BUFFS } from '@/data/wow-classes.js'

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
    expect(coveredNames).toContain('Bloodlust')
    expect(coveredNames).toContain('Skyfury')
  })

  it('does not double-count a buff when two classes provide it', () => {
    const submissions = ref([makeSubmission('shaman', 'elemental'), makeSubmission('mage', 'fire')])
    const { coveredBuffs } = useBuffAnalysis(submissions)

    const bloodlustEntries = coveredBuffs.value.filter((b) => b.name === 'Bloodlust')
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

  it('does not cover Blood-only buffs for a frost death knight', () => {
    const submissions = ref([makeSubmission('deathKnight', 'frost')])
    const { coveredBuffs, missingBuffs } = useBuffAnalysis(submissions)

    const coveredNames = coveredBuffs.value.map((b) => b.name)
    const missingNames = missingBuffs.value.map((b) => b.name)

    expect(coveredNames).toContain('Death Grip')
    expect(coveredNames).not.toContain('Abomination Limb')
    expect(coveredNames).not.toContain("Gorefiend's Grasp")
    expect(missingNames).toContain('Abomination Limb')
    expect(missingNames).toContain("Gorefiend's Grasp")
  })

  it('does not cover Blood-only buffs for an unholy death knight', () => {
    const submissions = ref([makeSubmission('deathKnight', 'unholy')])
    const { missingBuffs } = useBuffAnalysis(submissions)

    const missingNames = missingBuffs.value.map((b) => b.name)
    expect(missingNames).toContain('Abomination Limb')
    expect(missingNames).toContain("Gorefiend's Grasp")
  })

  it('covers Blood-only buffs for a blood death knight', () => {
    const submissions = ref([makeSubmission('deathKnight', 'blood')])
    const { coveredBuffs, missingBuffs } = useBuffAnalysis(submissions)

    const coveredNames = coveredBuffs.value.map((b) => b.name)
    expect(coveredNames).toContain('Abomination Limb')
    expect(coveredNames).toContain("Gorefiend's Grasp")
    expect(coveredNames).toContain('Death Grip')

    const missingNames = missingBuffs.value.map((b) => b.name)
    expect(missingNames).not.toContain('Abomination Limb')
    expect(missingNames).not.toContain("Gorefiend's Grasp")
  })

  it('counts how many players bring each buff', () => {
    const submissions = ref([
      makeSubmission('priest', 'holy'),
      makeSubmission('priest', 'shadow'),
      makeSubmission('warrior', 'arms'),
    ])
    const { coveredBuffs } = useBuffAnalysis(submissions)

    const byName = Object.fromEntries(coveredBuffs.value.map((b) => [b.name, b.count]))
    expect(byName['Power Word: Fortitude']).toBe(2)
    expect(byName['Power Infusion']).toBe(2)
    expect(byName['Battle Shout']).toBe(1)
  })

  it('counts each spec that brings a shared buff, across classes', () => {
    const submissions = ref([
      makeSubmission('shaman', 'restoration'),
      makeSubmission('mage', 'frost'),
      makeSubmission('evoker', 'augmentation'),
    ])
    const { coveredBuffs } = useBuffAnalysis(submissions)

    const bloodlust = coveredBuffs.value.find((b) => b.name === 'Bloodlust')
    expect(bloodlust.count).toBe(3)

    const skyfury = coveredBuffs.value.find((b) => b.name === 'Skyfury')
    expect(skyfury.count).toBe(1)
  })

  it('ignores submissions with an unknown class or spec', () => {
    const submissions = ref([
      makeSubmission('bard', 'lute'),
      makeSubmission('deathKnight', 'holy'),
      makeSubmission('warrior', 'arms'),
    ])
    const { coveredBuffs, roleCounts } = useBuffAnalysis(submissions)

    expect(coveredBuffs.value.map((b) => b.name)).toEqual(['Battle Shout'])
    expect(coveredBuffs.value[0].count).toBe(1)
    expect(roleCounts.value).toEqual({ tank: 0, healer: 0, melee: 1, ranged: 0 })
  })

  it('accounts for every raid buff across covered and missing', () => {
    const submissions = ref([
      makeSubmission('deathKnight', 'blood'),
      makeSubmission('priest', 'discipline'),
      makeSubmission('bard', 'lute'),
    ])
    const { coveredBuffs, missingBuffs } = useBuffAnalysis(submissions)

    const allNames = Object.values(RAID_BUFFS).map((b) => b.name)
    const seen = [
      ...coveredBuffs.value.map((b) => b.name),
      ...missingBuffs.value.map((b) => b.name),
    ]

    expect(seen).toHaveLength(allNames.length)
    expect([...seen].sort()).toEqual([...allNames].sort())
  })

  it('tallies roles for several players of the same role', () => {
    const submissions = ref([
      makeSubmission('deathKnight', 'blood'),
      makeSubmission('monk', 'brewmaster'),
      makeSubmission('druid', 'restoration'),
      makeSubmission('deathKnight', 'unholy'),
      makeSubmission('demonHunter', 'havoc'),
      makeSubmission('warlock', 'affliction'),
      makeSubmission('demonHunter', 'devourer'),
    ])
    const { roleCounts } = useBuffAnalysis(submissions)

    expect(roleCounts.value).toEqual({ tank: 2, healer: 1, melee: 2, ranged: 2 })
  })
})
