import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { extractJsonFromModelText, generateGeminiText } from "@/lib/gemini"
import {
  buildRecommendationsSystemPrompt,
  buildRecommendationsUserPrompt,
} from "@/lib/prompts/recommendations"
import {
  MIN_DAYS_FOR_RECOMMENDATIONS,
  buildRecommendationContext,
  saveRecommendation,
} from "@/lib/services/recommendations"
import { RecommendationResultSchema } from "@/types"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const context = await buildRecommendationContext(session.user.id)

  // Not enough logged data to ground recommendations in real numbers.
  if (context.health.daysLogged < MIN_DAYS_FOR_RECOMMENDATIONS) {
    return NextResponse.json({
      ready: false,
      daysLogged: context.health.daysLogged,
      required: MIN_DAYS_FOR_RECOMMENDATIONS,
    })
  }

  const systemInstruction = buildRecommendationsSystemPrompt()
  const userPrompt = buildRecommendationsUserPrompt(context)

  let rawText: string
  try {
    rawText = await generateGeminiText(systemInstruction, userPrompt)
  } catch (error) {
    console.error("[recommendations] Gemini request failed:", error)
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 502 })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(extractJsonFromModelText(rawText))
  } catch {
    console.error("[recommendations] JSON parse failed:", rawText.slice(0, 500))
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  const validated = RecommendationResultSchema.safeParse(parsed)
  if (!validated.success) {
    console.error("[recommendations] Zod validation failed:", validated.error.flatten())
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 })
  }

  await saveRecommendation(session.user.id, validated.data.recommendations)

  return NextResponse.json({ ready: true, recommendations: validated.data.recommendations })
}
