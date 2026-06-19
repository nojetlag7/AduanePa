import type { Tester } from "./harness"
import { fileExists, getTestUser } from "./util"

export const meta = { phase: 7, title: "Meal UI & Dashboard", implemented: true }

export async function run(t: Tester) {
  t.section("Dashboard components")
  for (const f of [
    "components/dashboard/todays-meals.tsx",
    "components/dashboard/health-snapshot.tsx",
    "components/dashboard/nutrition-ring.tsx",
    "components/dashboard/quick-actions.tsx",
    "components/dashboard/generate-plan-button.tsx",
  ]) {
    t.check(f.split("/").pop()!, fileExists(f))
  }

  t.section("Pages")
  t.check("dashboard page", fileExists("app/(app)/(main)/dashboard/page.tsx"))
  t.check("meals list page", fileExists("app/(app)/(main)/meals/page.tsx"))
  t.check("meal detail page", fileExists("app/(app)/(main)/meals/[id]/page.tsx"))
  t.check("dashboard loading skeleton", fileExists("app/(app)/(main)/dashboard/loading.tsx"))
  t.check("meals loading skeleton", fileExists("app/(app)/(main)/meals/loading.tsx"))

  t.section("Meal components")
  t.check("meal-card", fileExists("components/meals/meal-card.tsx"))
  t.check("save-meal-button", fileExists("components/meals/save-meal-button.tsx"))

  t.section("Dashboard services return correct shapes")
  const { getDailyNutrition } = await import("@/lib/services/nutrition")
  const { getLatestReadings } = await import("@/lib/services/health-logs")
  const user = await getTestUser()

  if (!user) {
    t.check("services exercised against test user", false, {
      weight: 2,
      detail: "no test user",
    })
    return
  }

  const today = new Date()
  const nutrition = await getDailyNutrition(user.id, today).catch(() => undefined)
  // null is valid (no plan today); undefined means it threw.
  t.check("getDailyNutrition returns without error", nutrition !== undefined, {
    weight: 2,
    detail: nutrition === null ? "null (no plan today) — OK" : "returned totals",
  })

  const readings = await getLatestReadings(user.id).catch(() => null)
  t.check(
    "getLatestReadings returns a well-formed object",
    !!readings && "trends" in readings && "weight" in readings,
    { weight: 2 }
  )
}
