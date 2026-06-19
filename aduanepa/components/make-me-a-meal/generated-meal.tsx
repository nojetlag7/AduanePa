"use client"

import { Clock, MapPin, RotateCcw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SaveMealButton } from "@/components/meals/save-meal-button"
import { formatMacro, MEAL_TYPE_LABELS } from "@/lib/meal-utils"
import type { GeneratedMeal } from "@/types"

export function GeneratedMealView({
  meal,
  macrosFromDb,
  onTryAgain,
  loading,
}: {
  meal: GeneratedMeal
  macrosFromDb: boolean
  onTryAgain: () => void
  loading: boolean
}) {
  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{MEAL_TYPE_LABELS[meal.type]}</Badge>
            {meal.isLocalDish && (
              <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                Local dish
              </Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {meal.prepTimeMin} min
            </Badge>
          </div>
          <h2 className="font-display text-xl font-bold text-text-primary">{meal.name}</h2>
          {meal.description && (
            <p className="max-w-prose text-sm text-text-secondary">{meal.description}</p>
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h3 className="font-display text-base font-semibold text-text-primary">
              Ingredients
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-text-secondary">
              {meal.ingredients.map((item, index) => (
                <li key={`${item.name}-${index}`} className="flex justify-between gap-4">
                  <span>{item.name}</span>
                  <span className="text-text-muted">
                    {item.amount} {item.unit}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-base font-semibold text-text-primary">
              Instructions
            </h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-text-secondary">
              {meal.instructions.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border-light bg-bg-muted/40 p-4">
            <h3 className="font-display text-base font-semibold text-text-primary">Nutrition</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-text-secondary">Calories</dt>
                <dd className="font-medium">{formatMacro(meal.calories, " kcal")}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Protein</dt>
                <dd className="font-medium">{formatMacro(meal.proteinG)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Carbs</dt>
                <dd className="font-medium">{formatMacro(meal.carbsG)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-text-secondary">Fat</dt>
                <dd className="font-medium">{formatMacro(meal.fatG)}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-text-muted">
              {macrosFromDb
                ? "Macros calculated from Ghana/USDA reference data for your ingredients."
                : "Nutritional values are estimates."}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <SaveMealButton meal={meal} />
            <Button
              type="button"
              variant="secondary"
              onClick={onTryAgain}
              disabled={loading}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </aside>
      </div>
    </section>
  )
}
