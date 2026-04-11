import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import MythicPlusBox from '../MythicPlusBox.vue'

const mockComposable = {
  topRunners: [],
  dungeonBests: [],
  lastUpdated: null,
  hasData: false,
}

vi.mock('@/composables/useMythicPlus', () => ({
  useMythicPlus: () => mockComposable,
}))

function setMockData(overrides) {
  Object.assign(mockComposable, {
    topRunners: [],
    dungeonBests: [],
    lastUpdated: null,
    hasData: false,
    ...overrides,
  })
}

describe('MythicPlusBox', () => {
  it('shows empty state when no data', () => {
    setMockData({ hasData: false })
    const wrapper = mount(MythicPlusBox)
    expect(wrapper.find('.mp-empty').exists()).toBe(true)
    expect(wrapper.find('.mp-empty').text()).toBe('No M+ data yet this season.')
    expect(wrapper.find('.runners-list').exists()).toBe(false)
  })

  it('renders runners with name, score, and class', () => {
    setMockData({
      hasData: true,
      topRunners: [
        { name: 'Phruity', class: 'druid', score: 2400, topKeys: [] },
        { name: 'Proto', class: 'evoker', score: 2200, topKeys: [] },
      ],
    })
    const wrapper = mount(MythicPlusBox)
    const entries = wrapper.findAll('.runner-entry')
    expect(entries).toHaveLength(2)
    expect(entries[0].find('.runner-name').text()).toBe('Phruity')
    expect(entries[0].find('.runner-name').classes()).toContain('druid')
    expect(entries[0].find('.runner-score').text()).toBe('2400')
    expect(entries[0].find('.runner-rank').text()).toBe('1')
  })

  it('caps runners list at 10', () => {
    const runners = Array.from({ length: 12 }, (_, i) => ({
      name: `Runner${i}`,
      class: 'warrior',
      score: 2000 - i * 10,
      topKeys: [],
    }))
    setMockData({ hasData: true, topRunners: runners })
    const wrapper = mount(MythicPlusBox)
    expect(wrapper.findAll('.runner-entry')).toHaveLength(10)
  })

  it('renders top key badges for runners', () => {
    setMockData({
      hasData: true,
      topRunners: [
        { name: 'Phruity', class: 'druid', score: 2400, topKeys: ['+15 NW', '+14 SOA'] },
      ],
    })
    const wrapper = mount(MythicPlusBox)
    const keys = wrapper.findAll('.runner-key')
    expect(keys).toHaveLength(2)
    expect(keys[0].text()).toBe('+15 NW')
    expect(keys[1].text()).toBe('+14 SOA')
  })

  it('renders dungeon grid with level and timed status', () => {
    setMockData({
      hasData: true,
      dungeonBests: [
        { dungeon: 'The Necrotic Wake', level: 15, timed: true },
        { dungeon: 'Spires of Ascension', level: 12, timed: false },
      ],
    })
    const wrapper = mount(MythicPlusBox)
    const cells = wrapper.findAll('.dungeon-cell')
    expect(cells).toHaveLength(2)
    expect(cells[0].find('.dungeon-name').text()).toBe('The Necrotic Wake')
    expect(cells[0].find('.dungeon-level').text()).toBe('+15')
    expect(cells[0].find('.dungeon-timed').classes()).toContain('timed--yes')
    expect(cells[1].find('.dungeon-timed').classes()).toContain('timed--no')
  })

  it('shows updated timestamp when lastUpdated is valid', () => {
    setMockData({
      hasData: true,
      lastUpdated: '2024-06-15T14:30:00.000Z',
    })
    const wrapper = mount(MythicPlusBox)
    const updated = wrapper.find('.mp-updated')
    expect(updated.exists()).toBe(true)
    expect(updated.text()).toContain('Updated')
    expect(updated.text()).toContain('15')
    expect(updated.text()).toContain('Jun')
  })

  it('hides updated timestamp when lastUpdated is null', () => {
    setMockData({ hasData: true, lastUpdated: null })
    const wrapper = mount(MythicPlusBox)
    expect(wrapper.find('.mp-updated').exists()).toBe(false)
  })
})
