import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RaidProgressionBox from '../RaidProgressionBox.vue'

describe('RaidProgressionBox', () => {
  const mockRaids = [
    {
      name: 'Test Raid',
      bosses: [
        {
          name: 'Boss 1',
          normal: true,
          heroic: false,
          killedAt: '2026-03-18T19:29:48.000Z',
          pulls: 3,
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
          pulls: 5,
          bestPercent: 12.3,
        },
      ],
    },
    {
      name: 'Other Raid',
      bosses: [{ name: 'Boss 3', normal: true, heroic: true }],
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

  it('hides summary when no kills', () => {
    const emptySummary = { total: 2, normal: 0, heroic: 0, mythic: 0 }
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: emptySummary },
    })
    expect(wrapper.find('.summary').exists()).toBe(false)
  })

  it('shows kill date and pull count', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('18 Mar')
    expect(wrapper.text()).toContain('3p')
  })

  it('shows best percent for unkilled bosses', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('12.3%')
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
