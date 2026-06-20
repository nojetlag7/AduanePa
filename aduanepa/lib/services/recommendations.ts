import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/db"
import { getAdherenceRate, getHealthTrend } from "@/lib/services/health-logs"
import { getUserProfile } from "@/lib/services/users"
import { RecommendationResultSchema, type RecommendationItem } from "@/types"

/** Below this many days of health logs, recommendations are not generated. */
export const MIN_DAYS_FOR_RECOMMENDATIONS = 3

type Direction = "up" | "down" | "stable"

interface MetricSummary {
  avg: number
  direction: Direction
}

export interface RecommendationContext {
  profile: {
    healthConditions: string[]
    dietaryGoal: string
    ageYears: number | null
    weightKg: number | null
  }
  health: {
    daysLogged: number
    weight: MetricSummary | null
    bpSystolic: MetricSummary | null
    bloodSugar: MetricSummary | null
  }
  adherence: {
    overallCompletionRate: number
    byMealType: Partial<Record<string, number>>
    daysTracked: number
  }
}

function round(value: number, dp = 1): number {
  const f = 10 ** dp
  return Math.round(value * f) / f
}

/** Average + trend direction (oldest→newest) of a metric series, or null. */
function summarize(values: (number | null)[]): MetricSummary | null {
  const nums = values.filter((v): v is number => v != null)
  if (nums.length === 0) return null

  const avg = nums.reduce((a, b) => a + b, 0) / nums.length
  const delta = nums[nums.length - 1] - nums[0]
  const direction: Direction =
    Math.abs(delta) < 0.1 ? "stable" : delta > 0 ? "up" : "down"

  return { avg: round(avg), direction }
}

function ageFromDob(dob: Date | null): number | null {
  if (!dob) return null
  const diff = Date.now() - dob.getTime()
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000))
}

/**
 * Compact, AI-ready summary of the last 7 days of a user's data. Returns only
 * derived aggregates (averages, directions, rates) — never raw Prisma rows —
 * so the prompt stays small and contains nothing the model shouldn't reason on.
 */
export async function buildRecommendationContext(
  userId: string
): Promise<RecommendationContext> {
  const [profile, trend, adherence] = await Promise.all([
    getUserProfile(userId),
    getHealthTrend(userId, 7),
    getAdherenceRate(userId, 7),
  ])

  return {
    profile: {
      healthConditions: profile?.healthConditions ?? [],
      dietaryGoal: profile?.dietaryGoal ?? "MAINTENANCE",
      ageYears: ageFromDob(profile?.dateOfBirth ?? null),
      weightKg: profile?.weight ?? null,
    },
    health: {
      daysLogged: trend.length,
      weight: summarize(trend.map((p) => p.weight)),
      bpSystolic: summarize(trend.map((p) => p.bpSystolic)),
      bloodSugar: summarize(trend.map((p) => p.bloodSugar)),
    },
    adherence: {
      overallCompletionRate: round(adherence.overall, 2),
      byMealType: adherence.byMealType,
      daysTracked: adherence.daysTracked,
    },
  }
}

export async function getLatestRecommendation(
  userId: string
): Promise<{ items: RecommendationItem[]; generatedAt: Date } | null> {
  const row = await prisma.recommendation.findFirst({
    where: { userId },
    orderBy: { generatedAt: "desc" },
  })
  if (!row) return null

  const parsed = RecommendationResultSchema.safeParse({ recommendations: row.items })
  if (!parsed.success) return null

  return { items: parsed.data.recommendations, generatedAt: row.generatedAt }
}

export async function saveRecommendation(
  userId: string,
  items: RecommendationItem[]
): Promise<void> {
  await prisma.recommendation.create({
    data: { userId, items: items as unknown as Prisma.InputJsonValue },
  })
}
