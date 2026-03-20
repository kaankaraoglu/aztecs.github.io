import { describe, it, expect } from 'vitest'
import { raids, killMark } from '../progression.js'

describe('progression data', () => {
  it('raids is a non-empty array', () => {
    expect(Array.isArray(raids)).toBe(true)
    expect(raids.length).toBeGreaterThan(0)
  })

  it('each raid has name and bosses', () => {
    for (const raid of raids) {
      expect(raid).toHaveProperty('name')
      expect(raid).toHaveProperty('bosses')
      expect(Array.isArray(raid.bosses)).toBe(true)
    }
  })

  it('each boss has name, normal, and heroic fields', () => {
    for (const raid of raids) {
      for (const boss of raid.bosses) {
        expect(boss).toHaveProperty('name')
        expect(boss).toHaveProperty('normal')
        expect(boss).toHaveProperty('heroic')
      }
    }
  })
})

describe('killMark', () => {
  it('returns skull emoji for true', () => {
    expect(killMark(true)).toBe('💀')
  })

  it('returns dash for false', () => {
    expect(killMark(false)).toBe('-')
  })
})
