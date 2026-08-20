import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FlexMythicReadiness from '@/components/next-tier/FlexMythicReadiness.vue'

const mountReadiness = (signupCount) => mount(FlexMythicReadiness, { props: { signupCount } })

const badgeText = (wrapper) => wrapper.find('.status-badge').text()
const fillWidth = (wrapper) => parseFloat(wrapper.find('.progress-fill').element.style.width)

describe('FlexMythicReadiness', () => {
  it('shows the full 15-player shortfall with zero signups', () => {
    const wrapper = mountReadiness(0)
    expect(badgeText(wrapper)).toBe('Need 15 more')
    expect(wrapper.find('.status-badge').classes()).toContain('text-red-500')
    expect(fillWidth(wrapper)).toBe(0)
  })

  it('counts down the shortfall below the threshold', () => {
    expect(badgeText(mountReadiness(1))).toBe('Need 14 more')
    expect(badgeText(mountReadiness(8))).toBe('Need 7 more')
    expect(badgeText(mountReadiness(14))).toBe('Need 1 more')
  })

  it('is still short one below the threshold', () => {
    const wrapper = mountReadiness(14)
    expect(badgeText(wrapper)).toBe('Need 1 more')
    expect(wrapper.find('.progress-fill').classes()).not.toContain('ready')
    expect(wrapper.find('.count').classes()).toContain('text-short')
    expect(wrapper.find('.count').classes()).not.toContain('text-ready')
  })

  it('flips to ready exactly at the threshold', () => {
    const wrapper = mountReadiness(15)
    expect(badgeText(wrapper)).toBe('Ready')
    expect(wrapper.find('.status-badge').classes()).toContain('text-emerald-500')
    expect(wrapper.find('.progress-fill').classes()).toContain('ready')
    expect(wrapper.find('.count').classes()).toContain('text-ready')
    expect(fillWidth(wrapper)).toBe(60)
  })

  it('stays ready above the threshold', () => {
    const wrapper = mountReadiness(20)
    expect(badgeText(wrapper)).toBe('Ready')
    expect(fillWidth(wrapper)).toBe(80)
  })

  it('scales the progress fill against the 25-player display max', () => {
    expect(fillWidth(mountReadiness(1))).toBeCloseTo(4)
    expect(fillWidth(mountReadiness(14))).toBeCloseTo(56)
    expect(fillWidth(mountReadiness(25))).toBe(100)
  })

  it('clamps the progress fill at 100% beyond the display max', () => {
    const wrapper = mountReadiness(40)
    expect(fillWidth(wrapper)).toBe(100)
    expect(badgeText(wrapper)).toBe('Ready')
  })

  it('pins the threshold marker at 60% of the track', () => {
    const wrapper = mountReadiness(0)
    expect(parseFloat(wrapper.find('.progress-threshold').element.style.left)).toBe(60)
  })

  it('labels the current count and the minimum', () => {
    const wrapper = mountReadiness(9)
    expect(wrapper.find('.count').text()).toBe('9')
    expect(wrapper.find('.label-current').text()).toContain('signed up')
    expect(wrapper.find('.label-min').text()).toBe('15 min')
  })

  it('re-evaluates readiness when the count changes', async () => {
    const wrapper = mountReadiness(14)
    expect(badgeText(wrapper)).toBe('Need 1 more')
    await wrapper.setProps({ signupCount: 15 })
    expect(badgeText(wrapper)).toBe('Ready')
    await wrapper.setProps({ signupCount: 13 })
    expect(badgeText(wrapper)).toBe('Need 2 more')
    expect(wrapper.find('.progress-fill').classes()).not.toContain('ready')
  })
})
