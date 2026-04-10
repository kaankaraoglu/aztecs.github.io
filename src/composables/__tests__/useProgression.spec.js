import { describe, it, expect, vi, beforeEach } from 'vitest'
import { isRef } from 'vue'

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

vi.mock('@/data/wcl-progression.json', () => ({ default: mockWclData }))
vi.mock('@/data/progression.js', () => ({ raids: mockFallbackRaids }))

describe('useProgression', () => {
  beforeEach(() => {
    vi.resetModules()
    // Reset mock data to defaults
    mockWclData.raids = []
    mockWclData.summary = null
    mockWclData.latestReport = null
  })

  it('falls back to static progression data when WCL data is empty', async () => {
    const { useProgression } = await import('../useProgression')
    const { raids, summary } = useProgression()

    expect(raids.value).toEqual(mockFallbackRaids)
    expect(summary.value).toEqual({
      total: 2,
      normal: 2,
      heroic: 1,
      mythic: 0,
    })
  })

  it('uses WCL data when raids are present', async () => {
    mockWclData.raids = [
      {
        name: 'WCL Raid',
        bosses: [{ name: 'WCL Boss', normal: true, heroic: true, mythic: true }],
      },
    ]
    mockWclData.summary = { total: 1, normal: 1, heroic: 1, mythic: 1 }
    mockWclData.latestReport = 'https://warcraftlogs.com/reports/abc123'

    const { useProgression } = await import('../useProgression')
    const { raids, summary, latestReport } = useProgression()

    expect(raids.value[0].name).toBe('WCL Raid')
    expect(summary.value).toEqual({ total: 1, normal: 1, heroic: 1, mythic: 1 })
    expect(latestReport).toBe('https://warcraftlogs.com/reports/abc123')
  })

  it('returns Vue refs for raids, summary, and loading', async () => {
    const { useProgression } = await import('../useProgression')
    const { raids, summary, loading } = useProgression()

    expect(isRef(raids)).toBe(true)
    expect(isRef(summary)).toBe(true)
    expect(isRef(loading)).toBe(true)
    expect(loading.value).toBe(false)
  })

  it('returns null latestReport when WCL data has no report', async () => {
    const { useProgression } = await import('../useProgression')
    const { latestReport } = useProgression()

    expect(latestReport).toBeNull()
  })

  it('computes fallback summary correctly for multiple raids', async () => {
    mockFallbackRaids.push({
      name: 'Second Raid',
      bosses: [{ name: 'Boss C', normal: true, heroic: true, mythic: true }],
    })

    const { useProgression } = await import('../useProgression')
    const { summary } = useProgression()

    expect(summary.value).toEqual({
      total: 3,
      normal: 3,
      heroic: 2,
      mythic: 1,
    })

    // Clean up
    mockFallbackRaids.pop()
  })
})
