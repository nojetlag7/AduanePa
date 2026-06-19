import { getMealPlanByDate } from "@/lib/services/meals"
import type { MacroTotals } from "@/types"

export type DailyNutrition = MacroTotals & { mealCount: number }

export async function getDailyNutrition(
  userId: string,
  date: Date
): Promise<DailyNutrition | null> {
  const plan = await getMealPlanByDate(userId, date)
  if (!plan || plan.meals.length === 0) return null

  let calories = 0
  let proteinG = 0
  let carbsG = 0
  let fatG = 0

  for (const meal of plan.meals) {
    calories += meal.calories ?? 0
    proteinG += meal.proteinG ?? 0
    carbsG += meal.carbsG ?? 0
    fatG += meal.fatG ?? 0
  }

  return {
    calories: Math.round(calories),
    proteinG: Math.round(proteinG * 10) / 10,
    carbsG: Math.round(carbsG * 10) / 10,
    fatG: Math.round(fatG * 10) / 10,
    mealCount: plan.meals.length,
  }
}
