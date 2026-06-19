import { prisma } from "@/lib/db"
import { startOfDay } from "@/lib/meal-utils"

export type LatestReadings = {
  weight: number | null
  bloodSugar: number | null
  bpSystolic: number | null
  bpDiastolic: number | null
  recordedAt: Date | null
  trends: {
    weight: "up" | "down" | "stable" | null
    bloodSugar: "up" | "down" | "stable" | null
    bpSystolic: "up" | "down" | "stable" | null
  }
}

function trend(current: number | null, previous: number | null): "up" | "down" | "stable" | null {
  if (current == null || previous == null) return null
  const delta = current - previous
  if (Math.abs(delta) < 0.05) return "stable"
  return delta > 0 ? "up" : "down"
}

export async function getLatestReadings(userId: string): Promise<LatestReadings> {
  const logs = await prisma.healthLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 60,
  })

  const empty: LatestReadings = {
    weight: null,
    bloodSugar: null,
    bpSystolic: null,
    bpDiastolic: null,
    recordedAt: null,
    trends: { weight: null, bloodSugar: null, bpSystolic: null },
  }

  if (logs.length === 0) return empty

  let weight: number | null = null
  let bloodSugar: number | null = null
  let bpSystolic: number | null = null
  let bpDiastolic: number | null = null
  let recordedAt: Date | null = null

  for (const log of logs) {
    if (recordedAt == null) recordedAt = log.date
    if (weight == null && log.weight != null) weight = log.weight
    if (bloodSugar == null && log.bloodSugar != null) bloodSugar = log.bloodSugar
    if (bpSystolic == null && log.bpSystolic != null) bpSystolic = log.bpSystolic
    if (bpDiastolic == null && log.bpDiastolic != null) bpDiastolic = log.bpDiastolic
  }

  const weekAgo = startOfDay(new Date())
  weekAgo.setDate(weekAgo.getDate() - 7)

  const weekAgoLog = logs.find((log) => log.date <= weekAgo)

  return {
    weight,
    bloodSugar,
    bpSystolic,
    bpDiastolic,
    recordedAt,
    trends: {
      weight: trend(weight, weekAgoLog?.weight ?? null),
      bloodSugar: trend(bloodSugar, weekAgoLog?.bloodSugar ?? null),
      bpSystolic: trend(bpSystolic, weekAgoLog?.bpSystolic ?? null),
    },
  }
}
