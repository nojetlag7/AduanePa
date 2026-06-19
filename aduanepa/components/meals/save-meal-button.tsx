"use client"

import { useState } from "react"
import { Bookmark, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function SaveMealButton({
  mealId,
  initiallySaved = false,
  compact = false,
}: {
  mealId: string
  initiallySaved?: boolean
  compact?: boolean
}) {
  const [saved, setSaved] = useState(initiallySaved)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (saved || loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/meals/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        toast.error(data.error ?? "Could not save meal")
        return
      }
      setSaved(true)
      toast.success("Meal saved to your collection")
    } catch {
      toast.error("Network error — try again")
    } finally {
      setLoading(false)
    }
  }

  if (compact) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleSave}
        disabled={saved || loading}
        className="h-8 w-8 shrink-0 text-text-muted hover:text-primary"
        aria-label={saved ? "Meal saved" : "Save meal"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Bookmark
            className={`h-4 w-4 ${saved ? "fill-primary text-primary" : ""}`}
            aria-hidden="true"
          />
        )}
      </Button>
    )
  }

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "default"}
      onClick={handleSave}
      disabled={saved || loading}
      className={saved ? "" : "bg-primary text-white hover:bg-primary-hover"}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Bookmark className="h-4 w-4" aria-hidden="true" />
      )}
      {saved ? "Saved" : "Save meal"}
    </Button>
  )
}
