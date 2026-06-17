/**
 * Manual verification for Phase 5 exit criteria.
 * Run: npx tsx --env-file=.env scripts/verify-phase5.ts
 */
import { DietaryGoal, HealthCondition, LanguagePreference, MeasurementSystem, ThemePreference } from "@prisma/client"
import { buildDietaryConstraints } from "@/lib/dietary-rules"
import { calculateDailyTargets, calculateMealNutrition } from "@/lib/nutrition"
import type { UserProfile } from "@/types"

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAIL:", message)
    process.exit(1)
  }
  console.log("OK:", message)
}

async function main() {
  const hypertensionWeightLoss = buildDietaryConstraints(
    [HealthCondition.HYPERTENSION],
    DietaryGoal.WEIGHT_LOSS
  )
  assert(
    hypertensionWeightLoss.length >= 4,
    `buildDietaryConstraints(HYPERTENSION, WEIGHT_LOSS) → ${hypertensionWeightLoss.length} rules`
  )

  const deduped = buildDietaryConstraints(
    [HealthCondition.HYPERTENSION, HealthCondition.DIABETES],
    DietaryGoal.HEART_HEALTH
  )
  assert(
    new Set(deduped.map((r) => r.toLowerCase())).size === deduped.length,
    "combined constraints are deduplicated"
  )

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

  const targets = calculateDailyTargets(sampleUser)
  assert(targets != null, "calculateDailyTargets returns targets for complete profile")
  assert(
    targets!.calories >= 1200 && targets!.calories < 3500,
    `weight-loss calories sensible: ${targets!.calories} kcal`
  )
  assert(targets!.proteinG > 0, `protein target set: ${targets!.proteinG}g`)

  const muscleUser: UserProfile = { ...sampleUser, dietaryGoal: DietaryGoal.MUSCLE_GAIN }
  const muscleTargets = calculateDailyTargets(muscleUser)
  assert(
    muscleTargets!.proteinG >= muscleUser.weight! * 1.8,
    `muscle gain protein floor met: ${muscleTargets!.proteinG}g`
  )

  const riceMeal = await calculateMealNutrition([
    { name: "White rice (cooked)", amount: 200, unit: "g" },
  ])
  assert(riceMeal != null, "200g white rice resolves")
  assert(riceMeal!.calories === 260, `200g rice calories: ${riceMeal!.calories} (expected 260)`)

  const aliasMeal = await calculateMealNutrition([{ name: "rice", amount: 100, unit: "g" }])
  assert(aliasMeal != null, "rice alias resolves to seeded FoodItem")
  assert(aliasMeal!.calories === 130, `100g rice alias calories: ${aliasMeal!.calories}`)

  const unknown = await calculateMealNutrition([
    { name: "Mystery ingredient XYZ", amount: 100, unit: "g" },
  ])
  assert(unknown === null, "unknown ingredient returns null")

  console.log("\nPhase 5 verification passed.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
