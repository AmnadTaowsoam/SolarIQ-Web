import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth'

// Lazy initialization to avoid build-time errors
let firebaseApp: FirebaseApp | null = null
let firebaseAuth: Auth | null = null

function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    }

    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  }
  return firebaseApp
}

function getFirebaseAuth(): Auth {
  if (!firebaseAuth) {
    firebaseAuth = getAuth(getFirebaseApp())

    // Connect to emulator in development if needed
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
      connectAuthEmulator(firebaseAuth, 'http://localhost:9099')
    }
  }
  return firebaseAuth
}

// Export getters for lazy initialization
export { getFirebaseApp, getFirebaseAuth }

// Legacy exports for backward compatibility (lazy initialized on first access)
export const app = new Proxy({} as FirebaseApp, {
  get(_, prop) {
    return Reflect.get(getFirebaseApp(), prop)
  },
})

export const auth = new Proxy({} as Auth, {
  get(_, prop) {
    return Reflect.get(getFirebaseAuth(), prop)
  },
})
