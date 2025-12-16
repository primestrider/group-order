import { type FirebaseApp, initializeApp } from "firebase/app"
import { type Firestore, getFirestore } from "firebase/firestore"

/**
 * Checks whether all required Firebase environment variables are available.
 *
 * Firebase initialization should only happen when these variables exist
 * to prevent runtime errors during development or preview builds.
 */
export const hasFirebaseEnv = (): boolean => {
  return Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY &&
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID,
  )
}

/**
 * Firebase configuration object.
 * Values are read from Vite environment variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
}

/**
 * Firebase application instance.
 *
 * Will be `null` when Firebase environment variables are not provided.
 */
export const firebaseApp: FirebaseApp | null = hasFirebaseEnv()
  ? initializeApp(firebaseConfig)
  : null

/**
 * Firestore database instance.
 *
 * Will be `null` when Firebase is not initialized.
 */
export const firebaseDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null
