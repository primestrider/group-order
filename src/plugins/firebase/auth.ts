import { type Auth, type User, getAuth, onAuthStateChanged, signInAnonymously } from "firebase/auth"

import { firebaseApp } from "./index"

export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null

/**
 * Ensures that the current client is authenticated anonymously
 * and waits until Firebase Auth is fully ready.
 */
export const ensureAnonymousAuth = async (): Promise<User | null> => {
  if (!auth) {
    console.warn("[Firebase Auth] Firebase is not initialized. Skipping auth.")
    return null
  }

  // Already signed in
  if (auth.currentUser) {
    return auth.currentUser
  }

  // Sign in anonymously
  await signInAnonymously(auth)

  // 🔑 IMPORTANT: wait until auth state is ready
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe()
        resolve(user)
      },
      (error) => {
        unsubscribe()
        reject(error)
      },
    )
  })
}
