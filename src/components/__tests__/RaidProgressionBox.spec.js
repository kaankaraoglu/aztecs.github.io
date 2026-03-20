import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RaidProgressionBox from '../RaidProgressionBox.vue'

describe('RaidProgressionBox', () => {
  const mockRaid = {
    name: 'Test Raid',
    bosses: [
      { name: 'Boss 1', normal: true, heroic: false },
      { name: 'Boss 2', normal: false, heroic: false },
    ],
  }

  it('renders the raid name', () => {
    const wrapper = mount(RaidProgressionBox, { props: { raid: mockRaid } })
    expect(wrapper.text()).toContain('Test Raid')
  })

  it('renders all bosses', () => {
    const wrapper = mount(RaidProgressionBox, { props: { raid: mockRaid } })
    expect(wrapper.text()).toContain('Boss 1')
    expect(wrapper.text()).toContain('Boss 2')
  })

  it('shows kill mark for killed bosses', () => {
    const wrapper = mount(RaidProgressionBox, { props: { raid: mockRaid } })
    // The skull emoji should appear for normal-killed boss
    expect(wrapper.html()).toContain('💀')
  })

  it('shows no-progress message when bosses array is empty', () => {
    const emptyRaid = { name: 'Empty Raid', bosses: [] }
    const wrapper = mount(RaidProgressionBox, { props: { raid: emptyRaid } })
    expect(wrapper.text()).toContain('No progression yet')
  })
})
