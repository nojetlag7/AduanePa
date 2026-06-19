import { HealthCondition } from "@prisma/client"
import {
  classifyBloodSugar,
  classifyReading,
  classifySystolic,
} from "@/lib/health-thresholds"
import { HealthLogSchema } from "@/lib/validations/health"
import {
  getHealthTrend,
  getTodayLog,
  upsertHealthLog,
} from "@/lib/services/health-logs"
import type { Tester } from "./harness"
import { fileExists, getTestUser } from "./util"

export const meta = { phase: 10, title: "Health Monitoring", implemented: true }

export async function run(t: Tester) {
  t.section("Files")
  t.check("health page", fileExists("app/(app)/(main)/health/page.tsx"))
  t.check("health log page", fileExists("app/(app)/(main)/health/log/page.tsx"))
  t.check("health log API route", fileExists("app/api/health/logs/route.ts"))
  t.check("health validation schema", fileExists("lib/validations/health.ts"))
  t.check("thresholds util", fileExists("lib/health-thresholds.ts"))
  t.check("reading-badge", fileExists("components/health/reading-badge.tsx"))
  t.check("trend-chart", fileExists("components/health/trend-chart.tsx"))
  t.check("health-log-form", fileExists("components/health/health-log-form.tsx"))

  t.section("Validation (HealthLogSchema)")
  t.check(
    "coerces string numbers + accepts a single reading",
    (() => {
      const r = HealthLogSchema.safeParse({ weight: "72.5" })
      return r.success && r.data.weight === 72.5
    })(),
    { weight: 2 }
  )
  t.check("rejects empty submission (no readings)", !HealthLogSchema.safeParse({ notes: "hi" }).success, {
    weight: 2,
    critical: true,
  })
  t.check("rejects out-of-range weight", !HealthLogSchema.safeParse({ weight: "5" }).success)
  t.check("rejects out-of-range blood sugar", !HealthLogSchema.safeParse({ bloodSugar: "60" }).success)
  t.check(
    "accepts a full valid log",
    HealthLogSchema.safeParse({
      weight: "70",
      bloodSugar: "5.2",
      bpSystolic: "118",
      bpDiastolic: "76",
      notes: "felt good",
    }).success
  )

  t.section("Condition-aware thresholds")
  t.check("general systolic 118 → healthy", classifySystolic(118, []) === "healthy", { weight: 2 })
  t.check("general systolic 125 → borderline", classifySystolic(125, []) === "borderline")
  t.check("general systolic 145 → high", classifySystolic(145, []) === "high")
  t.check(
    "hypertensive systolic 135 → borderline (tighter target)",
    classifySystolic(135, [HealthCondition.HYPERTENSION]) === "borderline",
    { weight: 2, critical: true }
  )
  t.check(
    "hypertensive systolic 125 → healthy (general would flag borderline)",
    classifySystolic(125, [HealthCondition.HYPERTENSION]) === "healthy" &&
      classifySystolic(125, []) === "borderline",
    { weight: 2, critical: true }
  )
  t.check("blood sugar 5.0 → healthy", classifyBloodSugar(5.0) === "healthy")
  t.check("blood sugar 6.2 → borderline", classifyBloodSugar(6.2) === "borderline")
  t.check("blood sugar 8.0 → high", classifyBloodSugar(8.0) === "high", { weight: 2 })
  t.check("weight has no clinical range (null)", classifyReading("weight", 70, []) === null)

  t.section("Service round-trip (DB, test user)")
  const user = await getTestUser()
  if (!user) {
    t.check("services exercised against test user", false, {
      weight: 2,
      detail: "no test user — run npm run test:seed-user",
    })
    return
  }

  const saved = await upsertHealthLog(user.id, {
    weight: 71.2,
    bpSystolic: 119,
    bpDiastolic: 78,
    bloodSugar: 5.1,
    notes: "phase-10 test",
  }).catch(() => null)
  t.check("upsertHealthLog creates/updates today's log", !!saved && saved.weight === 71.2, {
    weight: 2,
    critical: true,
  })

  const second = await upsertHealthLog(user.id, { weight: 71.5 }).catch(() => null)
  t.check(
    "second upsert same day does not duplicate (same id)",
    !!saved && !!second && saved.id === second.id,
    { weight: 2, critical: true }
  )

  const today = await getTodayLog(user.id).catch(() => null)
  t.check("getTodayLog returns the upserted row", !!today && today.weight === 71.5)

  const trend = await getHealthTrend(user.id, 30).catch(() => null)
  t.check(
    "getHealthTrend returns ordered, well-formed points",
    Array.isArray(trend) &&
      trend.every((p) => typeof p.date === "string" && "weight" in p && "bpSystolic" in p),
    { weight: 2 }
  )
}
