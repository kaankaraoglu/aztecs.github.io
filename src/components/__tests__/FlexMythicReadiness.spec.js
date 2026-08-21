import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import FlexMythicReadiness from '@/components/next-tier/FlexMythicReadiness.vue'
import { WOW_CLASSES } from '@/data/wow-classes.js'

const ALL_CLASS_KEYS = Object.keys(WOW_CLASSES)

function makeSubmission(className, characterName, specName = 'arms') {
  return { className, characterName, specName, handle: `${className}-${characterName}` }
}

// Warrior arms is melee, mage frost is ranged, priest holy is a healer,
// deathKnight frost is melee, druid guardian is a tank — cycling through
// them exercises multiple roles and multiple slot colours at once.
function makeSubmissions(count) {
  const specs = [
    ['warrior', 'arms'],
    ['mage', 'frost'],
    ['priest', 'holy'],
    ['deathKnight', 'frost'],
    ['druid', 'guardian'],
  ]
  return Array.from({ length: count }, (_, i) => {
    const [className, specName] = specs[i % specs.length]
    return makeSubmission(className, `Player${i}`, specName)
  })
}

const mountReadiness = (submissions, props = {}) =>
  mount(FlexMythicReadiness, {
    props: { submissions, ...props },
    global: { stubs: { RouterLink: RouterLinkStub } },
  })

const badgeText = (wrapper) => wrapper.find('.status-badge').text()
const filledSlots = (wrapper) => wrapper.findAll('.slot--filled')
const roleRows = (wrapper) => wrapper.findAll('.role-row')
const roleLabels = (wrapper) => roleRows(wrapper).map((row) => row.find('.role-label').text())
const pillNames = (wrapper) => wrapper.findAll('.class-pill').map((p) => p.text())

