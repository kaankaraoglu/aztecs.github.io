import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonLoader from '../SkeletonLoader.vue'

describe('SkeletonLoader', () => {
  it('renders with default width and height', () => {
    const wrapper = mount(SkeletonLoader)
    const style = wrapper.find('.skeleton').attributes('style')
    expect(style).toContain('width: 100%')
    expect(style).toContain('height: 1rem')
  })

  it('applies custom width and height props', () => {
    const wrapper = mount(SkeletonLoader, {
      props: { width: '200px', height: '3rem' },
    })
    const style = wrapper.find('.skeleton').attributes('style')
    expect(style).toContain('width: 200px')
    expect(style).toContain('height: 3rem')
  })

  it('contains the shimmer animation element', () => {
    const wrapper = mount(SkeletonLoader)
    expect(wrapper.find('.skeleton-shimmer').exists()).toBe(true)
  })
})
