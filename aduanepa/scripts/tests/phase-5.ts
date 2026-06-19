import { DietaryGoal, HealthCondition, LanguagePreference, MeasurementSystem, ThemePreference } from "@prisma/client"
import { buildDietaryConstraints } from "@/lib/dietary-rules"
import { calculateDailyTargets, calculateMealNutrition } from "@/lib/nutrition"
import type { UserProfile } from "@/types"
import type { Tester } from "./harness"

export const meta = { phase: 5, title: "Dietary Rules & Nutritional Engine", implemented: true }

const sampleUser: UserProfile = {
  id: "verify",
  name: "Test User",
  email: "test@example.com",
  dateOfBirth: new Date("1998-06-15"),
  weight: 70,
  height: 175,
  healthConditions: [HealthCondition.NONE],
  dietaryGoal: DietaryGoal.WEIGHT_LOSS,
  language: LanguagePreference.ENGLISH,
  theme: ThemePreference.SYSTEM,
  measurementSystem: MeasurementSystem.METRIC,
}

export async function run(t: Tester) {
  t.section("Dietary constraints")
  const hyp = buildDietaryConstraints([HealthCondition.HYPERTENSION], DietaryGoal.WEIGHT_LOSS)
  t.check("HYPERTENSION + WEIGHT_LOSS yields >= 4 rules", hyp.length >= 4, {
    weight: 2,
    critical: true,
    detail: `${hyp.length} rules`,
  })

  const combined = buildDietaryConstraints(
    [HealthCondition.HYPERTENSION, HealthCondition.DIABETES],
    DietaryGoal.HEART_HEALTH
  )
  const deduped = new Set(combined.map((r) => r.toLowerCase())).size === combined.length
  t.check("combined constraints are deduplicated", deduped)

  t.section("Daily targets (Mifflin-St Jeor)")
  const targets = calculateDailyTargets(sampleUser)
  t.check("returns targets for a complete profile", targets != null, { critical: true })
  t.check(
    "weight-loss calories are sensible (1200–3500)",
    !!targets && targets.calories >= 1200 && targets.calories < 3500,
    { weight: 2, detail: targets ? `${targets.calories} kcal` : "no targets" }
  )
  t.check("protein target is positive", !!targets && targets.proteinG > 0)

  const muscle = calculateDailyTargets({ ...sampleUser, dietaryGoal: DietaryGoal.MUSCLE_GAIN })
  t.check(
    "muscle-gain protein floor (>= 1.8 g/kg)",
    !!muscle && muscle.proteinG >= sampleUser.weight! * 1.8,
    { detail: muscle ? `${muscle.proteinG} g` : "no targets" }
  )

  t.section("Meal nutrition from FoodItem (DB)")
  const rice = await calculateMealNutrition([{ name: "White rice (cooked)", amount: 200, unit: "g" }]).catch(
    () => null
  )
  t.check("200g white rice resolves to 260 kcal", rice?.calories === 260, {
    weight: 2,
    critical: true,
    detail: rice ? `${rice.calories} kcal` : "unresolved / DB unreachable",
  })

  const alias = await calculateMealNutrition([{ name: "rice", amount: 100, unit: "g" }]).catch(() => null)
  t.check("alias 'rice' → 130 kcal/100g", alias?.calories === 130, {
    detail: alias ? `${alias.calories} kcal` : "unresolved",
  })

  const unknown = await calculateMealNutrition([
    { name: "Mystery ingredient XYZ", amount: 100, unit: "g" },
  ]).catch(() => null)
  t.check("unknown ingredient returns null (no crash)", unknown === null, { weight: 2 })

  const kenkey = await calculateMealNutrition([{ name: "kenkey", amount: 200, unit: "g" }]).catch(
    () => null
  )
  t.check("kenkey 200g → 228 kcal", kenkey?.calories === 228, {
    detail: kenkey ? `${kenkey.calories} kcal` : "unresolved",
  })
}
