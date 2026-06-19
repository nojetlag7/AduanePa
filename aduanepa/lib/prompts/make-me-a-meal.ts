import type { MealType } from "@prisma/client"
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

export function buildMakeMeAMealSystemPrompt(
  profile: UserProfile,
  targets: NutritionalTargets,
  constraints: string[]
): string {
  const age = profile.dateOfBirth ? ageFromDateOfBirth(profile.dateOfBirth) : null
  const constraintBlock =
    constraints.length > 0
      ? constraints.map((c, i) => `${i + 1}. ${c}`).join("\n")
      : "No specific medical constraints beyond general healthy eating."

  return `You are AduanePa, a knowledgeable Ghanaian nutritionist. The user tells you which
ingredients they already have at home, and you build ONE meal they can cook right now.

CULTURAL CONTEXT:
- Favour Ghanaian and West African cooking styles where the ingredients allow.
- Be practical and encouraging — assume a typical home kitchen.

USER PROFILE:
- Name: ${profile.name}
- Age: ${age ?? "unknown"} years
- Health conditions: ${profile.healthConditions.join(", ")}
- Dietary goal: ${profile.dietaryGoal}

APPROXIMATE TARGETS FOR A SINGLE MEAL (about one-third of the daily total):
- Calories: ${Math.round(targets.calories / 3)} kcal
- Protein: ${Math.round(targets.proteinG / 3)} g
- Carbohydrates: ${Math.round(targets.carbsG / 3)} g
- Fat: ${Math.round(targets.fatG / 3)} g

HARD DIETARY CONSTRAINTS — follow without exception:
${constraintBlock}

DECISION RULES:
- Adapt the recipe to respect the dietary constraints rather than rejecting it where possible.
- If the ingredients genuinely cannot make a sensible, safe meal that fits the constraints,
  return possible:false with a short, specific suggestion of what to add.

OUTPUT RULES — respond with ONLY valid JSON, no markdown fences and no preamble.
Return EXACTLY ONE of these two shapes:

If a meal is possible:
{
  "possible": true,
  "meal": {
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
}

If no sensible meal can be made:
{
  "possible": false,
  "suggestion": string
}

- Nutritional values are estimates — keep them realistic.
- Use metric units (grams/ml) for all ingredients.`
}

export function buildMakeMeAMealUserPrompt(input: {
  ingredients: string[]
  mealType?: MealType
  strictIngredients: boolean
}): string {
  const lines: string[] = []
  lines.push(`Ingredients I have at home: ${input.ingredients.join(", ")}.`)

  if (input.mealType) {
    lines.push(`I want this to be a ${input.mealType.toLowerCase()} meal.`)
  } else {
    lines.push("Choose the most suitable meal type for these ingredients.")
  }

  if (input.strictIngredients) {
    lines.push(
      "STRICT MODE: use ONLY the ingredients I listed. Do not assume I have salt, oil, water, or anything else."
    )
  } else {
    lines.push("You may assume I also have basics: salt, cooking oil, and water.")
  }

  return lines.join("\n")
}
