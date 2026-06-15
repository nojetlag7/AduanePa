import { z } from "zod"
import type {
  User,
  MealPlan,
  Meal,
  SavedMeal,
  HealthLog,
  MealAdherenceLog,
  FoodItem,
  EmailOtp,
  Recommendation,
  HealthCondition,
  DietaryGoal,
  MealType,
  LogStatus,
  LanguagePreference,
  ThemePreference,
  MeasurementSystem,
  MealPlanSource,
} from "@prisma/client"

// ─── Shared Zod schemas for Json fields ─────────────────────────────────────
// Meal.ingredients and Meal.instructions are stored as Json in Postgres.
// These schemas are the single source of truth for validating that data at the
// service boundary — before every write and after every read.

export const IngredientSchema = z.object({
  name: z.string().min(1),
  amount: z.number().nonnegative(),
  unit: z.string().min(1),
})

export const IngredientsSchema = z.array(IngredientSchema)

export const InstructionSchema = z.string().min(1)

export const InstructionsSchema = z.array(InstructionSchema)

export type Ingredient = z.infer<typeof IngredientSchema>
export type Instructions = z.infer<typeof InstructionsSchema>

// ─── Re-exported Prisma model & enum types ──────────────────────────────────
// Centralises imports so feature code imports from "@/types" rather than
// reaching into "@prisma/client" directly.

export type {
  User,
  MealPlan,
  Meal,
  SavedMeal,
  HealthLog,
  MealAdherenceLog,
  FoodItem,
  EmailOtp,
  Recommendation,
  HealthCondition,
  DietaryGoal,
  MealType,
  LogStatus,
  LanguagePreference,
  ThemePreference,
  MeasurementSystem,
  MealPlanSource,
}

// ─── Composite / derived types ──────────────────────────────────────────────

export type MealPlanWithMeals = MealPlan & { meals: Meal[] }

export type UserProfile = Pick<
  User,
  | "id"
  | "name"
  | "email"
  | "dateOfBirth"
  | "weight"
  | "height"
  | "healthConditions"
  | "dietaryGoal"
  | "language"
  | "theme"
  | "measurementSystem"
>

// ─── Nutritional engine return types (used from Phase 5 onwards) ─────────────

export interface NutritionalTargets {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}

export interface MacroTotals {
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
}
