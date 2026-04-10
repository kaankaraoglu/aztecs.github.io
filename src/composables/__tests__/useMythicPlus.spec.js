import { describe, it, expect, vi } from 'vitest'

const mockMpData = {
  season: 'season-test-1',
  topRunners: [{ name: 'TestRunner', class: 'warrior', score: 3000, topKeys: ['+15 SR'] }],
  dungeonBests: [{ dungeon: 'Test Dungeon', level: 15, timed: true, team: ['TestRunner'] }],
  lastUpdated: '2026-01-01T00:00:00Z',
}

vi.mock('@/data/rio-mythicplus.json', () => ({ default: mockMpData }))

describe('useMythicPlus', () => {
  it('returns season, runners, dungeon bests, and lastUpdated from data', async () => {
    const { useMythicPlus } = await import('../useMythicPlus')
    const result = useMythicPlus()

    expect(result.season).toBe('season-test-1')
    expect(result.topRunners).toEqual(mockMpData.topRunners)
    expect(result.dungeonBests).toEqual(mockMpData.dungeonBests)
    expect(result.lastUpdated).toBe('2026-01-01T00:00:00Z')
  })

  it('sets hasData to true when topRunners is non-empty', async () => {
    const { useMythicPlus } = await import('../useMythicPlus')
    const result = useMythicPlus()

    expect(result.hasData).toBe(true)
  })

  it('sets hasData to false when topRunners is empty', async () => {
    mockMpData.topRunners = []
    // Re-import to pick up the changed mock data
    vi.resetModules()
    vi.mock('@/data/rio-mythicplus.json', () => ({ default: mockMpData }))
    const { useMythicPlus } = await import('../useMythicPlus')
    const result = useMythicPlus()

    expect(result.hasData).toBe(false)

    // Restore for other tests
    mockMpData.topRunners = [
      { name: 'TestRunner', class: 'warrior', score: 3000, topKeys: ['+15 SR'] },
    ]
  })

  it('returns null for lastUpdated when not present in data', async () => {
    const original = mockMpData.lastUpdated
    delete mockMpData.lastUpdated
    vi.resetModules()
    vi.mock('@/data/rio-mythicplus.json', () => ({ default: mockMpData }))
    const { useMythicPlus } = await import('../useMythicPlus')
    const result = useMythicPlus()

    expect(result.lastUpdated).toBeNull()

    mockMpData.lastUpdated = original
  })
})
