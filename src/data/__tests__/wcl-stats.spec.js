import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const jsonPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'wcl-stats.json')
const exists = existsSync(jsonPath)

describe.skipIf(!exists)('WCL stats data', () => {
  /** @type {any} */
  let data
  beforeAll(() => {
    data = JSON.parse(readFileSync(jsonPath, 'utf-8'))
  })

  it('has required top-level fields', () => {
    expect(data).toHaveProperty('zone')
    expect(data).toHaveProperty('stats')
    expect(data.stats).toHaveProperty('mostDeaths')
    expect(data.stats).toHaveProperty('ironRaider')
    expect(data.stats).toHaveProperty('highestDamageDone')
    expect(data.stats).toHaveProperty('highestDamageDoneMplus')
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

  it('highestDamageDoneMplus has name, class, amount, and dungeon when present', () => {
    if (data.stats.highestDamageDoneMplus) {
      expect(data.stats.highestDamageDoneMplus).toHaveProperty('name')
      expect(data.stats.highestDamageDoneMplus).toHaveProperty('amount')
      expect(data.stats.highestDamageDoneMplus).toHaveProperty('dungeon')
    }
  })
})
