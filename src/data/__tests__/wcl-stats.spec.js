import { describe, it, expect } from 'vitest'
import data from '../wcl-stats.json'

describe('WCL stats data', () => {
  it('has required top-level fields', () => {
    expect(data).toHaveProperty('zone')
    expect(data).toHaveProperty('stats')
    expect(data.stats).toHaveProperty('mostDeaths')
    expect(data.stats).toHaveProperty('ironRaider')
    expect(data.stats).toHaveProperty('biggestHit')
  })

  it('mostDeaths has name, class, and count when present', () => {
    if (data.stats.mostDeaths) {
      expect(data.stats.mostDeaths).toHaveProperty('name')
      expect(data.stats.mostDeaths).toHaveProperty('class')
      expect(data.stats.mostDeaths).toHaveProperty('count')
    }
  })

  it('biggestHit has name, class, amount, ability, and boss when present', () => {
    if (data.stats.biggestHit) {
      expect(data.stats.biggestHit).toHaveProperty('name')
      expect(data.stats.biggestHit).toHaveProperty('amount')
      expect(data.stats.biggestHit).toHaveProperty('ability')
    }
  })
})
