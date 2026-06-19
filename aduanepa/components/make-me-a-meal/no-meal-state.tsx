"use client"

import { RotateCcw, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NoMealState({
  suggestion,
  onTryAgain,
  loading,
}: {
  suggestion: string
  onTryAgain: () => void
  loading: boolean
}) {
  return (
    <section className="flex flex-col items-center rounded-xl border border-dashed border-border-medium bg-bg-card px-6 py-12 text-center shadow-card">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-bg text-warning-dark">
        <UtensilsCrossed className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="font-display text-lg font-semibold text-text-primary">
        Not quite enough to cook with
      </h2>
      <p className="mt-2 max-w-md text-sm text-text-secondary">{suggestion}</p>
      <Button
        type="button"
        variant="secondary"
        onClick={onTryAgain}
        disabled={loading}
        className="mt-5"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  )
}
