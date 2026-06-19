import { z } from "zod"
import { MealType } from "@prisma/client"
import { GeneratedMealSchema } from "@/types"

export const GenerateMealPlanSchema = z.object({
  regenerate: z.boolean().optional().default(false),
})

export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanSchema>

/**
 * Save a meal either by referencing an existing DB meal (`mealId`) or by
 * sending a full ad-hoc meal snapshot (`meal`) — used by Make Me a Meal,
 * where the generated meal is never persisted to a MealPlan.
 */
export const SaveMealSchema = z.union([
  z.object({ mealId: z.string().min(1) }),
  z.object({ meal: GeneratedMealSchema }),
])

export type SaveMealInput = z.infer<typeof SaveMealSchema>

export const MakeMeAMealSchema = z.object({
  ingredients: z.array(z.string().trim().min(1).max(60)).min(1).max(30),
  mealType: z.nativeEnum(MealType).optional(),
  strictIngredients: z.boolean().optional().default(false),
})

export type MakeMeAMealInput = z.infer<typeof MakeMeAMealSchema>

export const SubstituteSchema = z.object({
  mealId: z.string().min(1),
  ingredientName: z.string().trim().min(1).max(60),
})

export type SubstituteInput = z.infer<typeof SubstituteSchema>
