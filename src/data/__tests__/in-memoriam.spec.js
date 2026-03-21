import { describe, it, expect } from 'vitest'
import { memorials } from '../in-memoriam.js'

describe('in memoriam data', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(memorials)).toBe(true)
    expect(memorials.length).toBeGreaterThan(0)
  })

  it('each memorial has required fields', () => {
    for (const memorial of memorials) {
      expect(memorial).toHaveProperty('name')
      expect(memorial).toHaveProperty('class')
      expect(memorial).toHaveProperty('server')
      expect(typeof memorial.name).toBe('string')
      expect(typeof memorial.class).toBe('string')
      expect(typeof memorial.server).toBe('string')
    }
  })
})
