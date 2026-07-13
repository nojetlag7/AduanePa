import type { Metadata } from "next"
import { UtensilsCrossed } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { MealsDateNav } from "@/components/meals/meals-date-nav"
import { MealCard } from "@/components/meals/meal-card"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { auth } from "@/lib/auth"
import { MEAL_SLOT_ORDER, mealsByType, parseDateInput } from "@/lib/meal-utils"
import { getMealPlanByDate, getSavedSourceMealIds } from "@/lib/services/meals"

export const metadata: Metadata = { title: "My Meals · AduanePa" }

export default async function MealsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const session = await auth()
  const { date: dateParam } = await searchParams
  const date = parseDateInput(dateParam)
  const userId = session!.user!.id
  const t = await getTranslations("meals")
  const [plan, savedIds] = await Promise.all([
    getMealPlanByDate(userId, date),
    getSavedSourceMealIds(userId),
  ])
  const byType = mealsByType(plan?.meals ?? [])

  return (
    <>
      <PageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />
      <MealsDateNav date={date} />

      <div className="mt-6">
        {plan && plan.meals.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {MEAL_SLOT_ORDER.map((slot) => {
              const meal = byType.get(slot)
              return meal ? (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  isSaved={savedIds.has(meal.id)}
                />
              ) : null
            })}
          </div>
        ) : (
          <EmptyState
            icon={UtensilsCrossed}
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        )}
      </div>
    </>
  )
}
