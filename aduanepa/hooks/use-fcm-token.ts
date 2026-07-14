"use client"

import { useCallback, useState, useSyncExternalStore } from "react"
import {
  requestNotificationPermission,
  type NotificationPermissionState,
} from "@/lib/firebase/messaging"

interface UseFcmTokenState {
  token: string | null
  permission: NotificationPermissionState
  error: string | null
  loading: boolean
  /** Request permission, get token, and POST it to /api/notifications/save-token */
  register: () => Promise<{ ok: boolean; token?: string; error?: string }>
}

function readBrowserPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) return "unsupported"
  return Notification.permission as NotificationPermissionState
}

export function useFcmToken(): UseFcmTokenState {
  const browserPermission = useSyncExternalStore(
    () => () => {},
    readBrowserPermission,
    () => "default" as NotificationPermissionState
  )
  const [permissionOverride, setPermissionOverride] =
    useState<NotificationPermissionState | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const permission = permissionOverride ?? browserPermission

  const register = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await requestNotificationPermission()
      setPermissionOverride(result.permission)

      if (!result.ok) {
        setError(result.error)
        setToken(null)
        return { ok: false, error: result.error }
      }

      setToken(result.token)

      const res = await fetch("/api/notifications/save-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: result.token }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        const message = data.error ?? "Failed to save device token"
        setError(message)
        return { ok: false, token: result.token, error: message }
      }

      return { ok: true, token: result.token }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed"
      setError(message)
      return { ok: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  return { token, permission, error, loading, register }
}
