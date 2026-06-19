import { z } from "zod"

export const GenerateMealPlanSchema = z.object({
  regenerate: z.boolean().optional().default(false),
})

export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanSchema>

export const SaveMealSchema = z.object({
  mealId: z.string().min(1),
})
