import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isRef } from 'vue'

/** Shared mocks — mutated in-place between tests */
const mockWclData = {
  raids: [],
  summary: null,
  latestReport: null,
}

const mockFallbackRaids = [
  {
    name: 'Fallback Raid',
    bosses: [
      { name: 'Boss A', normal: true, heroic: false, mythic: false },
      { name: 'Boss B', normal: true, heroic: true, mythic: false },
    ],
  },
]

/** Mutated in-place per test to simulate announced-but-unlogged raids */
const mockUpcoming = []

vi.mock('@/data/wcl-progression.json', () => ({ default: mockWclData }))
vi.mock('@/data/progression.js', () => ({ raids: mockFallbackRaids }))
vi.mock('@/data/upcoming.js', () => ({ upcomingRaids: mockUpcoming }))

const { useProgression } = await import('../useProgression')

describe('useProgression', () => {
  beforeEach(() => {
    mockWclData.raids = []
    mockWclData.summary = null
    mockWclData.latestReport = null
    mockUpcoming.length = 0
  })

  it('falls back to static progression data when WCL data is empty', () => {
    const { raids, summary } = useProgression()

    expect(raids.value).toEqual(mockFallbackRaids)
    expect(summary.value).toEqual({
      total: 2,
      normal: 2,
      heroic: 1,
      mythic: 0,
    })
  })

  it('uses WCL data when raids are present', () => {
    mockWclData.raids = [
      {
        name: 'WCL Raid',
        bosses: [{ name: 'WCL Boss', normal: true, heroic: true, mythic: true }],
      },
    ]
    mockWclData.summary = { total: 1, normal: 1, heroic: 1, mythic: 1 }
    mockWclData.latestReport = 'https://warcraftlogs.com/reports/abc123'

    const { raids, summary, latestReport } = useProgression()

    expect(raids.value[0].name).toBe('WCL Raid')
    expect(summary.value).toEqual({ total: 1, normal: 1, heroic: 1, mythic: 1 })
    expect(latestReport).toBe('https://warcraftlogs.com/reports/abc123')
  })

  it('returns Vue refs for raids and summary', () => {
    const { raids, summary } = useProgression()

    expect(isRef(raids)).toBe(true)
    expect(isRef(summary)).toBe(true)
  })

  it('returns null latestReport when WCL data has no report', () => {
    const { latestReport } = useProgression()
    expect(latestReport).toBeNull()
  })

  it('prepends upcoming raids and counts them in the summary', () => {
    mockUpcoming.push({
      name: 'Sporefall',
      mythicFlex: true,
      bosses: [{ name: 'Rotmire', normal: false, heroic: false, mythic: false }],
    })

    const { raids, summary } = useProgression()

    // Upcoming raid shows first, ahead of the live/fallback raids
    expect(raids.value[0].name).toBe('Sporefall')
    expect(raids.value.map((r) => r.name)).toContain('Fallback Raid')
    // Its (unkilled) boss adds to the total but not to any difficulty count
    expect(summary.value).toEqual({ total: 3, normal: 2, heroic: 1, mythic: 0 })
  })

  it('computes fallback summary correctly with multiple bosses', () => {
    // WCL empty → falls back; fallback has 2 bosses (2 normal, 1 heroic, 0 mythic)
    const { summary } = useProgression()

    expect(summary.value.total).toBe(2)
    expect(summary.value.normal).toBe(2)
    expect(summary.value.heroic).toBe(1)
    expect(summary.value.mythic).toBe(0)
  })
})
