"use client"

import { getToken } from "firebase/messaging"
import { getMessagingIfSupported } from "@/lib/firebase/client"
import { firebaseVapidKey } from "@/lib/firebase/config"

export type NotificationPermissionState =
  | "unsupported"
  | "denied"
  | "default"
  | "granted"

export type FcmTokenResult =
  | { ok: true; token: string; permission: "granted" }
  | {
      ok: false
      permission: NotificationPermissionState
      error: string
      token?: never
    }

const FCM_SW_PATH = "/firebase-messaging-sw.js"

async function getFcmServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null
  }

  try {
    // Prefer an existing registration for the FCM SW; otherwise register it.
    const existing = await navigator.serviceWorker.getRegistration(FCM_SW_PATH)
    if (existing) return existing
    return await navigator.serviceWorker.register(FCM_SW_PATH)
  } catch {
    return null
  }
}

/**
 * Request notification permission and retrieve an FCM registration token.
 * Never throws — always returns a typed result.
 */
export async function requestNotificationPermission(): Promise<FcmTokenResult> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return {
      ok: false,
      permission: "unsupported",
      error: "Notifications are not supported on this device.",
    }
  }

  if (!firebaseVapidKey) {
    return {
      ok: false,
      permission: Notification.permission as NotificationPermissionState,
      error: "Missing VAPID key configuration.",
    }
  }

  let permission = Notification.permission as NotificationPermissionState

  if (permission === "default") {
    permission = (await Notification.requestPermission()) as NotificationPermissionState
  }

  if (permission === "denied") {
    return {
      ok: false,
      permission: "denied",
      error: "Notifications are blocked in your browser settings.",
    }
  }

  if (permission !== "granted") {
    return {
      ok: false,
      permission,
      error: "Notification permission was not granted.",
    }
  }

  const messaging = await getMessagingIfSupported()
  if (!messaging) {
    return {
      ok: false,
      permission: "unsupported",
      error: "Push messaging is not supported in this browser.",
    }
  }

  const registration = await getFcmServiceWorkerRegistration()
  if (!registration) {
    return {
      ok: false,
      permission: "granted",
      error: "Could not register the notification service worker.",
    }
  }

  try {
    const token = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
      serviceWorkerRegistration: registration,
    })

    if (!token) {
      return {
        ok: false,
        permission: "granted",
        error: "Firebase did not return a device token.",
      }
    }

    return { ok: true, token, permission: "granted" }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to get FCM token"
    return { ok: false, permission: "granted", error: message }
  }
}
