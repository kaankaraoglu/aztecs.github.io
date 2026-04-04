import { describe, it, expect } from 'vitest'
import data from '../wcl-stats.json'

describe('WCL stats data', () => {
  it('has required top-level fields', () => {
    expect(data).toHaveProperty('zone')
    expect(data).toHaveProperty('stats')
    expect(data.stats).toHaveProperty('mostDeaths')
    expect(data.stats).toHaveProperty('ironRaider')
    expect(data.stats).toHaveProperty('highestDamageDone')
  })

  it('mostDeaths has name, class, and count when present', () => {
    if (data.stats.mostDeaths) {
      expect(data.stats.mostDeaths).toHaveProperty('name')
      expect(data.stats.mostDeaths).toHaveProperty('class')
      expect(data.stats.mostDeaths).toHaveProperty('count')
    }
  })

  it('highestDamageDone has name, class, amount, and boss when present', () => {
    if (data.stats.highestDamageDone) {
      expect(data.stats.highestDamageDone).toHaveProperty('name')
      expect(data.stats.highestDamageDone).toHaveProperty('amount')
      expect(data.stats.highestDamageDone).toHaveProperty('boss')
    }
  })
})
