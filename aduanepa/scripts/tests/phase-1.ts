import type { Tester } from "./harness"
import { fileContains } from "./util"

export const meta = { phase: 1, title: "Database Schema & Migrations", implemented: true }

export async function run(t: Tester) {
  t.section("Prisma schema")
  const models = ["User", "MealPlan", "Meal", "SavedMeal", "HealthLog", "MealAdherenceLog", "FoodItem", "EmailOtp", "Recommendation"]
  for (const model of models) {
    t.check(`model ${model}`, fileContains("prisma/schema.prisma", new RegExp(`model\\s+${model}\\b`)))
  }

  t.section("Enums")
  for (const e of ["HealthCondition", "DietaryGoal", "MealType", "LogStatus", "MealPlanSource"]) {
    t.check(`enum ${e}`, fileContains("prisma/schema.prisma", new RegExp(`enum\\s+${e}\\b`)))
  }

  t.section("Constraints")
  t.check(
    "HealthLog unique [userId, date]",
    fileContains("prisma/schema.prisma", /@@unique\(\[userId, date\]\)/)
  )
  t.check(
    "FoodItem unique name",
    fileContains("prisma/schema.prisma", /@@unique\(\[name\]\)/) ||
      fileContains("prisma/schema.prisma", /name\s+String\s+@unique/)
  )

  t.section("Zod schemas (types/index.ts)")
  t.check("IngredientSchema exported", fileContains("types/index.ts", "IngredientSchema"))
  t.check("InstructionsSchema exported", fileContains("types/index.ts", "InstructionsSchema"))

  t.section("FoodItem seed (DB)")
  const { prisma } = await import("@/lib/db")
  const foodCount = await prisma.foodItem.count().catch(() => -1)
  t.check("FoodItem table has >= 20 seeded rows", foodCount >= 20, {
    weight: 3,
    detail: foodCount < 0 ? "DB unreachable" : `${foodCount} rows`,
  })
}
