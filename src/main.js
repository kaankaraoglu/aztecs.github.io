import './assets/tailwind.css'
import './assets/main.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAnalytics } from '@/composables/useAnalytics'

const app = createApp(App)
app.use(router)
app.mount('#app')

const { trackEvent } = useAnalytics()

router.afterEach((to) => {
  trackEvent('page_view', {
    page_title: to.meta.title || 'Aztecs',
    page_path: to.path,
  })
})

if (
  import.meta.env.PROD &&
  typeof window !== 'undefined' &&
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID &&
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID !== ''
) {
  const loadAnalytics = () => {
    Promise.all([import('firebase/analytics'), import('./firebase')])
      .then(([{ getAnalytics }, { getFirebaseApp }]) =>
        getFirebaseApp().then((app) => getAnalytics(app)),
      )
      .catch((err) => console.warn('Failed to initialize Firebase Analytics:', err))
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadAnalytics)
  } else {
    setTimeout(loadAnalytics, 0)
  }
}
