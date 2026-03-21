import { describe, it, expect } from 'vitest'
import data from '../rio-mythicplus.json'

describe('M+ data', () => {
  it('has required top-level fields', () => {
    expect(data).toHaveProperty('season')
    expect(data).toHaveProperty('topRunners')
    expect(data).toHaveProperty('dungeonBests')
    expect(Array.isArray(data.topRunners)).toBe(true)
    expect(Array.isArray(data.dungeonBests)).toBe(true)
  })

  it('each runner has name, class, and score', () => {
    for (const runner of data.topRunners) {
      expect(runner).toHaveProperty('name')
      expect(runner).toHaveProperty('class')
      expect(runner).toHaveProperty('score')
    }
  })

  it('each dungeon best has dungeon and level', () => {
    for (const best of data.dungeonBests) {
      expect(best).toHaveProperty('dungeon')
      expect(best).toHaveProperty('level')
    }
  })
})
