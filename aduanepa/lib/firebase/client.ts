"use client"

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import {
  getMessaging,
  isSupported,
  type Messaging,
} from "firebase/messaging"
import {
  firebaseClientConfig,
  isFirebaseClientConfigured,
} from "@/lib/firebase/config"

let messagingPromise: Promise<Messaging | null> | null = null

function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null
  if (!isFirebaseClientConfigured()) return null

  return getApps().length > 0 ? getApp() : initializeApp(firebaseClientConfig)
}

/**
 * Returns Firebase Messaging only in supported browsers.
 * Safe to call during SSR — resolves to null on the server.
 */
export async function getMessagingIfSupported(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null
  if (!isFirebaseClientConfigured()) return null

  if (!messagingPromise) {
    messagingPromise = (async () => {
      try {
        const supported = await isSupported()
        if (!supported) return null
        const app = getFirebaseApp()
        if (!app) return null
        return getMessaging(app)
      } catch {
        return null
      }
    })()
  }

  return messagingPromise
}
