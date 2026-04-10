import { describe, it, expect, vi, beforeEach } from 'vitest'

/** Shared mock — mutated in-place between tests */
const mockStatsData = {
  zone: 'Test Zone',
  stats: {
    mostDeaths: null,
    ironRaider: null,
    highestDamageDone: null,
    highestDamageDoneMplus: null,
    bestHealer: null,
    bestHealerMplus: null,
  },
}

vi.mock('@/data/wcl-stats.json', () => ({ default: mockStatsData }))

const { useRaidStats } = await import('../useRaidStats')

describe('useRaidStats', () => {
  beforeEach(() => {
    mockStatsData.zone = 'Test Zone'
    mockStatsData.stats.mostDeaths = null
    mockStatsData.stats.ironRaider = null
    mockStatsData.stats.highestDamageDone = null
    mockStatsData.stats.highestDamageDoneMplus = null
    mockStatsData.stats.bestHealer = null
    mockStatsData.stats.bestHealerMplus = null
  })

  it('returns zone and stats from data', () => {
    mockStatsData.stats.mostDeaths = { name: 'Tank', class: 'warrior', count: 42 }
    const result = useRaidStats()

    expect(result.zone).toBe('Test Zone')
    expect(result.stats.mostDeaths).toEqual({ name: 'Tank', class: 'warrior', count: 42 })
  })

  it('sets hasData to false when all stats are null', () => {
    const result = useRaidStats()
    expect(result.hasData).toBe(false)
  })

  it('sets hasData to true when at least one stat is present', () => {
    mockStatsData.stats.ironRaider = { name: 'Survivor', class: 'paladin', killsAttended: 30 }
    const result = useRaidStats()
    expect(result.hasData).toBe(true)
  })

  it('detects hasData for each individual stat field', () => {
    const statFields = [
      ['mostDeaths', { name: 'A', class: 'warrior', count: 1 }],
      ['ironRaider', { name: 'B', class: 'paladin', killsAttended: 1 }],
      ['highestDamageDone', { name: 'C', class: 'mage', amount: 100, boss: 'X' }],
      ['highestDamageDoneMplus', { name: 'D', class: 'rogue', amount: 200, boss: 'Y' }],
      ['bestHealer', { name: 'E', class: 'priest', amount: 300, boss: 'Z' }],
      ['bestHealerMplus', { name: 'F', class: 'druid', amount: 400, boss: 'W' }],
    ]

    for (const [field, value] of statFields) {
      // Reset all to null
      for (const key of Object.keys(mockStatsData.stats)) {
        mockStatsData.stats[key] = null
      }
      mockStatsData.stats[field] = value

      const result = useRaidStats()
      expect(result.hasData, `hasData should be true when ${field} is set`).toBe(true)
    }
  })
})
