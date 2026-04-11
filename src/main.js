import './assets/main.scss'

import { firebaseApp } from './firebase'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

if (
  import.meta.env.PROD &&
  typeof window !== 'undefined' &&
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID &&
  import.meta.env.VITE_FIREBASE_MEASUREMENT_ID !== ''
) {
  const loadAnalytics = () => {
    import('firebase/analytics')
      .then(({ getAnalytics }) => {
        try {
          getAnalytics(firebaseApp)
        } catch (e) {
          console.warn('Firebase Analytics initialization failed:', e)
        }
      })
      .catch((err) => console.warn('Failed to lazy-load Firebase Analytics:', err))
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(loadAnalytics)
  } else {
    setTimeout(loadAnalytics, 0)
  }
}
