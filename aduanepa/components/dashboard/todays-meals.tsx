import { GeneratePlanButton } from "@/components/dashboard/generate-plan-button"
import { MealCard } from "@/components/meals/meal-card"
import { MEAL_SLOT_ORDER, MEAL_TYPE_LABELS, mealsByType } from "@/lib/meal-utils"
import type { Meal } from "@/types"

export function TodaysMeals({
  meals,
  hasPlan,
  savedMealIds,
}: {
  meals: Meal[]
  hasPlan: boolean
  savedMealIds: Set<string>
}) {
  const byType = mealsByType(meals)

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">Today&apos;s meals</h2>
          <p className="text-sm text-text-secondary">
            Ghanaian-first plans tailored to your health profile.
          </p>
        </div>
        <GeneratePlanButton
          hasPlan={hasPlan}
          className="bg-primary text-white hover:bg-primary-hover"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MEAL_SLOT_ORDER.map((slot) => {
          const meal = byType.get(slot)
          return meal ? (
            <MealCard
              key={slot}
              meal={meal}
              compact
              isSaved={savedMealIds.has(meal.id)}
            />
          ) : (
            <div
              key={slot}
              className="flex min-h-[140px] flex-col justify-center rounded-xl border border-dashed border-border-medium bg-bg-card px-5 py-6 text-center"
            >
              <p className="text-sm font-medium text-text-primary">
                {MEAL_TYPE_LABELS[slot]}
              </p>
              <p className="mt-1 text-xs text-text-muted">Not planned</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
