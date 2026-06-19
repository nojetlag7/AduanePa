import type { HealthLog } from "@prisma/client"
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

// ─── Phase 10 — daily logging + trends ──────────────────────────────────────

export interface HealthLogInput {
  weight?: number | null
  bloodSugar?: number | null
  bpSystolic?: number | null
  bpDiastolic?: number | null
  notes?: string | null
}

/** Returns today's log (date = local start of day) or null. */
export async function getTodayLog(userId: string): Promise<HealthLog | null> {
  return prisma.healthLog.findUnique({
    where: { userId_date: { userId, date: startOfDay(new Date()) } },
  })
}

/**
 * Create or update today's log. Always upsert — the `[userId, date]` unique
 * constraint means there is at most one row per user per day.
 */
export async function upsertHealthLog(
  userId: string,
  data: HealthLogInput
): Promise<HealthLog> {
  const date = startOfDay(new Date())
  const payload = {
    weight: data.weight ?? null,
    bloodSugar: data.bloodSugar ?? null,
    bpSystolic: data.bpSystolic ?? null,
    bpDiastolic: data.bpDiastolic ?? null,
    notes: data.notes?.trim() ? data.notes.trim() : null,
  }

  return prisma.healthLog.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, ...payload },
    update: payload,
  })
}

export interface HealthTrendPoint {
  date: string
  label: string
  weight: number | null
  bpSystolic: number | null
  bpDiastolic: number | null
  bloodSugar: number | null
}

/**
 * Ordered (oldest → newest) logs within the last `days`, shaped for charting.
 * Only days that actually have a log are returned.
 */
export async function getHealthTrend(
  userId: string,
  days = 30
): Promise<HealthTrendPoint[]> {
  const start = startOfDay(new Date())
  start.setDate(start.getDate() - (days - 1))

  const logs = await prisma.healthLog.findMany({
    where: { userId, date: { gte: start } },
    orderBy: { date: "asc" },
  })

  return logs.map((log) => ({
    date: log.date.toLocaleDateString("en-CA"),
    label: log.date.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    weight: log.weight,
    bpSystolic: log.bpSystolic,
    bpDiastolic: log.bpDiastolic,
    bloodSugar: log.bloodSugar,
  }))
}
