"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { passwordSettingsSchema } from "@/lib/validations/settings"

export function PasswordSettings() {
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const parsed = passwordSettingsSchema.safeParse(data)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors)
      return
    }
    setErrors({})
    setSaving(true)

    try {
      const res = await fetch("/api/users/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.fields) setErrors(json.fields)
        else toast.error(json.error ?? "Failed to update password")
        return
      }
      toast.success("Password updated")
      form.reset()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        {errors.currentPassword && (
          <p className="text-xs text-error">{errors.currentPassword[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {errors.newPassword && <p className="text-xs text-error">{errors.newPassword[0]}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmNewPassword">Confirm new password</Label>
        <Input
          id="confirmNewPassword"
          name="confirmNewPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {errors.confirmNewPassword && (
          <p className="text-xs text-error">{errors.confirmNewPassword[0]}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Updating…" : "Update password"}
        </Button>
      </div>
    </form>
  )
}
