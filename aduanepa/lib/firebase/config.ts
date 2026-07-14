/**
 * Firebase web client config — all values from NEXT_PUBLIC_* env vars.
 * Safe to import from client components; contains no server secrets.
 */
export const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
} as const

export const firebaseVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!

export function isFirebaseClientConfigured(): boolean {
  return Boolean(
    firebaseClientConfig.apiKey &&
      firebaseClientConfig.projectId &&
      firebaseClientConfig.appId &&
      firebaseClientConfig.messagingSenderId
  )
}
