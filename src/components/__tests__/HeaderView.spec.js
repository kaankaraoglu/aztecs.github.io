import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, RouterLinkStub, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import HeaderView from '../HeaderView.vue'
import { useTheme } from '@/composables/useTheme'

describe('HeaderView', () => {
  beforeEach(() => {
    vi.useFakeTimers()
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

  // A real <button> gets keyboard activation and button semantics from the
  // platform, so the assertions here cover the parts that are still ours: the
  // element type, the labelling, and the expanded state.
  it('hamburger is a real button with correct ARIA attributes', async () => {
    const wrapper = mountHeader()
    const hamburger = wrapper.find('.hamburger')
    expect(hamburger.element.tagName).toBe('BUTTON')
    expect(hamburger.attributes('type')).toBe('button')
    expect(hamburger.attributes('aria-label')).toBe('Open navigation menu')
    expect(hamburger.attributes('aria-expanded')).toBe('false')
    expect(hamburger.attributes('aria-controls')).toBe('primary-nav')

    await hamburger.trigger('click')
    expect(hamburger.attributes('aria-label')).toBe('Close navigation menu')
    expect(hamburger.attributes('aria-expanded')).toBe('true')
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

  it('links the Discord invite as a real anchor', () => {
    const wrapper = mountHeader()
    const link = wrapper.find('.discord-link')
    expect(link.attributes('href')).toBe('https://discord.gg/GfmnD24VHa')
    expect(link.attributes('target')).toBe('_blank')
    // window.open leaves the opened tab a live opener handle; an anchor does not.
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.attributes('aria-label')).toContain('opens in new tab')
  })
})

describe('HeaderView theme switch', () => {
  /** @type {Map<string, string>} */
  let store
  /** @type {import('@vue/test-utils').VueWrapper | null} */
  let wrapper

  const STORAGE_KEY = 'aztecs-theme'

  const mountHeader = () =>
    mount(HeaderView, {
      attachTo: document.body,
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          DiscordIcon: { template: '<span class="discord-stub" />' },
        },
      },
    })

  const dialog = () => document.body.querySelector('[role="alertdialog"]')

  const dialogButton = (text) =>
    [...document.body.querySelectorAll('[role="alertdialog"] button')].find(
      (b) => b.textContent.trim() === text,
    )

  const themeAttr = () => document.documentElement.getAttribute('data-theme')

  beforeEach(async () => {
    store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (k) => (store.has(k) ? store.get(k) : null),
      setItem: (k, v) => store.set(k, String(v)),
      removeItem: (k) => store.delete(k),
      clear: () => store.clear(),
    })
    // useTheme holds module-level shared state, so a previous spec's pick would
    // otherwise leak in. Round-tripping through light forces the watcher to
    // re-stamp data-theme regardless of where the previous spec left it.
    useTheme().setTheme('light')
    useTheme().setTheme('dark')
    await nextTick()
    store.clear()
  })

  afterEach(() => {
    wrapper?.unmount()
    wrapper = null
    vi.unstubAllGlobals()
  })

  it('labels the switch with the theme it will switch to', async () => {
    wrapper = mountHeader()
    expect(wrapper.find('[role="switch"]').attributes('aria-label')).toBe('Switch to light mode')

    await wrapper.find('[role="switch"]').trigger('click')
    dialogButton("I'm ready").click()
    await flushPromises()

    expect(wrapper.find('[role="switch"]').attributes('aria-label')).toBe('Switch to dark mode')
  })

  it('opens the flashbang confirmation without applying light mode yet', async () => {
    wrapper = mountHeader()
    await wrapper.find('[role="switch"]').trigger('click')
    await flushPromises()

    expect(dialog()).not.toBeNull()
    expect(dialog().textContent).toContain('Flashbang warning')
    // Bailing out of onSwitchChange leaves `theme` untouched, so the
    // controlled Switch snaps back to unchecked on its own.
    expect(themeAttr()).toBe('dark')
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('false')
    expect(store.get(STORAGE_KEY)).toBeUndefined()
  })

  it('applies light mode and closes the dialog once confirmed', async () => {
    wrapper = mountHeader()
    await wrapper.find('[role="switch"]').trigger('click')
    await flushPromises()

    dialogButton("I'm ready").click()
    await flushPromises()

    expect(themeAttr()).toBe('light')
    expect(store.get(STORAGE_KEY)).toBe('light')
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('true')
    expect(dialog()).toBeNull()
  })

  it('stays dark when the flashbang is dismissed', async () => {
    wrapper = mountHeader()
    await wrapper.find('[role="switch"]').trigger('click')
    await flushPromises()

    dialogButton('Take me back').click()
    await flushPromises()

    expect(themeAttr()).toBe('dark')
    expect(store.get(STORAGE_KEY)).toBeUndefined()
    expect(dialog()).toBeNull()
  })

  it('switches back to dark with no confirmation step', async () => {
    useTheme().setTheme('light')
    await nextTick()
    store.clear()

    wrapper = mountHeader()
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('true')

    await wrapper.find('[role="switch"]').trigger('click')
    await flushPromises()

    expect(dialog()).toBeNull()
    expect(themeAttr()).toBe('dark')
    expect(store.get(STORAGE_KEY)).toBe('dark')
    expect(wrapper.find('[role="switch"]').attributes('aria-checked')).toBe('false')
  })
})
