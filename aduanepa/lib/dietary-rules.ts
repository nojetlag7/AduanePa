import { DietaryGoal, HealthCondition } from "@prisma/client"

const CONDITION_RULES: Record<
  Exclude<HealthCondition, "NONE">,
  readonly string[]
> = {
  [HealthCondition.HYPERTENSION]: [
    "Limit sodium to under 1,500 mg per day. Avoid processed foods, canned goods, stock cubes, and high-salt condiments.",
    "Prioritise potassium-rich foods: bananas, avocado, kontomire, beans, and grilled fish.",
    "Limit smoked, salted, and heavily seasoned meats; flavour with herbs, garlic, ginger, and onion instead of extra salt.",
  ],
  [HealthCondition.DIABETES]: [
    "Favour low-glycaemic index carbohydrates: yam, plantain, beans, and whole grains over white bread and sugary drinks.",
    "Limit simple sugars, refined carbs, and sweetened beverages; avoid large portions of white rice alone.",
    "Include fibre-rich vegetables and legumes at every main meal to slow glucose absorption.",
  ],
  [HealthCondition.OBESITY]: [
    "Prioritise high-satiety, nutrient-dense meals with lean protein and vegetables to support sustainable calorie control.",
    "Limit refined sugars, fried snacks, and calorie-dense extras such as sugary drinks and large portions of oil.",
    "Favour grilled, boiled, or stewed preparations over deep-fried options where possible.",
  ],
}

const GOAL_RULES: Record<DietaryGoal, readonly string[]> = {
  [DietaryGoal.WEIGHT_LOSS]: [
    "Target a daily calorie deficit of about 500 kcal below maintenance while keeping protein adequate for satiety.",
    "Prioritise lean protein at each meal: fish, chicken, eggs, beans, and groundnuts.",
    "Fill half the plate with vegetables and keep cooking oils measured rather than free-poured.",
  ],
  [DietaryGoal.MUSCLE_GAIN]: [
    "Target a modest daily calorie surplus with protein around 1.6–2.2 g per kg body weight.",
    "Include a quality protein source at breakfast, lunch, dinner, and at least one snack.",
    "Pair protein with complex carbohydrates after activity-friendly meals to support recovery.",
  ],
  [DietaryGoal.MAINTENANCE]: [
    "Maintain balanced meals with steady portions of protein, complex carbohydrates, and healthy fats.",
    "Keep regular meal timing with breakfast, lunch, dinner, and one planned snack where helpful.",
  ],
  [DietaryGoal.HEART_HEALTH]: [
    "Limit saturated fat: reduce excessive palm oil, fatty cuts, and deep-fried foods.",
    "Include omega-3 friendly options such as grilled tilapia and mackerel, plus fibre from beans and vegetables.",
    "Prioritise high-fibre staples: oats, beans, kontomire, garden egg, and whole grains.",
  ],
  [DietaryGoal.BLOOD_SUGAR_CONTROL]: [
    "Use low-GI carbohydrates only: yam, plantain, beans, and modest portions of rice paired with protein and vegetables.",
    "Avoid simple sugars, pastries, and sweetened drinks; do not skip main meals.",
    "Keep consistent meal timing across breakfast, lunch, and dinner to stabilise blood sugar.",
  ],
}

/** Active health conditions only — excludes `NONE`. */
function activeConditions(
  conditions: HealthCondition[]
): Exclude<HealthCondition, "NONE">[] {
  return conditions.filter((c): c is Exclude<HealthCondition, "NONE"> => c !== HealthCondition.NONE)
}

/**
 * Build deduplicated dietary constraint strings for AI prompts.
 * Never let the model infer medical rules — always inject output from this function.
 */
export function buildDietaryConstraints(
  conditions: HealthCondition[],
  goal: DietaryGoal
): string[] {
  const seen = new Set<string>()
  const result: string[] = []

  function add(rules: readonly string[]) {
    for (const rule of rules) {
      const key = rule.trim().toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      result.push(rule)
    }
  }

  for (const condition of activeConditions(conditions)) {
    add(CONDITION_RULES[condition])
  }

  add(GOAL_RULES[goal])

  return result
}
