import Link from "next/link"
import { Clock, MapPin } from "lucide-react"
import { SaveMealButton } from "@/components/meals/save-meal-button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMacro, MEAL_TYPE_LABELS, parseMealIngredients } from "@/lib/meal-utils"
import type { Meal } from "@/types"

const MAX_PREVIEW_INGREDIENTS = 4

export function MealCard({
  meal,
  compact = false,
  isSaved = false,
}: {
  meal: Meal
  compact?: boolean
  isSaved?: boolean
}) {
  const ingredients = parseMealIngredients(meal)
  const preview = ingredients.slice(0, MAX_PREVIEW_INGREDIENTS)
  const extraCount = ingredients.length - preview.length

  return (
    <Card className="border-border-light bg-bg-card shadow-sm transition-shadow hover:shadow-md">
      <CardHeader className="gap-2 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{MEAL_TYPE_LABELS[meal.type]}</Badge>
            {meal.isLocalDish && (
              <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                Local dish
              </Badge>
            )}
          </div>
          <SaveMealButton mealId={meal.id} initiallySaved={isSaved} compact />
        </div>
        <CardTitle className="text-base font-semibold text-text-primary">
          <Link href={`/meals/${meal.id}`} className="hover:text-primary">
            {meal.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-text-secondary">
        {!compact && meal.description && (
          <p className="line-clamp-2">{meal.description}</p>
        )}
        {preview.length > 0 && (
          <p className="text-text-muted">
            {preview.map((i) => i.name).join(", ")}
            {extraCount > 0 ? ` +${extraCount} more` : ""}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs font-medium text-text-secondary">
          <span>{formatMacro(meal.calories, " kcal")}</span>
          <span>P {formatMacro(meal.proteinG)}</span>
          <span>C {formatMacro(meal.carbsG)}</span>
          <span>F {formatMacro(meal.fatG)}</span>
          {meal.prepTimeMin != null && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {meal.prepTimeMin} min
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function MealCardSkeleton() {
  return (
    <Card className="border-border-light bg-bg-card">
      <CardHeader className="gap-3 pb-2">
        <div className="h-5 w-20 animate-pulse rounded-full bg-bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-bg-muted" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="h-4 w-full animate-pulse rounded bg-bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-bg-muted" />
      </CardContent>
    </Card>
  )
}
