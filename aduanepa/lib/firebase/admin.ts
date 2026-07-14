import "server-only"
import { cert, getApps, initializeApp, type App } from "firebase-admin/app"
import { getMessaging, type Messaging } from "firebase-admin/messaging"

function normalizePrivateKey(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  // .env stores newlines as the two-character sequence \n
  return raw.replace(/\\n/g, "\n")
}

function getAdminApp(): App | null {
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY)

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("[firebase-admin] Missing FIREBASE_PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY")
    return null
  }

  if (getApps().length > 0) {
    return getApps()[0]!
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
}

/** Firebase Admin Messaging instance, or null if env is incomplete. */
export function getAdminMessaging(): Messaging | null {
  const app = getAdminApp()
  if (!app) return null
  return getMessaging(app)
}
