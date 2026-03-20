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

  it('shows kill mark for killed bosses', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.html()).toContain('💀')
  })

  it('shows progress bars when there are kills', () => {
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: mockSummary },
    })
    expect(wrapper.text()).toContain('2/3 N')
    expect(wrapper.text()).toContain('1/3 HC')
  })

  it('hides progress bars when no kills', () => {
    const emptySummary = { total: 2, normal: 0, heroic: 0, mythic: 0 }
    const wrapper = mount(RaidProgressionBox, {
      props: { raids: mockRaids, summary: emptySummary },
    })
    expect(wrapper.find('.progress-bars').exists()).toBe(false)
  })
})
