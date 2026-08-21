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
    vi.useRealTimers()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
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

  it('says nothing in the live region while idle', () => {
    const wrapper = mount(RefreshDataButton)
    const status = wrapper.find('[role="status"]')
    expect(status.attributes('aria-live')).toBe('polite')
    expect(status.text()).toBe('')
  })

  // Rewriting the button's own aria-label announces nothing to a screen
  // reader, so the outcome has to land in the live region while the button
  // keeps one stable name.
  it('announces the success outcome in the live region, not the button label', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ actionsUrl: 'https://github.com/test/actions/runs/1' }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()

    expect(wrapper.find('[role="status"]').text()).toBe('Data refresh triggered successfully')
    expect(wrapper.find('button').attributes('aria-label')).toBe('Refresh progression data')
  })

  it('announces the error outcome in the live region', async () => {
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

    expect(wrapper.find('[role="status"]').text()).toBe('Data refresh failed, try again later')
    expect(wrapper.find('button').attributes('aria-label')).toBe('Refresh progression data')
  })

  it('announces the rate-limited outcome with the remaining wait', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ retryAfter: 120 }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()

    expect(wrapper.find('[role="status"]').text()).toBe('Rate limited, retry in 2:00')
    expect(wrapper.find('button').attributes('aria-label')).toBe('Refresh progression data')
  })

  it('renders the run link on success when the worker returns one', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ actionsUrl: 'https://github.com/test/actions/runs/42' }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    expect(wrapper.find('.refresh-run-link').exists()).toBe(false)

    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()

    const link = wrapper.find('.refresh-run-link')
    expect(link.attributes('href')).toBe('https://github.com/test/actions/runs/42')
    expect(link.attributes('target')).toBe('_blank')
    expect(link.attributes('rel')).toBe('noopener noreferrer')
    expect(link.text()).toContain('opens in new tab')
  })

  it('omits the run link when the worker returns no actionsUrl', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ message: 'Refresh triggered' }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()

    expect(wrapper.text()).toContain('Triggered!')
    expect(wrapper.find('.refresh-run-link').exists()).toBe(false)
  })

  it('omits the run link when the refresh fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({ actionsUrl: 'https://github.com/test/actions/runs/7' }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()

    expect(wrapper.find('.refresh-btn').classes()).toContain('error')
    expect(wrapper.find('.refresh-run-link').exists()).toBe(false)
  })

  it('counts the rate-limit down from the retryAfter the worker sent', async () => {
    vi.useFakeTimers()
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ retryAfter: 65 }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()

    expect(wrapper.find('.refresh-label').text()).toBe('Wait 1:05')

    vi.advanceTimersByTime(6000)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.refresh-label').text()).toBe('Wait 59s')

    // Countdown exhausted: the button becomes usable again.
    vi.advanceTimersByTime(59000)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.refresh-label').text()).toBe('Refresh')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
    expect(wrapper.find('[role="status"]').text()).toBe('')
  })

  it('falls back to a ten-minute wait when the worker sends no retryAfter', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 429,
          json: () => Promise.resolve({ error: 'Rate limited' }),
        }),
      ),
    )
    const wrapper = mount(RefreshDataButton)
    await wrapper.find('button').trigger('click')
    await vi.dynamicImportSettled()

    expect(wrapper.find('.refresh-label').text()).toBe('Wait 10:00')
  })
})
