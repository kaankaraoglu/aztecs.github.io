import { describe, it, expect } from 'vitest'
import { tierHistory } from '../tier-history.js'

describe('tier history data', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(tierHistory)).toBe(true)
    expect(tierHistory.length).toBeGreaterThan(0)
  })

  it('each tier has required fields', () => {
    for (const tier of tierHistory) {
      expect(tier).toHaveProperty('tier')
      expect(tier).toHaveProperty('expansion')
      expect(tier).toHaveProperty('bosses')
      expect(tier).toHaveProperty('progress')
    }
  })

  it('tiers are sorted newest first', () => {
    for (let i = 1; i < tierHistory.length; i++) {
      const prev = new Date(tierHistory[i - 1].dates.start)
      const curr = new Date(tierHistory[i].dates.start)
      expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime())
    }
  })
})
