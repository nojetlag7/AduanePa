"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function GeneratePlanButton({
  hasPlan,
  className,
}: {
  hasPlan: boolean
  className?: string
}) {
  const router = useRouter()
  const t = useTranslations("meals")
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch("/api/meals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: hasPlan }),
      })

      const data = (await res.json()) as { error?: string; cached?: boolean }

      if (!res.ok) {
        toast.error(data.error ?? "Could not generate meal plan")
        return
      }

      if (data.cached) {
        toast.message("Today's plan is already saved")
      } else {
        toast.success(hasPlan ? "Meal plan regenerated" : "Meal plan generated")
      }

      router.refresh()
    } catch {
      toast.error("Network error — try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      className={className}
      onClick={handleGenerate}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      )}
      {loading ? t("generatingPlan") : hasPlan ? t("regeneratePlan") : t("generatePlan")}
    </Button>
  )
}
