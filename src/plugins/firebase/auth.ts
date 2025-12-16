import { type Auth, type User, getAuth, signInAnonymously } from "firebase/auth"

import { firebaseApp } from "./index"

/**
 * Firebase Auth instance.
 *
 * Will be `null` when Firebase is not initialized
 * (e.g. missing environment variables).
 */
export const auth: Auth | null = firebaseApp ? getAuth(firebaseApp) : null

/**
 * Ensures that the current client is authenticated anonymously.
 *
 * This function should be called once during application bootstrap
 * (before mounting the Vue app) to guarantee that `auth.currentUser`
 * is available when Firebase is enabled.
 *
 * Behavior:
 * - If Firebase is not initialized, it resolves with `null`.
 * - If a user session already exists, it returns the current user.
 * - If no user session exists, it signs in anonymously.
 *
 * @returns A promise that resolves with the authenticated user,
 *          or `null` when Firebase is disabled.
 *
 * @throws {FirebaseError} When anonymous sign-in fails.
 */
export const ensureAnonymousAuth = async (): Promise<User | null> => {
  if (!auth) {
    console.warn("[Firebase Auth] Firebase is not initialized. Skipping auth.")
    return null
  }

  if (auth.currentUser) {
    return auth.currentUser
  }

  const credential = await signInAnonymously(auth)

  if (!credential.user) {
    throw new Error("Anonymous authentication failed")
  }

  return credential.user
}
