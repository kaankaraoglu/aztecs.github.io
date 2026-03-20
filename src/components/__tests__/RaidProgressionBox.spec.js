import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RaidProgressionBox from '../RaidProgressionBox.vue'

describe('RaidProgressionBox', () => {
  const mockRaids = [
    {
      name: 'Test Raid',
      bosses: [
        { name: 'Boss 1', normal: true, heroic: false },
        { name: 'Boss 2', normal: false, heroic: false },
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
    // Boss 1: normal killed. Boss 3: normal + heroic killed = 3 killed pips
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
})
