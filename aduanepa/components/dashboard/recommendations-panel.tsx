"use client"

import * as React from "react"
import { Lightbulb, Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { RecommendationItem } from "@/types"

interface ApiResult {
  ready: boolean
  recommendations?: RecommendationItem[]
  daysLogged?: number
  required?: number
  error?: string
}

export function RecommendationsPanel({
  initialItems,
  daysLogged,
  minDays,
}: {
  initialItems: RecommendationItem[]
  daysLogged: number
  minDays: number
}) {
  const [items, setItems] = React.useState<RecommendationItem[]>(initialItems)
  const [loading, setLoading] = React.useState(false)
  const [enoughData, setEnoughData] = React.useState(daysLogged >= minDays)

  async function refresh() {
    setLoading(true)
    try {
      const res = await fetch("/api/recommendations", { method: "POST" })
      const data = (await res.json()) as ApiResult

      if (!res.ok) {
        toast.error(data.error ?? "Could not generate recommendations")
        return
      }

      if (!data.ready) {
        setEnoughData(false)
        return
      }

      setEnoughData(true)
      setItems(data.recommendations ?? [])
      toast.success("Recommendations updated")
    } catch {
      toast.error("Network error — try again")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 className="font-display text-base font-semibold text-text-primary">
            For you
          </h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          )}
          {loading ? "Thinking…" : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : !enoughData ? (
        <p className="text-sm text-text-secondary">
          Log a few more days of health data to unlock personalised
          recommendations.{" "}
          <span className="text-text-muted">
            ({daysLogged}/{minDays} days so far)
          </span>
        </p>
      ) : items.length === 0 ? (
        <p className="text-sm text-text-secondary">
          Tap <span className="font-medium text-text-primary">Refresh</span> to
          generate recommendations from your recent data.
        </p>
      ) : (
        <ol className="space-y-3">
          {items.map((item) => (
            <li key={item.number} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {item.number}
              </span>
              <p className="text-sm text-text-secondary">{item.text}</p>
            </li>
          ))}
        </ol>
      )}

      <p className="mt-4 border-t border-border-light pt-3 text-xs text-text-muted">
        These recommendations are based on your logged data and are not a
        substitute for medical advice.
      </p>
    </section>
  )
}
