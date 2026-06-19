import type { Ingredient, UserProfile } from "@/types"

export function buildSubstituteSystemPrompt(
  profile: UserProfile,
  constraints: string[]
): string {
  const constraintBlock =
    constraints.length > 0
      ? constraints.map((c, i) => `${i + 1}. ${c}`).join("\n")
      : "No specific medical constraints beyond general healthy eating."

  return `You are AduanePa, a Ghanaian nutritionist. The user wants to replace one ingredient
in a dish with a single suitable alternative.

USER PROFILE:
- Health conditions: ${profile.healthConditions.join(", ")}
- Dietary goal: ${profile.dietaryGoal}

HARD DIETARY CONSTRAINTS — the substitute must respect these:
${constraintBlock}

RULES:
- Suggest ONE realistic alternative ingredient, ideally one available in Ghanaian markets.
- The substitute must keep the dish sensible and fit the dietary constraints.
- Keep the reason to one or two short sentences.

OUTPUT — respond with ONLY valid JSON, no markdown fences and no preamble:
{
  "substitute": string,
  "reason": string
}`
}

export function buildSubstituteUserPrompt(input: {
  mealName: string
  ingredientName: string
  ingredients: Ingredient[]
}): string {
  const ingredientList = input.ingredients.map((i) => i.name).join(", ")
  return `Dish: ${input.mealName}
Current ingredients: ${ingredientList || "unknown"}
Replace this ingredient: ${input.ingredientName}
Suggest one alternative that fits my dietary needs.`
}
