import { type Auth, type User, getAuth, signInAnonymously } from "firebase/auth"

import { firebaseApp } from "./index"

/**
 * Firebase Auth instance
 * Used across the app for authentication & identity
 */
export const auth: Auth = getAuth(firebaseApp)

/**
 * Ensures that the current client is authenticated anonymously.
 *
 * This function should be called once during app bootstrap
 * (e.g. before mounting the Vue app) to guarantee that
 * `auth.currentUser` is always available.
 *
 * Behavior:
 * - If a user session already exists, it does nothing.
 * - If no user session exists, it signs in anonymously.
 *
 * @returns {Promise<User | null>} The authenticated user or null if unavailable.
 */
export const ensureAnonymousAuth = async (): Promise<User | null> => {
  if (auth.currentUser) {
    return auth.currentUser
  }

  const credential = await signInAnonymously(auth)
  console.log(credential.user.uid, "CREDENTIAL")
  return credential.user
}
