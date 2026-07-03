"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LanguagePreference } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UserProfile } from "@/types"

const LANGUAGES: { value: LanguagePreference; label: string; native: string }[] = [
  { value: LanguagePreference.ENGLISH, label: "English", native: "English" },
  { value: LanguagePreference.TWI, label: "Twi", native: "Twi (Akan)" },
  { value: LanguagePreference.GA, label: "Ga", native: "Ga" },
]

interface Props {
  user: UserProfile
}

export function LanguageSettings({ user }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<LanguagePreference>(
    user.language ?? LanguagePreference.ENGLISH
  )

  async function handleSave() {
    if (selected === user.language) {
      toast.info("Language unchanged")
      return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/users/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selected }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Failed to update language")
        return
      }
      toast.success("Language updated")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-muted">
        Meal names and descriptions will be translated into your chosen language.
        Static interface labels will update in a future release.
      </p>
      <div className="grid gap-2 sm:grid-cols-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            type="button"
            onClick={() => setSelected(lang.value)}
            className={cn(
              "flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors duration-200",
              selected === lang.value
                ? "border-primary bg-primary/5 text-primary"
                : "border-border-light text-text-primary hover:bg-bg-muted"
            )}
          >
            <span className="text-sm font-semibold">{lang.label}</span>
            <span className="text-xs text-text-muted">{lang.native}</span>
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save language"}
        </Button>
      </div>
    </div>
  )
}
