import { DietaryGoal, HealthCondition, LanguagePreference, MealType, MeasurementSystem, ThemePreference } from "@prisma/client"
import { buildDietaryConstraints } from "@/lib/dietary-rules"
import { calculateDailyTargets, applyDbMacrosToMeals } from "@/lib/nutrition"
import { buildMealPlanSystemPrompt } from "@/lib/prompts/meal-plan"
import { MealPlanResponseSchema } from "@/types"
import type { UserProfile } from "@/types"
import type { Tester } from "./harness"
import { fileContains, fileExists, getTestUser } from "./util"
import { MOCK_MEAL_PLAN } from "./fixtures"

export const meta = { phase: 6, title: "Meal Generation API", implemented: true }

const hypUser: UserProfile = {
  id: "verify",
  name: "Ama",
  email: "ama@example.com",
  dateOfBirth: new Date("1990-01-01"),
  weight: 80,
  height: 168,
  healthConditions: [HealthCondition.HYPERTENSION],
  dietaryGoal: DietaryGoal.HEART_HEALTH,
  language: LanguagePreference.ENGLISH,
  theme: ThemePreference.SYSTEM,
  measurementSystem: MeasurementSystem.METRIC,
}

export async function run(t: Tester) {
  t.section("Route & service files")
  t.check("generate route present", fileExists("app/api/meals/generate/route.ts"))
  t.check("meals service present", fileExists("lib/services/meals.ts"))
  t.check(
    "route guards unauthenticated (401)",
    fileContains("app/api/meals/generate/route.ts", /401/),
    { detail: "Unauthorized branch present" }
  )
  t.check(
    "route strips markdown fences from model output",
    fileContains("app/api/meals/generate/route.ts", "extractJsonFromModelText")
  )
  t.check(
    "GEMINI_API_KEY only read server-side (gemini.ts is server-only)",
    fileContains("lib/gemini.ts", "server-only"),
    { weight: 2, critical: true }
  )

  t.section("System prompt construction")
  const targets = calculateDailyTargets(hypUser)!
  const constraints = buildDietaryConstraints(hypUser.healthConditions, hypUser.dietaryGoal)
  const prompt = buildMealPlanSystemPrompt(hypUser, targets, constraints, "2026-01-01")
  t.check("prompt injects dietary constraints", constraints.every((c) => prompt.includes(c)), {
    weight: 2,
    critical: true,
    detail: `${constraints.length} constraints embedded`,
  })
  t.check("prompt requests JSON-only output", /ONLY valid JSON/i.test(prompt))
  t.check("prompt prioritises Ghanaian cuisine", /Ghanaian|West African/i.test(prompt))

  t.section("Response parsing (mocked AI)")
  const parsed = MealPlanResponseSchema.safeParse(MOCK_MEAL_PLAN)
  t.check("valid plan parses against MealPlanResponseSchema", parsed.success, {
    weight: 2,
    critical: true,
  })
  const malformed = MealPlanResponseSchema.safeParse({ meals: [{ name: "broken" }] })
  t.check("malformed plan is rejected", !malformed.success, { weight: 2 })

  t.section("DB macro override")
  const { meals, macrosFromDb } = await applyDbMacrosToMeals(MOCK_MEAL_PLAN.meals as never).catch(
    () => ({ meals: [], macrosFromDb: 0 })
  )
  t.check("applyDbMacrosToMeals returns same meal count", meals.length === MOCK_MEAL_PLAN.meals.length)
  t.check("at least one meal had macros resolved from DB", macrosFromDb >= 1, {
    weight: 2,
    detail: `${macrosFromDb}/${MOCK_MEAL_PLAN.meals.length} meals from DB`,
  })

  t.section("Plan persistence round-trip (DB, test user)")
  const user = await getTestUser()
  if (!user) {
    t.check("saveMealPlan round-trip", false, { weight: 2, detail: "no test user" })
    return
  }
  const { saveMealPlan, getMealPlanByDate } = await import("@/lib/services/meals")
  const { prisma } = await import("@/lib/db")
  // Sentinel date far in the past so we never collide with real plans.
  const sentinel = new Date("1990-01-01")
  let roundTripped = false
  try {
    await saveMealPlan(user.id, sentinel, [{ ...MOCK_MEAL_PLAN.meals[0], type: MealType.BREAKFAST }] as never)
    const fetched = await getMealPlanByDate(user.id, sentinel)
    roundTripped = !!fetched && fetched.meals.length === 1
  } finally {
    await prisma.mealPlan.deleteMany({ where: { userId: user.id, date: sentinel } }).catch(() => {})
  }
  t.check("saveMealPlan → getMealPlanByDate round-trip", roundTripped, { weight: 3, critical: true })
}
