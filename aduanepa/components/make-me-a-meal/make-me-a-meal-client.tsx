"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  IngredientInput,
  type GeneratePayload,
} from "@/components/make-me-a-meal/ingredient-input"
import { GeneratedMealView } from "@/components/make-me-a-meal/generated-meal"
import { NoMealState } from "@/components/make-me-a-meal/no-meal-state"
import type { GeneratedMeal } from "@/types"

type Result =
  | { kind: "meal"; meal: GeneratedMeal; macrosFromDb: boolean }
  | { kind: "none"; suggestion: string }

interface ApiResponse {
  possible?: boolean
  meal?: GeneratedMeal
  macrosFromDb?: boolean
  suggestion?: string
  error?: string
}

export function MakeMeAMealClient() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [lastPayload, setLastPayload] = useState<GeneratePayload | null>(null)

  async function generate(payload: GeneratePayload) {
    setLoading(true)
    setLastPayload(payload)
    try {
      const res = await fetch("/api/meals/make-me-a-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = (await res.json()) as ApiResponse

      if (!res.ok) {
        toast.error(data.error ?? "Could not generate a meal")
        return
      }

      if (data.possible && data.meal) {
        setResult({
          kind: "meal",
          meal: data.meal,
          macrosFromDb: Boolean(data.macrosFromDb),
        })
      } else {
        setResult({
          kind: "none",
          suggestion: data.suggestion ?? "Try adding a protein and a vegetable to your list.",
        })
      }
    } catch {
      toast.error("Network error — try again")
    } finally {
      setLoading(false)
    }
  }

  function handleTryAgain() {
    if (lastPayload) void generate(lastPayload)
  }

  return (
    <div className="space-y-6">
      <IngredientInput onGenerate={generate} loading={loading} />

      {result?.kind === "meal" && (
        <GeneratedMealView
          meal={result.meal}
          macrosFromDb={result.macrosFromDb}
          onTryAgain={handleTryAgain}
          loading={loading}
        />
      )}

      {result?.kind === "none" && (
        <NoMealState
          suggestion={result.suggestion}
          onTryAgain={handleTryAgain}
          loading={loading}
        />
      )}
    </div>
  )
}
