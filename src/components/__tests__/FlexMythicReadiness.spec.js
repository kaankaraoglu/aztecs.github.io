import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FlexMythicReadiness from '@/components/next-tier/FlexMythicReadiness.vue'

function makeSubmission(className, characterName, specName = 'arms') {
  return { className, characterName, specName, handle: `${className}-${characterName}` }
}

function makeSubmissions(count) {
  // Cycle through a few classes so filled slots exercise more than one colour.
  const classes = ['warrior', 'mage', 'priest', 'deathKnight', 'druid']
  return Array.from({ length: count }, (_, i) =>
    makeSubmission(classes[i % classes.length], `Player${i}`),
  )
}

const mountReadiness = (submissions) => mount(FlexMythicReadiness, { props: { submissions } })

const badgeText = (wrapper) => wrapper.find('.status-badge').text()
const filledSlots = (wrapper) => wrapper.findAll('.slot--filled')
const emptySlots = (wrapper) => wrapper.findAll('.slot--empty')

describe('FlexMythicReadiness', () => {
  it('shows the full 15-player shortfall with zero signups', () => {
    const wrapper = mountReadiness([])
    expect(badgeText(wrapper)).toBe('Need 15 more')
    expect(wrapper.find('.status-badge').classes()).toContain('text-red-500')
    expect(filledSlots(wrapper)).toHaveLength(0)
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

  it('always renders the maximum number of slots regardless of signup count', () => {
    // Every slot is always in the DOM (empty or filled) so the grid never
    // resizes as people sign up — only whether a slot is filled changes.
    for (const count of [0, 5, 15, 25, 40]) {
      const wrapper = mountReadiness(makeSubmissions(count))
      expect(wrapper.findAll('.slot')).toHaveLength(25)
    }
  })

  it('fills exactly one slot per signup, up to the display max', () => {
    expect(filledSlots(mountReadiness(makeSubmissions(1)))).toHaveLength(1)
    expect(filledSlots(mountReadiness(makeSubmissions(14)))).toHaveLength(14)
    expect(filledSlots(mountReadiness(makeSubmissions(25)))).toHaveLength(25)
  })

  it('caps filled slots at the display max when signups exceed it', () => {
    const wrapper = mountReadiness(makeSubmissions(40))
    expect(filledSlots(wrapper)).toHaveLength(25)
    expect(emptySlots(wrapper)).toHaveLength(0)
    expect(badgeText(wrapper)).toBe('Ready')
  })

  it('splits the grid into 15 required and 10 bonus slots', () => {
    const wrapper = mountReadiness([])
    expect(wrapper.find('.slot-grid--required').findAll('.slot')).toHaveLength(15)
    expect(wrapper.find('.slot-grid--bonus').findAll('.slot')).toHaveLength(10)
  })

  it('colours a filled slot with the signed-up player’s class', () => {
    const wrapper = mountReadiness([makeSubmission('warlock', 'Gul’dan')])
    const slot = wrapper.find('.slot--filled')
    expect(slot.classes()).toContain('warlock')
    expect(slot.attributes('title')).toContain('Gul’dan')
  })

  it('marks empty slots without a class colour or title', () => {
    const wrapper = mountReadiness([])
    const slot = wrapper.find('.slot--empty')
    expect(slot.attributes('title')).toBeUndefined()
    expect(slot.attributes('aria-label')).toBe('Open slot')
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
})
