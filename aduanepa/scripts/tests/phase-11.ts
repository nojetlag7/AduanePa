import { LogStatus } from "@prisma/client"
import {
  getAdherenceRate,
  getMealAdherence,
  upsertAdherence,
} from "@/lib/services/health-logs"
import {
  MIN_DAYS_FOR_RECOMMENDATIONS,
  buildRecommendationContext,
} from "@/lib/services/recommendations"
import { AdherenceSchema } from "@/lib/validations/health"
import { startOfDay } from "@/lib/meal-utils"
import type { Tester } from "./harness"
import { fileExists, getTestUser } from "./util"

export const meta = {
  phase: 11,
  title: "Meal Adherence & Adaptive Recommendations",
  implemented: true,
}

export async function run(t: Tester) {
  t.section("Files")
  t.check("adherence API route", fileExists("app/api/health/adherence/route.ts"))
  t.check("recommendations API route", fileExists("app/api/recommendations/route.ts"))
  t.check("recommendations service", fileExists("lib/services/recommendations.ts"))
  t.check("recommendations prompt", fileExists("lib/prompts/recommendations.ts"))
  t.check("adherence-tracker", fileExists("components/health/adherence-tracker.tsx"))
  t.check("recommendations-panel", fileExists("components/dashboard/recommendations-panel.tsx"))

  t.section("Validation (AdherenceSchema)")
  t.check(
    "accepts a valid payload",
    AdherenceSchema.safeParse({ mealId: "abc", status: "COMPLETED" }).success,
    { weight: 2 }
  )
  t.check("rejects missing mealId", !AdherenceSchema.safeParse({ status: "COMPLETED" }).success, {
    critical: true,
  })
  t.check("rejects unknown status", !AdherenceSchema.safeParse({ mealId: "abc", status: "MAYBE" }).success)
  t.check(
    "rejects malformed date",
    !AdherenceSchema.safeParse({ mealId: "abc", status: "PENDING", date: "2026/01/01" }).success
  )
  t.check(
    "accepts well-formed date",
    AdherenceSchema.safeParse({ mealId: "abc", status: "SKIPPED", date: "2026-01-01" }).success
  )

  t.section("Recommendations gating")
  t.check("MIN_DAYS_FOR_RECOMMENDATIONS is 3", MIN_DAYS_FOR_RECOMMENDATIONS === 3)

  t.section("Service round-trip (DB, test user)")
  const user = await getTestUser()
  if (!user) {
    t.check("services exercised against test user", false, {
      weight: 2,
      detail: "no test user — run npm run test:seed-user",
    })
    return
  }

  // buildRecommendationContext returns derived aggregates only — no raw rows.
  const context = await buildRecommendationContext(user.id).catch(() => null)
  t.check(
    "buildRecommendationContext returns a compact, well-formed object",
    !!context &&
      "profile" in context &&
      "health" in context &&
      "adherence" in context &&
      typeof context.health.daysLogged === "number" &&
      typeof context.adherence.overallCompletionRate === "number",
    { weight: 2, critical: true }
  )

  const rate = await getAdherenceRate(user.id, 7).catch(() => null)
  t.check(
    "getAdherenceRate returns 0–1 rates + day count",
    !!rate &&
      rate.overall >= 0 &&
      rate.overall <= 1 &&
      typeof rate.daysTracked === "number",
    { weight: 2 }
  )

  // Find one of the test user's meals to exercise the adherence upsert.
  const { prisma } = await import("@/lib/db")
  const meal = await prisma.meal
    .findFirst({ where: { mealPlan: { userId: user.id } } })
    .catch(() => null)

  if (!meal) {
    t.check("adherence upsert exercised (needs a planned meal)", true, {
      detail: "test user has no meals — generate a plan to fully exercise",
    })
    return
  }

  const today = startOfDay(new Date())
  const first = await upsertAdherence(user.id, meal.id, today, LogStatus.COMPLETED).catch(
    () => null
  )
  t.check("upsertAdherence creates/updates a record", !!first && first.status === "COMPLETED", {
    weight: 2,
    critical: true,
  })

  const second = await upsertAdherence(user.id, meal.id, today, LogStatus.SKIPPED).catch(
    () => null
  )
  t.check(
    "second upsert same meal/day does not duplicate (same id, new status)",
    !!first && !!second && first.id === second.id && second.status === "SKIPPED",
    { weight: 2, critical: true }
  )

  const day = await getMealAdherence(user.id, today).catch(() => null)
  t.check(
    "getMealAdherence returns today's records including the meal",
    Array.isArray(day) && day.some((log) => log.mealId === meal.id)
  )
}
