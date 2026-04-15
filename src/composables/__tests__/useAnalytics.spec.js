import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'

let mockLogEvent = vi.fn()
let mockGetAnalytics = vi.fn(() => 'mock-analytics-instance')

vi.mock('firebase/analytics', () => ({
  getAnalytics: (...args) => mockGetAnalytics(...args),
  logEvent: (...args) => mockLogEvent(...args),
}))

vi.mock('@/firebase', () => ({
  firebaseApp: 'mock-firebase-app',
}))

const { useAnalytics } = await import('../useAnalytics')

describe('useAnalytics', () => {
  beforeEach(() => {
    mockLogEvent = vi.fn()
    mockGetAnalytics = vi.fn(() => 'mock-analytics-instance')
    vi.stubGlobal('import', { meta: { env: { PROD: true } } })
  })

  it('returns an object with a trackEvent function', () => {
    const result = useAnalytics()
    expect(result).toHaveProperty('trackEvent')
    expect(typeof result.trackEvent).toBe('function')
  })

  it('calls getAnalytics with firebaseApp and logEvent with correct args in production', async () => {
    const originalProd = import.meta.env.PROD
    import.meta.env.PROD = true

    const { trackEvent } = useAnalytics()
    trackEvent('select_content', { content_type: 'boss_roster', item_id: "Ky'veza" })

    await flushPromises()

    expect(mockGetAnalytics).toHaveBeenCalledWith('mock-firebase-app')
    expect(mockLogEvent).toHaveBeenCalledWith('mock-analytics-instance', 'select_content', {
      content_type: 'boss_roster',
      item_id: "Ky'veza",
    })

    import.meta.env.PROD = originalProd
  })

  it('does not call logEvent when not in production', async () => {
    const originalProd = import.meta.env.PROD
    import.meta.env.PROD = false

    const { trackEvent } = useAnalytics()
    trackEvent('select_content', { content_type: 'boss_roster', item_id: 'Test' })

    await flushPromises()

    expect(mockLogEvent).not.toHaveBeenCalled()

    import.meta.env.PROD = originalProd
  })

  it('does not throw when getAnalytics throws', async () => {
    const originalProd = import.meta.env.PROD
    import.meta.env.PROD = true
    mockGetAnalytics = vi.fn(() => {
      throw new Error('Analytics not initialized')
    })

    const { trackEvent } = useAnalytics()
    trackEvent('click', { link_type: 'discord_invite' })

    await flushPromises()

    import.meta.env.PROD = originalProd
  })

  it('does not throw when logEvent throws', async () => {
    const originalProd = import.meta.env.PROD
    import.meta.env.PROD = true
    mockLogEvent = vi.fn(() => {
      throw new Error('logEvent failed')
    })

    const { trackEvent } = useAnalytics()
    trackEvent('click', { link_type: 'external' })

    await flushPromises()

    import.meta.env.PROD = originalProd
  })
})
