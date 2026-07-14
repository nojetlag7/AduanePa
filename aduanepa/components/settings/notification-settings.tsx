"use client"

import { useState } from "react"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useFcmToken } from "@/hooks/use-fcm-token"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface NotificationSettingsProps {
  initialEnabled: boolean
}

export function NotificationSettings({ initialEnabled }: NotificationSettingsProps) {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)
  const { permission, error, loading, register, token } = useFcmToken()

  const unsupported = permission === "unsupported"
  const blocked = permission === "denied"

  async function enableNotifications() {
    setSaving(true)
    try {
      const result = await register()
      if (!result.ok || !result.token) {
        toast.error(result.error ?? "Could not enable notifications")
        return
      }

      const res = await fetch("/api/notifications/preference", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: true, token: result.token }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(data.error ?? "Failed to save preference")
        return
      }

      setEnabled(true)
      toast.success("Notifications enabled")
    } finally {
      setSaving(false)
    }
  }

  async function disableNotifications() {
    setSaving(true)
    try {
      const res = await fetch("/api/notifications/preference", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: false, token: token ?? undefined }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        toast.error(data.error ?? "Failed to disable notifications")
        return
      }

      setEnabled(false)
      toast.success("Notifications disabled")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-border-light bg-bg-muted/40 p-4">
        <span
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            enabled ? "bg-primary/10 text-primary" : "bg-bg-card text-text-muted"
          )}
        >
          {enabled ? (
            <Bell className="h-4 w-4" aria-hidden="true" />
          ) : (
            <BellOff className="h-4 w-4" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text-primary">
            {enabled ? "Push notifications are on" : "Push notifications are off"}
          </p>
          <p className="mt-0.5 text-xs text-text-secondary">
            Get reminders about meal plans, health logs, and recommendations.
          </p>

          {unsupported && (
            <p className="mt-2 text-xs text-warning">
              Unsupported on this device or browser.
            </p>
          )}
          {blocked && (
            <p className="mt-2 text-xs text-error">
              Blocked in browser settings — allow notifications for this site, then try again.
            </p>
          )}
          {error && !blocked && !unsupported && (
            <p className="mt-2 text-xs text-error">{error}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!enabled ? (
          <Button
            type="button"
            onClick={enableNotifications}
            disabled={saving || loading || unsupported || blocked}
            className="bg-primary text-white hover:bg-primary-hover"
          >
            {(saving || loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enable notifications
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={disableNotifications}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disable notifications
          </Button>
        )}
      </div>
    </div>
  )
}
