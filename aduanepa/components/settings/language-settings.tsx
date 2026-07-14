"use client"

import { useState } from "react"
import { toast } from "sonner"
import { LanguagePreference } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { languageSettingsSchema } from "@/lib/validations/settings"
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<LanguagePreference>(
    user.language ?? LanguagePreference.ENGLISH
  )

  async function handleSave() {
    const parsed = languageSettingsSchema.safeParse({ language: selected })
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.language?.[0] ?? "Select a language")
      return
    }
    setError(null)

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
      window.location.reload()
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
      <div
        role="radiogroup"
        aria-label="Preferred language"
        className="grid gap-2 sm:grid-cols-3"
      >
        {LANGUAGES.map((lang) => (
          <button
            key={lang.value}
            type="button"
            role="radio"
            aria-checked={selected === lang.value}
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
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save language"}
        </Button>
      </div>
    </div>
  )
}
