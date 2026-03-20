import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FadingDivider from '../FadingDivider.vue'

describe('FadingDivider', () => {
  it('renders an hr element', () => {
    const wrapper = mount(FadingDivider)
    expect(wrapper.find('hr').exists()).toBe(true)
  })

  it('has the fading-divider class', () => {
    const wrapper = mount(FadingDivider)
    expect(wrapper.find('hr').classes()).toContain('fading-divider')
  })
})
