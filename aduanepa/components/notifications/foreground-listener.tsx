"use client"

import { useEffect } from "react"
import { onMessage } from "firebase/messaging"
import { toast } from "sonner"
import { getMessagingIfSupported } from "@/lib/firebase/client"

/**
 * Subscribes to foreground FCM messages and surfaces them as Sonner toasts.
 * Mount once inside the authenticated app shell. No-ops when messaging unsupported.
 */
export function ForegroundListener() {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    void (async () => {
      const messaging = await getMessagingIfSupported()
      if (!messaging) return

      unsubscribe = onMessage(messaging, (payload) => {
        const title =
          payload.notification?.title ||
          payload.data?.title ||
          "AduanePa"
        const body =
          payload.notification?.body ||
          payload.data?.body ||
          "You have a new update."
        const url = payload.data?.url || "/dashboard"

        toast(title, {
          description: body,
          action: {
            label: "Open",
            onClick: () => {
              window.location.assign(url)
            },
          },
        })
      })
    })()

    return () => {
      unsubscribe?.()
    }
  }, [])

  return null
}
