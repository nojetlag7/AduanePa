import { z } from "zod"
import {
  MealType,
  type User,
  type MealPlan,
  type Meal,
  type SavedMeal,
  type HealthLog,
  type MealAdherenceLog,
  type FoodItem,
  type EmailOtp,
  type Recommendation,
  type HealthCondition,
  type DietaryGoal,
  type LogStatus,
  type LanguagePreference,
  type ThemePreference,
  type MeasurementSystem,
  type MealPlanSource,
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

// ─── AI meal plan response (Phase 6+) ───────────────────────────────────────

export const GeneratedMealSchema = z.object({
  type: z.nativeEnum(MealType),
  name: z.string().min(1),
  description: z.string().min(1),
  ingredients: IngredientsSchema,
  instructions: InstructionsSchema,
  calories: z.number().int().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  prepTimeMin: z.number().int().positive(),
  isLocalDish: z.boolean(),
})

export const MealPlanResponseSchema = z.object({
  meals: z.array(GeneratedMealSchema).min(1),
})

export type GeneratedMeal = z.infer<typeof GeneratedMealSchema>
export type MealPlanResponse = z.infer<typeof MealPlanResponseSchema>
