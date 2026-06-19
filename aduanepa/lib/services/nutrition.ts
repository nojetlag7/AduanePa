import { prisma } from "@/lib/db"
import { getMealPlanByDate } from "@/lib/services/meals"
import { parseMealIngredients, startOfDay } from "@/lib/meal-utils"
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

// ─── Phase 9 — trends, macro breakdown, top foods ───────────────────────────

export interface TrendPoint {
  /** ISO yyyy-mm-dd */
  date: string
  /** Short display label, e.g. "12 Jun" */
  label: string
  calories: number
}

function toIsoDate(date: Date): string {
  return startOfDay(date).toLocaleDateString("en-CA") // yyyy-mm-dd, local
}

function shortLabel(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

/**
 * Daily calorie totals for the last `days`, oldest → newest. Days without a
 * plan are returned as 0 so line charts render a continuous axis.
 */
export async function getNutritionTrend(
  userId: string,
  days: 14 | 30
): Promise<TrendPoint[]> {
  const today = startOfDay(new Date())
  const start = startOfDay(new Date())
  start.setDate(start.getDate() - (days - 1))

  const plans = await prisma.mealPlan.findMany({
    where: { userId, date: { gte: start, lte: today } },
    include: { meals: { select: { calories: true } } },
  })

  const caloriesByDate = new Map<string, number>()
  for (const plan of plans) {
    const key = toIsoDate(plan.date)
    const total = plan.meals.reduce((sum, m) => sum + (m.calories ?? 0), 0)
    caloriesByDate.set(key, (caloriesByDate.get(key) ?? 0) + total)
  }

  const points: TrendPoint[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const key = toIsoDate(d)
    points.push({ date: key, label: shortLabel(d), calories: Math.round(caloriesByDate.get(key) ?? 0) })
  }
  return points
}

export interface MacroBreakdown extends MacroTotals {
  /** Number of distinct days that had a plan in the window. */
  daysWithData: number
}

/**
 * Average daily protein / carbs / fat (grams) across the inclusive date range.
 * Averaged over days that actually have a plan, so a sparse week isn't diluted.
 */
export async function getMacroBreakdown(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<MacroBreakdown> {
  const plans = await prisma.mealPlan.findMany({
    where: { userId, date: { gte: startOfDay(startDate), lte: startOfDay(endDate) } },
    include: { meals: { select: { calories: true, proteinG: true, carbsG: true, fatG: true } } },
  })

  const days = new Set<string>()
  let calories = 0
  let proteinG = 0
  let carbsG = 0
  let fatG = 0

  for (const plan of plans) {
    days.add(toIsoDate(plan.date))
    for (const meal of plan.meals) {
      calories += meal.calories ?? 0
      proteinG += meal.proteinG ?? 0
      carbsG += meal.carbsG ?? 0
      fatG += meal.fatG ?? 0
    }
  }

  const n = days.size || 1
  return {
    calories: Math.round(calories / n),
    proteinG: Math.round((proteinG / n) * 10) / 10,
    carbsG: Math.round((carbsG / n) * 10) / 10,
    fatG: Math.round((fatG / n) * 10) / 10,
    daysWithData: days.size,
  }
}

export interface TopFood {
  name: string
  count: number
}

/**
 * Most frequently appearing ingredient names across all of the user's meals.
 */
export async function getTopFoods(userId: string, limit = 10): Promise<TopFood[]> {
  const meals = await prisma.meal.findMany({
    where: { mealPlan: { userId } },
    select: { ingredients: true },
  })

  const counts = new Map<string, { name: string; count: number }>()
  for (const meal of meals) {
    for (const ingredient of parseMealIngredients(meal)) {
      const key = ingredient.name.trim().toLowerCase()
      if (!key) continue
      const existing = counts.get(key)
      if (existing) existing.count += 1
      else counts.set(key, { name: ingredient.name.trim(), count: 1 })
    }
  }

  return [...counts.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, limit)
}
