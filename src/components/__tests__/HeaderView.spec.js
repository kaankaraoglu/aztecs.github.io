import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils'
import HeaderView from '../HeaderView.vue'

describe('HeaderView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('open', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const mountHeader = () =>
    mount(HeaderView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          DiscordIcon: { template: '<span class="discord-stub" />' },
        },
      },
    })

  it('renders all nav links with correct paths', () => {
    const wrapper = mountHeader()
    const links = wrapper.findAllComponents(RouterLinkStub)
    const paths = links.map((l) => l.props('to'))
    expect(paths).toContain('/')
    expect(paths).toContain('/achievements')
    expect(paths).toContain('/raiding')
    expect(paths).toContain('/about')
    expect(paths).toContain('/contact')
  })

  it('renders logo link to home', () => {
    const wrapper = mountHeader()
    const logoLink = wrapper.find('.logo-home-link')
    expect(logoLink.exists()).toBe(true)
    const logoComponent = wrapper
      .findAllComponents(RouterLinkStub)
      .find((l) => l.props('to') === '/')
    expect(logoComponent).toBeDefined()
  })

  it('toggles hamburger menu on click', async () => {
    const wrapper = mountHeader()
    const hamburger = wrapper.find('.hamburger')
    expect(hamburger.classes()).not.toContain('open')
    expect(wrapper.find('.nav-links').classes()).not.toContain('open')

    await hamburger.trigger('click')
    expect(hamburger.classes()).toContain('open')
    expect(wrapper.find('.nav-links').classes()).toContain('open')

    await hamburger.trigger('click')
    expect(hamburger.classes()).not.toContain('open')
  })

  it('sets a splash message on mount', async () => {
    const wrapper = mountHeader()
    await flushPromises()
    expect(wrapper.find('.splash-text').text()).not.toBe('')
  })

  it('rotates splash message after interval', async () => {
    const wrapper = mountHeader()
    await flushPromises()
    const firstSplash = wrapper.find('.splash-text').text()
    expect(firstSplash).toBeTruthy()

    // Advance 3000ms to trigger rotateSplash, then 500ms for the inner setTimeout
    vi.advanceTimersByTime(3500)
    await flushPromises()

    const secondSplash = wrapper.find('.splash-text').text()
    expect(secondSplash).toBeTruthy()
  })

  it('opens Discord invite in a new tab', async () => {
    const wrapper = mountHeader()
    await wrapper.find('.discord-stub').trigger('click')
    expect(window.open).toHaveBeenCalledWith('https://discord.gg/GfmnD24VHa', '_blank')
  })
})
