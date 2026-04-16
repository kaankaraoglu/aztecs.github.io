import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'

vi.stubGlobal(
  'matchMedia',
  vi.fn(() => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
)

import KillCard from '../KillCard.vue'

describe('KillCard', () => {
  const baseProps = {
    raidName: 'Ragnaros Heroic',
    imageUrl: '/images/ragnaros.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the raid name', () => {
    const wrapper = mount(KillCard, {
      props: baseProps,
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.raid-name').text()).toBe('Ragnaros Heroic')
  })

  it('sets the image src and alt from props', () => {
    const wrapper = mount(KillCard, {
      props: baseProps,
      global: { stubs: { Teleport: true } },
    })
    const img = wrapper.find('.raid-image')
    expect(img.attributes('src')).toBe('/images/ragnaros.jpg')
    expect(img.attributes('alt')).toBe('Ragnaros Heroic screenshot')
  })

  it('sets aria-label on the image anchor', () => {
    const wrapper = mount(KillCard, {
      props: baseProps,
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.image-anchor').attributes('aria-label')).toBe(
      'View full screenshot of Ragnaros Heroic',
    )
  })

  it('shows date when provided', () => {
    const wrapper = mount(KillCard, {
      props: { ...baseProps, date: '2024-03-15' },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.date').exists()).toBe(true)
    expect(wrapper.find('.date').text()).toBe('2024-03-15')
  })

  it('hides date when not provided', () => {
    const wrapper = mount(KillCard, {
      props: baseProps,
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.date').exists()).toBe(false)
  })

  it('shows attempts when provided', () => {
    const wrapper = mount(KillCard, {
      props: { ...baseProps, attempts: 42 },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.attempts').text()).toContain('42')
  })

  it('shows separator only when both date and attempts are present', () => {
    const wrapper = mount(KillCard, {
      props: { ...baseProps, date: '2024-03-15', attempts: 42 },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.separator').exists()).toBe(true)
  })

  it('hides separator when only date is present', () => {
    const wrapper = mount(KillCard, {
      props: { ...baseProps, date: '2024-03-15' },
      global: { stubs: { Teleport: true } },
    })
    expect(wrapper.find('.separator').exists()).toBe(false)
  })

  it('opens lightbox when image anchor is clicked', async () => {
    const wrapper = mount(KillCard, {
      props: baseProps,
      global: { stubs: { Teleport: true } },
    })
    const lightbox = wrapper.findComponent({ name: 'ImageLightbox' })
    expect(lightbox.props('open')).toBe(false)

    await wrapper.find('.image-anchor').trigger('click')
    expect(lightbox.props('open')).toBe(true)
  })

  it('closes lightbox when it emits close', async () => {
    const wrapper = mount(KillCard, {
      props: baseProps,
      global: { stubs: { Teleport: true } },
    })
    await wrapper.find('.image-anchor').trigger('click')
    const lightbox = wrapper.findComponent({ name: 'ImageLightbox' })
    expect(lightbox.props('open')).toBe(true)

    await lightbox.vm.$emit('close')
    expect(lightbox.props('open')).toBe(false)
  })

  it('passes roster arrays to RosterList', () => {
    const tanks = [{ name: 'Tank1', class: 'warrior' }]
    const healers = [{ name: 'Healer1', class: 'priest' }]
    const dds = [{ name: 'DD1', class: 'mage' }]
    const wrapper = mount(KillCard, {
      props: { ...baseProps, tanks, healers, dds },
      global: { stubs: { Teleport: true } },
    })
    const roster = wrapper.findComponent({ name: 'RosterList' })
    expect(roster.props('tanks')).toEqual(tanks)
    expect(roster.props('healers')).toEqual(healers)
    expect(roster.props('dps')).toEqual(dds)
  })
})
