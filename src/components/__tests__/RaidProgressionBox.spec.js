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
      bosses: [
        {
          name: 'Boss 3',
          normal: true,
          heroic: true,
          killedAt: '2026-03-18T20:15:13.000Z',
          pulls: 1,
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

  it('renders all bosses across raids', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('Boss 1')
    expect(wrapper.text()).toContain('Boss 2')
    expect(wrapper.text()).toContain('Boss 3')
  })

  it('marks killed bosses with the killed class', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    const pips = wrapper.findAll('.pip.killed')
    expect(pips.length).toBe(3)
  })

  it('shows summary pills when there are kills', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('2/3')
    expect(wrapper.text()).toContain('Normal')
    expect(wrapper.text()).toContain('1/3')
    expect(wrapper.text()).toContain('Heroic')
  })

  it('hides summary when no kills', () => {
    const emptySummary = { total: 2, normal: 0, heroic: 0, mythic: 0 }
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: emptySummary },
    })
    expect(wrapper.find('.summary').exists()).toBe(false)
  })

  it('shows kill date for defeated bosses', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('18 Mar')
  })

  it('shows pull count', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('3 pulls')
    expect(wrapper.text()).toContain('1 pull')
  })

  it('shows best percent for unkilled bosses', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('Best: 12.3%')
  })
})
