import './assets/main.scss'

// Firebase Core
import { initializeApp } from 'firebase/app'
// Removed direct getAnalytics import to defer analytics loading

// Vue
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase core as early as needed for the app
const firebaseApp = initializeApp(firebaseConfig)

const app = createApp(App)
app.use(router)
app.mount('#app')

// Defer analytics: only load in production, in browser, and if measurementId provided
if (
  import.meta.env.PROD &&
  typeof window !== 'undefined' &&
  firebaseConfig.measurementId &&
  firebaseConfig.measurementId !== ''
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
