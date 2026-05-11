import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RefreshDataButton from '../RefreshDataButton.vue'

vi.mock('@/composables/useAnalytics', () => ({
  useAnalytics: () => ({ trackEvent: vi.fn() }),
}))

describe('RefreshDataButton', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_REFRESH_WORKER_URL', 'https://worker.test/refresh')
    vi.stubEnv('VITE_TURNSTILE_SITE_KEY', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it('renders with idle state by default', () => {
    const wrapper = mount(RefreshDataButton)
    expect(wrapper.find('.refresh-btn').exists()).toBe(true)
    expect(wrapper.text()).toContain('Refresh')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('has correct aria-label in idle state', () => {
    const wrapper = mount(RefreshDataButton)
    expect(wrapper.find('button').attributes('aria-label')).toBe('Refresh progression data')
  })

  it('shows spinning icon and disables button during submission', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise(() => {})),
    )
    const wrapper = mount(RefreshDataButton)
    wrapper.find('button').element.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Refreshing…')
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.refresh-icon').classes()).toContain('spinning')
    vi.unstubAllGlobals()
  })

  it('shows success state after successful refresh', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              message: 'Refresh triggered',
              actionsUrl: 'https://github.com/test',
            }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()
    expect(wrapper.text()).toContain('Triggered!')
    expect(wrapper.find('.refresh-btn').classes()).toContain('success')
    vi.unstubAllGlobals()
  })

  it('shows error state on fetch failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 502,
          json: () => Promise.resolve({ error: 'Failed' }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()
    expect(wrapper.text()).toContain('Failed')
    expect(wrapper.find('.refresh-btn').classes()).toContain('error')
    vi.unstubAllGlobals()
  })

  it('shows rate-limited state with countdown', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: 'Rate limited', retryAfter: 120 }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()
    expect(wrapper.text()).toContain('Wait 2:00')
    expect(wrapper.find('.refresh-btn').classes()).toContain('rate-limited')
    vi.unstubAllGlobals()
  })

  it('shows network error state on exception', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('Network error'))),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()
    expect(wrapper.text()).toContain('Failed')
    vi.unstubAllGlobals()
  })
})
