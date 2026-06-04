import { describe, it, expect } from 'vitest'
import { upcomingRaids } from '../upcoming.js'

describe('upcoming raids data', () => {
  it('is an array', () => {
    expect(Array.isArray(upcomingRaids)).toBe(true)
  })

  it('each raid has a name and a non-empty bosses array', () => {
    for (const raid of upcomingRaids) {
      expect(typeof raid.name).toBe('string')
      expect(raid.name.length).toBeGreaterThan(0)
      expect(Array.isArray(raid.bosses)).toBe(true)
      expect(raid.bosses.length).toBeGreaterThan(0)
    }
  })

  it('each boss has name, normal, and heroic difficulty fields', () => {
    for (const raid of upcomingRaids) {
      for (const boss of raid.bosses) {
        expect(boss).toHaveProperty('name')
        expect(boss).toHaveProperty('normal')
        expect(boss).toHaveProperty('heroic')
      }
    }
  })

  it('includes Sporefall as a Mythic Flex raid with boss Rotmire', () => {
    const sporefall = upcomingRaids.find((r) => r.name === 'Sporefall')
    expect(sporefall).toBeDefined()
    expect(sporefall.mythicFlex).toBe(true)
    expect(sporefall.bosses.map((b) => b.name)).toContain('Rotmire')
  })
})
