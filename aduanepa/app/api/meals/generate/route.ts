import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { buildDietaryConstraints } from "@/lib/dietary-rules"
import { extractJsonFromModelText, generateGeminiText } from "@/lib/gemini"
import { calculateDailyTargets } from "@/lib/nutrition"
import {
  buildMealPlanSystemPrompt,
  buildMealPlanUserPrompt,
  logConstraintsInDev,
} from "@/lib/prompts/meal-plan"
import { getUserProfile } from "@/lib/services/users"
import { saveMealPlan } from "@/lib/services/meals"
import { MealPlanResponseSchema } from "@/types"

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const profile = await getUserProfile(session.user.id)
  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const targets = calculateDailyTargets(profile)
  if (!targets) {
    return NextResponse.json(
      { error: "Complete your profile before generating a meal plan." },
      { status: 400 }
    )
  }

  const constraints = buildDietaryConstraints(profile.healthConditions, profile.dietaryGoal)
  logConstraintsInDev(constraints, profile)

  const planDate = todayDateString()
  const systemInstruction = buildMealPlanSystemPrompt(profile, targets, constraints, planDate)
  const userPrompt = buildMealPlanUserPrompt(planDate)

  let rawText: string
  try {
    rawText = await generateGeminiText(systemInstruction, userPrompt)
  } catch (error) {
    console.error("[meal-generate] Gemini request failed:", error)
    return NextResponse.json({ error: "Failed to generate meal plan" }, { status: 502 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonFromModelText(rawText))
  } catch {
    console.error("[meal-generate] JSON parse failed:", rawText.slice(0, 500))
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  const validated = MealPlanResponseSchema.safeParse(parsed)
  if (!validated.success) {
    console.error("[meal-generate] Zod validation failed:", validated.error.flatten())
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  try {
    const plan = await saveMealPlan(session.user.id, new Date(planDate), validated.data.meals)
    return NextResponse.json({
      planId: plan.id,
      meals: plan.meals,
    })
  } catch (error) {
    console.error("[meal-generate] save failed:", error)
    return NextResponse.json({ error: "Failed to save meal plan" }, { status: 500 })
  }
}
