/**
 * Firebase is loaded lazily.
 *
 * `initializeApp` at module scope made `firebase/app` a static dependency of
 * the entry chunk, so the browser modulepreloaded ~41 KB of Firebase on every
 * page load — including routes with no analytics and builds with analytics
 * switched off entirely. Behind a function, nothing loads until the first
 * tracked event fires.
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

/** @type {Promise<import('firebase/app').FirebaseApp> | null} */
let appPromise = null

/**
 * Initialises the Firebase app on first use and reuses it thereafter.
 * @returns {Promise<import('firebase/app').FirebaseApp>}
 */
export function getFirebaseApp() {
  if (!appPromise) {
    appPromise = import('firebase/app').then(({ initializeApp }) => initializeApp(firebaseConfig))
  }
  return appPromise
}
