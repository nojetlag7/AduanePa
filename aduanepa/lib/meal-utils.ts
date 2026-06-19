import { MealType } from "@prisma/client"
import { IngredientsSchema } from "@/types"
import type { Ingredient, Meal } from "@/types"

export const MEAL_SLOT_ORDER: MealType[] = [
  MealType.BREAKFAST,
  MealType.LUNCH,
  MealType.DINNER,
  MealType.SNACK,
]

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
  SNACK: "Snack",
}

export function parseMealIngredients(meal: Pick<Meal, "ingredients">): Ingredient[] {
  const parsed = IngredientsSchema.safeParse(meal.ingredients)
  return parsed.success ? parsed.data : []
}

export function mealsByType(meals: Meal[]): Map<MealType, Meal> {
  const map = new Map<MealType, Meal>()
  for (const meal of meals) {
    if (!map.has(meal.type)) {
      map.set(meal.type, meal)
    }
  }
  return map
}

export function formatMacro(value: number | null | undefined, unit = "g"): string {
  if (value == null) return "—"
  return `${Number.isInteger(value) ? value : value.toFixed(1)}${unit}`
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function toDateInputValue(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function parseDateInput(value: string | undefined): Date {
  if (!value) return startOfDay(new Date())
  const parsed = new Date(`${value}T12:00:00`)
  if (Number.isNaN(parsed.getTime())) return startOfDay(new Date())
  return startOfDay(parsed)
}

export function shiftDate(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return startOfDay(next)
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
