import { DietaryGoal, HealthCondition, LanguagePreference, MeasurementSystem, ThemePreference } from "@prisma/client"
import { buildDietaryConstraints } from "@/lib/dietary-rules"
import { calculateDailyTargets } from "@/lib/nutrition"
import {
  buildMakeMeAMealSystemPrompt,
  buildMakeMeAMealUserPrompt,
} from "@/lib/prompts/make-me-a-meal"
import {
  MakeMeAMealSchema,
  SaveMealSchema,
  SubstituteSchema,
} from "@/lib/validations/meals"
import { MakeMeAMealResultSchema, SubstituteResultSchema } from "@/types"
import type { UserProfile } from "@/types"
import type { Tester } from "./harness"
import { fileContains, fileExists } from "./util"
import { MOCK_MMAM_IMPOSSIBLE, MOCK_MMAM_POSSIBLE, MOCK_SUBSTITUTE } from "./fixtures"

export const meta = { phase: 8, title: "Make Me a Meal", implemented: true }

const hypUser: UserProfile = {
  id: "verify",
  name: "Kofi",
  email: "kofi@example.com",
  dateOfBirth: new Date("1988-05-05"),
  weight: 90,
  height: 175,
  healthConditions: [HealthCondition.HYPERTENSION],
  dietaryGoal: DietaryGoal.HEART_HEALTH,
  language: LanguagePreference.ENGLISH,
  theme: ThemePreference.SYSTEM,
  measurementSystem: MeasurementSystem.METRIC,
  notificationsEnabled: true,
}

export async function run(t: Tester) {
  t.section("Files")
  t.check("make-me-a-meal route", fileExists("app/api/meals/make-me-a-meal/route.ts"))
  t.check("substitute route", fileExists("app/api/meals/substitute/route.ts"))
  t.check("make-me-a-meal page", fileExists("app/(app)/(main)/make-me-a-meal/page.tsx"))
  t.check("ingredient-input", fileExists("components/make-me-a-meal/ingredient-input.tsx"))
  t.check("generated-meal", fileExists("components/make-me-a-meal/generated-meal.tsx"))
  t.check("no-meal-state", fileExists("components/make-me-a-meal/no-meal-state.tsx"))
  t.check("substitute dialog", fileExists("components/meals/substitute-ingredient.tsx"))
  t.check(
    "substitute dialog wired into meal detail",
    fileContains("app/(app)/(main)/meals/[id]/page.tsx", "SubstituteIngredient")
  )

  t.section("Input validation")
  t.check("rejects empty ingredient list", !MakeMeAMealSchema.safeParse({ ingredients: [] }).success, {
    weight: 2,
  })
  t.check(
    "accepts 1 ingredient with defaults",
    (() => {
      const r = MakeMeAMealSchema.safeParse({ ingredients: ["tilapia"] })
      return r.success && r.data.strictIngredients === false
    })(),
    { weight: 2 }
  )
  t.check(
    "rejects more than 30 ingredients",
    !MakeMeAMealSchema.safeParse({ ingredients: Array(31).fill("x") }).success
  )
  t.check(
    "substitute schema requires mealId + ingredientName",
    SubstituteSchema.safeParse({ mealId: "abc", ingredientName: "salt" }).success &&
      !SubstituteSchema.safeParse({ mealId: "abc" }).success
  )

  t.section("Save schema (union: DB meal vs ad-hoc)")
  t.check("accepts { mealId }", SaveMealSchema.safeParse({ mealId: "m1" }).success)
  t.check("accepts { meal }", SaveMealSchema.safeParse({ meal: MOCK_MMAM_POSSIBLE.meal }).success, {
    weight: 2,
  })
  t.check("rejects empty body", !SaveMealSchema.safeParse({}).success)

  t.section("Result parsing (mocked AI)")
  const possible = MakeMeAMealResultSchema.safeParse(MOCK_MMAM_POSSIBLE)
  t.check("possible:true + meal parses", possible.success, { weight: 2, critical: true })
  const impossible = MakeMeAMealResultSchema.safeParse(MOCK_MMAM_IMPOSSIBLE)
  t.check("possible:false + suggestion parses", impossible.success, { weight: 2, critical: true })
  t.check(
    "mixed/invalid shape is rejected",
    !MakeMeAMealResultSchema.safeParse({ possible: true, suggestion: "x" }).success
  )
  t.check("substitute result parses", SubstituteResultSchema.safeParse(MOCK_SUBSTITUTE).success)

  t.section("Prompt construction")
  const targets = calculateDailyTargets(hypUser)!
  const constraints = buildDietaryConstraints(hypUser.healthConditions, hypUser.dietaryGoal)
  const sys = buildMakeMeAMealSystemPrompt(hypUser, targets, constraints)
  t.check("system prompt embeds dietary constraints", constraints.every((c) => sys.includes(c)), {
    weight: 2,
    critical: true,
  })
  t.check("system prompt documents both possible/impossible shapes", /possible/.test(sys))

  const strictPrompt = buildMakeMeAMealUserPrompt({
    ingredients: ["rice", "egg"],
    strictIngredients: true,
  })
  t.check("strict mode forbids salt/oil/water assumptions", /STRICT/i.test(strictPrompt), {
    weight: 2,
  })
  const lenientPrompt = buildMakeMeAMealUserPrompt({
    ingredients: ["rice", "egg"],
    strictIngredients: false,
  })
  t.check("non-strict mode allows basics", /salt|oil|water/i.test(lenientPrompt))
}
