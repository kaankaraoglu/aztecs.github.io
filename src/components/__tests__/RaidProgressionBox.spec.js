import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RaidProgressionBox from '../RaidProgressionBox.vue'

const mockObserve = vi.fn()
const mockDisconnect = vi.fn()

vi.stubGlobal(
  'IntersectionObserver',
  vi.fn(() => ({ observe: mockObserve, disconnect: mockDisconnect, unobserve: vi.fn() })),
)

describe('RaidProgressionBox', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  const mockRaids = [
    {
      name: 'Test Raid',
      bosses: [
        {
          name: 'Boss 1',
          normal: true,
          heroic: false,
          killedAt: '2026-03-18T19:29:48.000Z',
          pullsByDifficulty: { normal: 3 },
          roster: {
            tanks: [{ name: 'Phruity', class: 'druid', spec: 'Guardian' }],
            healers: [{ name: 'Proto', class: 'evoker', spec: 'Preservation' }],
            dps: [{ name: 'Aurielle', class: 'paladin', spec: 'Retribution' }],
          },
        },
        {
          name: 'Boss 2',
          normal: false,
          heroic: false,
          pullsByDifficulty: { normal: 5 },
          bestPercent: 12.3,
        },
      ],
    },
    {
      name: 'Other Raid',
      bosses: [
        {
          name: 'Boss 3',
          normal: true,
          heroic: true,
          pullsByDifficulty: { normal: 2, heroic: 7 },
        },
      ],
    },
  ]

  const mockSummary = { total: 3, normal: 2, heroic: 1, mythic: 0 }

  it('renders all raid instance names', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('Test Raid')
    expect(wrapper.text()).toContain('Other Raid')
  })

  it('renders all bosses', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('Boss 1')
    expect(wrapper.text()).toContain('Boss 2')
    expect(wrapper.text()).toContain('Boss 3')
  })

  it('marks killed bosses with active pips', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    // Boss 1: N active. Boss 3: N + HC active = 3 active pips
    expect(wrapper.findAll('.pip.active').length).toBe(3)
  })

  it('dims unkilled bosses', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    const entries = wrapper.findAll('.boss-entry')
    // Boss 2 is unkilled — should not have .killed class
    expect(entries[1].classes()).not.toContain('killed')
  })

  it('shows summary pills when there are kills', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('2/3')
    expect(wrapper.text()).toContain('Normal')
  })

  it('shows all three difficulty pills even when kills are zero', () => {
    const emptySummary = { total: 2, normal: 0, heroic: 0, mythic: 0 }
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: emptySummary },
    })
    expect(wrapper.find('.summary').exists()).toBe(true)
    expect(wrapper.findAll('.summary-pill')).toHaveLength(3)
    expect(wrapper.find('.summary-pill.mythic').exists()).toBe(true)
  })

  it('shows kill date and per-difficulty pull counts', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('18 Mar')
    expect(wrapper.text()).toContain('Pulls: 3 N')
    expect(wrapper.text()).toContain('Pulls: 2 N & 7 HC')
  })

  it('shows best percent for unkilled bosses', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('12.3%')
  })

  it('gives expandable boss rows role=button, tabindex, and aria-expanded', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    const bossRows = wrapper.findAll('.boss-row')
    // Boss 1 has a roster → should be interactive
    expect(bossRows[0].attributes('role')).toBe('button')
    expect(bossRows[0].attributes('tabindex')).toBe('0')
    expect(bossRows[0].attributes('aria-expanded')).toBe('false')
    // Boss 2 has no roster → should not be interactive
    expect(bossRows[1].attributes('role')).toBeUndefined()
    expect(bossRows[1].attributes('tabindex')).toBeUndefined()
    expect(bossRows[1].attributes('aria-expanded')).toBeUndefined()
  })

  it('updates aria-expanded to true after toggle', async () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    const bossRow = wrapper.findAll('.boss-row')[0]
    expect(bossRow.attributes('aria-expanded')).toBe('false')
    await bossRow.trigger('click')
    expect(bossRow.attributes('aria-expanded')).toBe('true')
  })

  it('expands roster on Enter keydown', async () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.find('.roster-panel').exists()).toBe(false)
    await wrapper.findAll('.boss-row')[0].trigger('keydown.enter')
    expect(wrapper.find('.roster-panel').exists()).toBe(true)
  })

  it('expands roster on Space keydown', async () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.find('.roster-panel').exists()).toBe(false)
    await wrapper.findAll('.boss-row')[0].trigger('keydown.space')
    expect(wrapper.find('.roster-panel').exists()).toBe(true)
  })

  it('expands roster grouped by role on click', async () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.find('.roster-panel').exists()).toBe(false)

    await wrapper.findAll('.boss-row')[0].trigger('click')

    expect(wrapper.find('.roster-panel').exists()).toBe(true)
    expect(wrapper.findAll('.role-group').length).toBe(3)
    expect(wrapper.text()).toContain('Phruity')
    expect(wrapper.text()).toContain('Proto')
    expect(wrapper.text()).toContain('Aurielle')
  })
})
