import type { NutritionalTargets, UserProfile } from "@/types"

function ageFromDateOfBirth(dateOfBirth: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDelta = today.getMonth() - dateOfBirth.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1
  }
  return age
}

export function buildMealPlanSystemPrompt(
  profile: UserProfile,
  targets: NutritionalTargets,
  constraints: string[],
  planDate: string
): string {
  const age = profile.dateOfBirth ? ageFromDateOfBirth(profile.dateOfBirth) : null
  const constraintBlock =
    constraints.length > 0
      ? constraints.map((c, i) => `${i + 1}. ${c}`).join("\n")
      : "No specific medical constraints beyond general healthy eating."

  return `You are AduanePa, a knowledgeable Ghanaian nutritionist building personalised daily meal plans.

CULTURAL CONTEXT:
- Prioritise Ghanaian and West African dishes (waakye, banku, kontomire, red red, jollof, tilapia, etc.).
- Use ingredients commonly found in Ghanaian markets and home kitchens.
- Be practical, specific, and encouraging — no filler phrases.

USER PROFILE:
- Name: ${profile.name}
- Age: ${age ?? "unknown"} years
- Weight: ${profile.weight ?? "unknown"} kg
- Height: ${profile.height ?? "unknown"} cm
- Health conditions: ${profile.healthConditions.join(", ")}
- Dietary goal: ${profile.dietaryGoal}

DAILY NUTRITION TARGETS (approximate):
- Calories: ${targets.calories} kcal
- Protein: ${targets.proteinG} g
- Carbohydrates: ${targets.carbsG} g
- Fat: ${targets.fatG} g

HARD DIETARY CONSTRAINTS — follow without exception:
${constraintBlock}

OUTPUT RULES:
- Plan date: ${planDate}
- Generate exactly four meals: BREAKFAST, LUNCH, DINNER, and SNACK.
- Respond with ONLY valid JSON matching this shape — no markdown fences, no preamble:
{
  "meals": [
    {
      "type": "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK",
      "name": string,
      "description": string,
      "ingredients": [{ "name": string, "amount": number, "unit": "g" | "ml" | "kg" }],
      "instructions": [string],
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number,
      "prepTimeMin": number,
      "isLocalDish": boolean
    }
  ]
}
- Nutritional values are estimates — keep them realistic and sum close to the daily targets.
- Use metric units (grams/ml) for ingredients.`
}

export function buildMealPlanUserPrompt(planDate: string): string {
  return `Create a complete one-day meal plan for ${planDate} with breakfast, lunch, dinner, and one snack.`
}

export function logConstraintsInDev(constraints: string[], profile: UserProfile) {
  if (process.env.NODE_ENV !== "development") return
  console.log("[meal-generate] dietary constraints for", profile.email, ":", constraints)
}