describe('FlexMythicReadiness', () => {
  it('shows the full 15-player shortfall with zero signups', () => {
    const wrapper = mountReadiness([])
    expect(badgeText(wrapper)).toBe('Need 15 more')
    expect(wrapper.find('.status-badge').classes()).toContain('text-red-500')
    expect(filledSlots(wrapper)).toHaveLength(0)
    expect(roleRows(wrapper)).toHaveLength(0)
  })

  it('counts down the shortfall below the threshold', () => {
    expect(badgeText(mountReadiness(makeSubmissions(1)))).toBe('Need 14 more')
    expect(badgeText(mountReadiness(makeSubmissions(8)))).toBe('Need 7 more')
    expect(badgeText(mountReadiness(makeSubmissions(14)))).toBe('Need 1 more')
  })

  it('is still short one below the threshold', () => {
    const wrapper = mountReadiness(makeSubmissions(14))
    expect(badgeText(wrapper)).toBe('Need 1 more')
    expect(wrapper.find('.count').classes()).toContain('text-short')
    expect(wrapper.find('.count').classes()).not.toContain('text-ready')
  })

  it('flips to ready exactly at the threshold', () => {
    const wrapper = mountReadiness(makeSubmissions(15))
    expect(badgeText(wrapper)).toBe('Ready')
    expect(wrapper.find('.status-badge').classes()).toContain('text-emerald-500')
    expect(wrapper.find('.count').classes()).toContain('text-ready')
  })

  it('stays ready above the threshold', () => {
    expect(badgeText(mountReadiness(makeSubmissions(20)))).toBe('Ready')
  })

  it('renders one box per signup, with no empty placeholders', () => {
    for (const count of [1, 5, 14]) {
      const wrapper = mountReadiness(makeSubmissions(count))
      expect(wrapper.findAll('.slot')).toHaveLength(count)
      expect(filledSlots(wrapper)).toHaveLength(count)
    }
  })

  it('caps the boxes shown at the display max when signups exceed it', () => {
    const wrapper = mountReadiness(makeSubmissions(40))
    expect(filledSlots(wrapper)).toHaveLength(25)
    expect(badgeText(wrapper)).toBe('Ready')
  })

  it('groups boxes into one row per role, tanks first then healers then DPS', () => {
    // 5 of each of tank/healer/melee/ranged: 5 tank, 5 healer, 10 dps.
    const submissions = [
      ...Array.from({ length: 5 }, (_, i) => makeSubmission('druid', `Tank${i}`, 'guardian')),
      ...Array.from({ length: 5 }, (_, i) => makeSubmission('priest', `Healer${i}`, 'holy')),
      ...Array.from({ length: 5 }, (_, i) => makeSubmission('warrior', `Melee${i}`, 'arms')),
      ...Array.from({ length: 5 }, (_, i) => makeSubmission('mage', `Ranged${i}`, 'frost')),
    ]
    const wrapper = mountReadiness(submissions)
    expect(roleLabels(wrapper)).toEqual(['Tanks', 'Healers', 'DPS'])

    const rows = roleRows(wrapper)
    expect(rows[0].findAll('.slot')).toHaveLength(5)
    expect(rows[1].findAll('.slot')).toHaveLength(5)
    expect(rows[2].findAll('.slot')).toHaveLength(10) // melee + ranged share the DPS row
  })

  it('omits a role row entirely when nobody of that role has signed up', () => {
    const wrapper = mountReadiness([makeSubmission('priest', 'Solo', 'holy')])
    expect(roleLabels(wrapper)).toEqual(['Healers'])
  })

  it('colours a filled slot with the signed-up player’s class and names them for hover/screen readers', () => {
    const wrapper = mountReadiness([makeSubmission('warlock', 'Gul’dan', 'affliction')])
    const slot = wrapper.find('.slot--filled')
    expect(slot.classes()).toContain('warlock')
    expect(slot.attributes('title')).toBeUndefined()
    expect(slot.attributes('aria-label')).toContain('Gul’dan')
  })

  it('labels the current count and the minimum/maximum', () => {
    const wrapper = mountReadiness(makeSubmissions(9))
    expect(wrapper.find('.count').text()).toBe('9')
    expect(wrapper.find('.label-current').text()).toContain('signed up')
    expect(wrapper.find('.label-min').text()).toBe('15 min · 25 max')
  })

  it('re-evaluates readiness when the signups change', async () => {
    const wrapper = mountReadiness(makeSubmissions(14))
    expect(badgeText(wrapper)).toBe('Need 1 more')
    await wrapper.setProps({ submissions: makeSubmissions(15) })
    expect(badgeText(wrapper)).toBe('Ready')
    await wrapper.setProps({ submissions: makeSubmissions(13) })
    expect(badgeText(wrapper)).toBe('Need 2 more')
    expect(wrapper.find('.count').classes()).toContain('text-short')
  })

  it('does not list missing classes when there are no submissions yet', () => {
    const wrapper = mountReadiness([])
    expect(wrapper.find('.missing-classes').exists()).toBe(false)
    expect(wrapper.findAll('.class-pill')).toHaveLength(0)
  })

  it('does not list missing classes when every class is already signed up', () => {
    const wrapper = mountReadiness(ALL_CLASS_KEYS.map((className) => ({ className })))
    expect(wrapper.find('.missing-classes').exists()).toBe(false)
  })

  it('lists exactly the classes with no signup, by display name', () => {
    const signedUp = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman']
    const wrapper = mountReadiness(signedUp.map((className) => ({ className })))
    const expected = ALL_CLASS_KEYS.filter((key) => !signedUp.includes(key)).map(
      (key) => WOW_CLASSES[key].name,
    )
    expect(pillNames(wrapper)).toEqual(expected)
    expect(pillNames(wrapper)).not.toContain('Warrior')
  })

  it('lists all but one class when a single player has signed up', () => {
    const wrapper = mountReadiness([{ className: 'mage' }])
    expect(wrapper.findAll('.class-pill')).toHaveLength(ALL_CLASS_KEYS.length - 1)
    expect(pillNames(wrapper)).not.toContain('Mage')
  })

  it('counts duplicate signups of the same class once', () => {
    const wrapper = mountReadiness([
      { className: 'druid', characterName: 'Druid1' },
      { className: 'druid', characterName: 'Druid2' },
      { className: 'druid', characterName: 'Druid3' },
    ])
    expect(wrapper.findAll('.class-pill')).toHaveLength(ALL_CLASS_KEYS.length - 1)
    expect(pillNames(wrapper)).not.toContain('Druid')
  })

  it('ignores submissions whose class is not a known WoW class', () => {
    const wrapper = mountReadiness([{ className: 'tinker' }])
    expect(wrapper.findAll('.class-pill')).toHaveLength(ALL_CLASS_KEYS.length)
  })

  it('gives each missing-class pill the kebab-case class-colour CSS class', () => {
    const wrapper = mountReadiness([{ className: 'warrior' }])
    const pills = wrapper.findAll('.class-pill')
    const byName = new Map(pills.map((p) => [p.text(), p.classes()]))
    expect(byName.get('Death Knight')).toContain('death-knight')
    expect(byName.get('Demon Hunter')).toContain('demon-hunter')
    expect(byName.get('Mage')).toContain('mage')
  })

  it('updates the missing-class list when submissions change', async () => {
    const wrapper = mountReadiness([{ className: 'warrior' }])
    expect(pillNames(wrapper)).toContain('Mage')
    await wrapper.setProps({ submissions: [{ className: 'warrior' }, { className: 'mage' }] })
    expect(pillNames(wrapper)).not.toContain('Mage')
  })

  it('hides the signup link by default', () => {
    const wrapper = mountReadiness([{ className: 'warrior' }])
    expect(wrapper.findComponent(RouterLinkStub).exists()).toBe(false)
  })

  it('renders the next-tier signup link when showSignupLink is set', () => {
    const wrapper = mountReadiness([{ className: 'warrior' }], { showSignupLink: true })
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props('to')).toBe('/next-tier')
    expect(link.text()).toContain('Sign up for next tier')
  })
})
