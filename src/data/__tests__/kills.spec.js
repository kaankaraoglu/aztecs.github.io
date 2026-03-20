import { describe, it, expect } from 'vitest'
import { kills } from '../kills.js'

describe('kills data', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(kills)).toBe(true)
    expect(kills.length).toBeGreaterThan(0)
  })

  it('each kill has required fields', () => {
    for (const kill of kills) {
      expect(kill).toHaveProperty('raidName')
      expect(kill).toHaveProperty('imageUrl')
      expect(kill).toHaveProperty('date')
    }
  })

  it('kills are sorted newest first', () => {
    for (let i = 1; i < kills.length; i++) {
      const prev = new Date(kills[i - 1].date)
      const curr = new Date(kills[i].date)
      expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime())
    }
  })
})
