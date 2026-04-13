import { firebaseApp } from '@/firebase'

/**
 * Module-level singleton: resolves once with { analytics, logEvent }.
 * All callers share the same Promise, so firebase/analytics is imported
 * and getAnalytics() is called exactly once across the entire app.
 * @type {Promise<{ analytics: import('firebase/analytics').Analytics, logEvent: Function }> | null}
 */
let analyticsPromise = null

function getAnalyticsModule() {
  if (!analyticsPromise) {
    analyticsPromise = import('firebase/analytics').then(({ getAnalytics, logEvent }) => ({
      analytics: getAnalytics(firebaseApp),
      logEvent,
    }))
  }
  return analyticsPromise
}

/**
 * Composable that wraps Firebase Analytics logEvent.
 * No-ops outside production. Never throws.
 * Uses a module-level singleton so firebase/analytics is only loaded once.
 * @returns {{ trackEvent: (eventName: string, params?: Record<string, unknown>) => void }}
 */
export function useAnalytics() {
  function trackEvent(eventName, params) {
    if (!import.meta.env.PROD) return
    getAnalyticsModule()
      .then(({ analytics, logEvent }) => {
        logEvent(analytics, eventName, params)
      })
      .catch(() => {
        // Silently ignore — analytics should never break the app
      })
  }

  return { trackEvent }
}
