import { describe, it, expect, vi, beforeEach } from 'vitest'

/** Shared mock — mutated in-place between tests, read by the composable on each call */
const mockMpData = {
  season: 'season-test-1',
  topRunners: [{ name: 'TestRunner', class: 'warrior', score: 3000, topKeys: ['+15 SR'] }],
  dungeonBests: [{ dungeon: 'Test Dungeon', level: 15, timed: true, team: ['TestRunner'] }],
  lastUpdated: '2026-01-01T00:00:00Z',
}

vi.mock('@/data/rio-mythicplus.json', () => ({ default: mockMpData }))

// Hoist import — the mock above intercepts this regardless of whether the JSON exists on disk
const { useMythicPlus } = await import('../useMythicPlus')

describe('useMythicPlus', () => {
  beforeEach(() => {
    // Restore to populated defaults
    mockMpData.season = 'season-test-1'
    mockMpData.topRunners = [
      { name: 'TestRunner', class: 'warrior', score: 3000, topKeys: ['+15 SR'] },
    ]
    mockMpData.dungeonBests = [
      { dungeon: 'Test Dungeon', level: 15, timed: true, team: ['TestRunner'] },
    ]
    mockMpData.lastUpdated = '2026-01-01T00:00:00Z'
  })

  it('returns season, runners, dungeon bests, and lastUpdated from data', () => {
    const result = useMythicPlus()

    expect(result.season).toBe('season-test-1')
    expect(result.topRunners).toEqual(mockMpData.topRunners)
    expect(result.dungeonBests).toEqual(mockMpData.dungeonBests)
    expect(result.lastUpdated).toBe('2026-01-01T00:00:00Z')
  })

  it('sets hasData to true when topRunners is non-empty', () => {
    const result = useMythicPlus()
    expect(result.hasData).toBe(true)
  })

  it('sets hasData to false when topRunners is empty', () => {
    mockMpData.topRunners = []
    const result = useMythicPlus()
    expect(result.hasData).toBe(false)
  })

  it('returns null for lastUpdated when not present in data', () => {
    delete mockMpData.lastUpdated
    const result = useMythicPlus()
    expect(result.lastUpdated).toBeNull()
  })
})
