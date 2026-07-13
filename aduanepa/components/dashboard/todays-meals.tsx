"use client"

import { Coffee, Cookie, Moon, Sun, type LucideIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { MealType } from "@prisma/client"
import { GeneratePlanButton } from "@/components/dashboard/generate-plan-button"
import { MealCard } from "@/components/meals/meal-card"
import { MEAL_SLOT_ORDER, mealsByType } from "@/lib/meal-utils"
import type { Meal } from "@/types"

const SLOT_ICONS: Record<MealType, LucideIcon> = {
  BREAKFAST: Coffee,
  LUNCH: Sun,
  DINNER: Moon,
  SNACK: Cookie,
}

const SLOT_KEYS: Record<MealType, "breakfast" | "lunch" | "dinner" | "snack"> = {
  BREAKFAST: "breakfast",
  LUNCH: "lunch",
  DINNER: "dinner",
  SNACK: "snack",
}

export function TodaysMeals({
  meals,
  hasPlan,
  savedMealIds,
}: {
  meals: Meal[]
  hasPlan: boolean
  savedMealIds: Set<string>
}) {
  const t = useTranslations("meals")
  const byType = mealsByType(meals)

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            {t("todaysPlan")}
          </h2>
          <p className="text-sm text-text-secondary">{t("todaysPlanSubtitle")}</p>
        </div>
        <GeneratePlanButton hasPlan={hasPlan} />
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
              className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-medium bg-bg-muted/50 px-5 py-6 text-center"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-card text-text-muted shadow-card">
                {(() => {
                  const Icon = SLOT_ICONS[slot]
                  return <Icon className="h-5 w-5" aria-hidden="true" />
                })()}
              </span>
              <div>
                <p className="text-sm font-medium text-text-primary">{t(SLOT_KEYS[slot])}</p>
                <p className="mt-0.5 text-xs text-text-muted">{t("noMealPlanned")}</p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
