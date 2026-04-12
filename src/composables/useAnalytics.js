import { firebaseApp } from '@/firebase'

/**
 * Composable that wraps Firebase Analytics logEvent.
 * No-ops outside production. Never throws.
 * Uses dynamic import() so firebase/analytics is only loaded in production.
 * @returns {{ trackEvent: (eventName: string, params?: Record<string, unknown>) => void }}
 */
export function useAnalytics() {
  function trackEvent(eventName, params) {
    if (!import.meta.env.PROD) return
    import('firebase/analytics')
      .then(({ getAnalytics, logEvent }) => {
        const analytics = getAnalytics(firebaseApp)
        logEvent(analytics, eventName, params)
      })
      .catch(() => {
        // Silently ignore — analytics should never break the app
      })
  }

  return { trackEvent }
}
