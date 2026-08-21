import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RaidStatsBox from '../RaidStatsBox.vue'

const mockStats = {
  mostDeaths: null,
  highestDamageDone: null,
  highestDamageDoneMplus: null,
  bestHealer: null,
  bestHealerMplus: null,
}

vi.mock('@/composables/useRaidStats.js', () => ({
  useRaidStats: () => ({ stats: mockStats }),
}))

function setMockStats(overrides) {
  Object.assign(mockStats, {
    mostDeaths: null,
    highestDamageDone: null,
    highestDamageDoneMplus: null,
    bestHealer: null,
    bestHealerMplus: null,
    ...overrides,
  })
}

describe('RaidStatsBox', () => {
  it('renders a single combined section with one heading', () => {
    setMockStats({})
    const wrapper = mount(RaidStatsBox)
    expect(wrapper.findAll('.stats-section-label')).toHaveLength(1)
    expect(wrapper.find('.stats-section-label').text()).toBe('HALL OF FAME & SHAME')
  })

  it('shows "No data yet." for all empty stats', () => {
    setMockStats({})
    const wrapper = mount(RaidStatsBox)
    const empties = wrapper.findAll('.stat-empty')
    expect(empties).toHaveLength(5)
  })

  it('renders all 8 stat cards', () => {
    setMockStats({})
    const wrapper = mount(RaidStatsBox)
    expect(wrapper.findAll('.stat-card')).toHaveLength(7)
  })

  it('renders mostDeaths with name, class, and count', () => {
    setMockStats({
      mostDeaths: { name: 'Proto', class: 'evoker', count: 15 },
    })
    const wrapper = mount(RaidStatsBox)
    const cards = wrapper.findAll('.stat-card')
    const deathCard = cards[4]
    expect(deathCard.find('.stat-name').text()).toBe('Proto')
    expect(deathCard.find('.stat-name').classes()).toContain('evoker')
    expect(deathCard.find('.stat-value').text()).toBe('15 deaths')
  })

  it('renders highestDamageDone with formatted number and boss', () => {
    setMockStats({
      highestDamageDone: {
        name: 'Aurielle',
        class: 'paladin',
        amount: 1500000,
        boss: 'Ragnaros',
        report: 'https://logs.example.com/1',
      },
    })
    const wrapper = mount(RaidStatsBox)
    const cards = wrapper.findAll('.stat-card')
    const dmgCard = cards[0]
    expect(dmgCard.find('.stat-name').text()).toBe('Aurielle')
    expect(dmgCard.find('.stat-value').text()).toContain('1.5M')
    expect(dmgCard.find('.stat-value').text()).toContain('Ragnaros')
    expect(dmgCard.find('.stat-link').exists()).toBe(true)
    expect(dmgCard.find('.stat-link').attributes('href')).toBe('https://logs.example.com/1')
  })

  it('hides "View Log" link when report is absent', () => {
    setMockStats({
      highestDamageDone: {
        name: 'Aurielle',
        class: 'paladin',
        amount: 50000,
        boss: 'Onyxia',
      },
    })
    const wrapper = mount(RaidStatsBox)
    const cards = wrapper.findAll('.stat-card')
    expect(cards[0].find('.stat-link').exists()).toBe(false)
  })

  it('formats thousands with K suffix', () => {
    setMockStats({
      bestHealer: { name: 'Healer', class: 'priest', amount: 750000, boss: 'Boss' },
    })
    const wrapper = mount(RaidStatsBox)
    const cards = wrapper.findAll('.stat-card')
    expect(cards[2].find('.stat-value').text()).toContain('750K')
  })

  it('falls back to "a boss" when boss name is missing', () => {
    setMockStats({
      highestDamageDone: {
        name: 'Player',
        class: 'mage',
        amount: 100,
      },
    })
    const wrapper = mount(RaidStatsBox)
    const cards = wrapper.findAll('.stat-card')
    expect(cards[0].find('.stat-value').text()).toContain('a boss')
  })

  it('always renders the two hardcoded fun cards', () => {
    setMockStats({})
    const wrapper = mount(RaidStatsBox)
    expect(wrapper.text()).toContain('Highest Avoidable Damage Taken')
    expect(wrapper.text()).toContain('Frontpage Material')
    expect(wrapper.text()).toContain('Peavy')
    expect(wrapper.text()).toContain('Agro')
  })
})
