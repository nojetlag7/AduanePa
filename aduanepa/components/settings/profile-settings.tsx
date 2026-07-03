"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { profileSettingsSchema, type ProfileSettingsInput } from "@/lib/validations/settings"
import type { UserProfile } from "@/types"

interface Props {
  user: UserProfile
}

export function ProfileSettings({ user }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileSettingsInput, string[]>>>({})

  const dobValue = user.dateOfBirth
    ? new Date(user.dateOfBirth).toISOString().split("T")[0]
    : ""

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const parsed = profileSettingsSchema.safeParse(data)
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as typeof errors)
      return
    }
    setErrors({})
    setSaving(true)

    try {
      const res = await fetch("/api/users/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          weight: Number(data.weight),
          height: Number(data.height),
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.fields) setErrors(json.fields)
        else toast.error(json.error ?? "Failed to update profile")
        return
      }
      toast.success("Profile updated")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name ?? ""}
            autoComplete="name"
            required
          />
          {errors.name && <p className="text-xs text-error">{errors.name[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={user.email}
            autoComplete="email"
            required
          />
          {errors.email && <p className="text-xs text-error">{errors.email[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={dobValue}
            required
          />
          {errors.dateOfBirth && <p className="text-xs text-error">{errors.dateOfBirth[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            step="0.1"
            min="20"
            max="300"
            defaultValue={user.weight ?? ""}
            required
          />
          {errors.weight && <p className="text-xs text-error">{errors.weight[0]}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            name="height"
            type="number"
            step="0.1"
            min="50"
            max="250"
            defaultValue={user.height ?? ""}
            required
          />
          {errors.height && <p className="text-xs text-error">{errors.height[0]}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
