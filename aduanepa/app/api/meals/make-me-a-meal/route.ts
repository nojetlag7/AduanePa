import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { buildDietaryConstraints } from "@/lib/dietary-rules"
import { extractJsonFromModelText, generateGeminiText } from "@/lib/gemini"
import { applyDbMacrosToMeals, calculateDailyTargets } from "@/lib/nutrition"
import {
  buildMakeMeAMealSystemPrompt,
  buildMakeMeAMealUserPrompt,
} from "@/lib/prompts/make-me-a-meal"
import { getUserProfile } from "@/lib/services/users"
import { MakeMeAMealSchema } from "@/lib/validations/meals"
import { MakeMeAMealResultSchema } from "@/types"

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

  const parsedInput = MakeMeAMealSchema.safeParse(body)
  if (!parsedInput.success) {
    return NextResponse.json(
      { error: "Add at least one ingredient to get started." },
      { status: 400 }
    )
  }

  const profile = await getUserProfile(session.user.id)
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const targets = calculateDailyTargets(profile)
  if (!targets) {
    return NextResponse.json(
      { error: "Complete your profile before generating a meal." },
      { status: 400 }
    )
  }

  const constraints = buildDietaryConstraints(profile.healthConditions, profile.dietaryGoal)
  const systemInstruction = buildMakeMeAMealSystemPrompt(profile, targets, constraints)
  const userPrompt = buildMakeMeAMealUserPrompt(parsedInput.data)

  let rawText: string
  try {
    rawText = await generateGeminiText(systemInstruction, userPrompt)
  } catch (error) {
    console.error("[make-me-a-meal] Gemini request failed:", error)
    return NextResponse.json({ error: "Failed to generate meal" }, { status: 502 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonFromModelText(rawText))
  } catch {
    console.error("[make-me-a-meal] JSON parse failed:", rawText.slice(0, 500))
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  const validated = MakeMeAMealResultSchema.safeParse(parsed)
  if (!validated.success) {
    console.error("[make-me-a-meal] Zod validation failed:", validated.error.flatten())
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  if (!validated.data.possible) {
    return NextResponse.json({
      possible: false,
      suggestion: validated.data.suggestion,
    })
  }

  // Override AI macros with FoodItem data when every ingredient resolves.
  const { meals, macrosFromDb } = await applyDbMacrosToMeals([validated.data.meal])

  return NextResponse.json({
    possible: true,
    meal: meals[0],
    macrosFromDb: macrosFromDb > 0,
  })
}
