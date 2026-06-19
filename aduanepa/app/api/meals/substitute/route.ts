import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { buildDietaryConstraints } from "@/lib/dietary-rules"
import { extractJsonFromModelText, generateGeminiText } from "@/lib/gemini"
import {
  buildSubstituteSystemPrompt,
  buildSubstituteUserPrompt,
} from "@/lib/prompts/substitute"
import { getMealById } from "@/lib/services/meals"
import { getUserProfile } from "@/lib/services/users"
import { SubstituteSchema } from "@/lib/validations/meals"
import { parseMealIngredients } from "@/lib/meal-utils"
import { SubstituteResultSchema } from "@/types"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsedInput = SubstituteSchema.safeParse(body)
  if (!parsedInput.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const [profile, meal] = await Promise.all([
    getUserProfile(session.user.id),
    getMealById(session.user.id, parsedInput.data.mealId),
  ])

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }
  if (!meal) {
    return NextResponse.json({ error: "Meal not found" }, { status: 404 })
  }

  const constraints = buildDietaryConstraints(profile.healthConditions, profile.dietaryGoal)
  const systemInstruction = buildSubstituteSystemPrompt(profile, constraints)
  const userPrompt = buildSubstituteUserPrompt({
    mealName: meal.name,
    ingredientName: parsedInput.data.ingredientName,
    ingredients: parseMealIngredients(meal),
  })

  let rawText: string
  try {
    rawText = await generateGeminiText(systemInstruction, userPrompt)
  } catch (error) {
    console.error("[substitute] Gemini request failed:", error)
    return NextResponse.json({ error: "Failed to find a substitute" }, { status: 502 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonFromModelText(rawText))
  } catch {
    console.error("[substitute] JSON parse failed:", rawText.slice(0, 500))
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  const validated = SubstituteResultSchema.safeParse(parsed)
  if (!validated.success) {
    console.error("[substitute] Zod validation failed:", validated.error.flatten())
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  return NextResponse.json({
    substitute: validated.data.substitute,
    reason: validated.data.reason,
  })
}
