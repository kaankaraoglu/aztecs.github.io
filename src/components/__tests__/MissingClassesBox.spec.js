import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import MissingClassesBox from '../MissingClassesBox.vue'
import { WOW_CLASSES } from '@/data/wow-classes.js'

const ALL_CLASS_KEYS = Object.keys(WOW_CLASSES)

const mountBox = (submissions) =>
  mount(MissingClassesBox, {
    props: { submissions },
    global: {
      stubs: { RouterLink: RouterLinkStub },
    },
  })

const pillNames = (wrapper) => wrapper.findAll('.class-pill').map((p) => p.text())

describe('MissingClassesBox', () => {
  it('renders nothing when there are no submissions yet', () => {
    const wrapper = mountBox([])
    expect(wrapper.find('.missing-classes-box').exists()).toBe(false)
    expect(wrapper.findAll('.class-pill')).toHaveLength(0)
    expect(wrapper.text()).not.toContain('Classes We Need for Next Tier')
  })

  it('renders nothing when every class is already signed up', () => {
    const wrapper = mountBox(ALL_CLASS_KEYS.map((className) => ({ className })))
    expect(wrapper.find('.missing-classes-box').exists()).toBe(false)
  })

  it('lists exactly the classes with no signup, by display name', () => {
    const signedUp = ['warrior', 'paladin', 'hunter', 'rogue', 'priest', 'shaman']
    const wrapper = mountBox(signedUp.map((className) => ({ className })))
    const expected = ALL_CLASS_KEYS.filter((key) => !signedUp.includes(key)).map(
      (key) => WOW_CLASSES[key].name,
    )
    expect(pillNames(wrapper)).toEqual(expected)
    expect(pillNames(wrapper)).not.toContain('Warrior')
  })

  it('lists all but one class when a single player has signed up', () => {
    const wrapper = mountBox([{ className: 'mage' }])
    const pills = wrapper.findAll('.class-pill')
    expect(pills).toHaveLength(ALL_CLASS_KEYS.length - 1)
    expect(pillNames(wrapper)).not.toContain('Mage')
  })

  it('counts duplicate signups of the same class once', () => {
    const wrapper = mountBox([
      { className: 'druid' },
      { className: 'druid' },
      { className: 'druid' },
    ])
    expect(wrapper.findAll('.class-pill')).toHaveLength(ALL_CLASS_KEYS.length - 1)
    expect(pillNames(wrapper)).not.toContain('Druid')
  })

  it('ignores submissions whose class is not a known WoW class', () => {
    const wrapper = mountBox([{ className: 'tinker' }])
    expect(wrapper.findAll('.class-pill')).toHaveLength(ALL_CLASS_KEYS.length)
  })

  it('gives each pill the kebab-case class-colour CSS class', () => {
    const wrapper = mountBox([{ className: 'warrior' }])
    const pills = wrapper.findAll('.class-pill')
    const byName = new Map(pills.map((p) => [p.text(), p.classes()]))
    expect(byName.get('Death Knight')).toContain('death-knight')
    expect(byName.get('Demon Hunter')).toContain('demon-hunter')
    expect(byName.get('Mage')).toContain('mage')
    for (const pill of pills) {
      expect(pill.classes()).toContain('class-pill')
    }
  })

  it('renders the next-tier signup link', () => {
    const wrapper = mountBox([{ className: 'warrior' }])
    const link = wrapper.findComponent(RouterLinkStub)
    expect(link.props('to')).toBe('/next-tier')
    expect(link.text()).toContain('Sign up for next tier')
  })

  it('updates the missing list when submissions change', async () => {
    const wrapper = mountBox([{ className: 'warrior' }])
    expect(pillNames(wrapper)).toContain('Mage')
    await wrapper.setProps({ submissions: [{ className: 'warrior' }, { className: 'mage' }] })
    expect(pillNames(wrapper)).not.toContain('Mage')
    await wrapper.setProps({ submissions: [] })
    expect(wrapper.find('.missing-classes-box').exists()).toBe(false)
  })
})
