import type { Metadata } from "next"
import Link from "next/link"
import { HeartPulse, Plus } from "lucide-react"

import { auth } from "@/lib/auth"
import { startOfDay } from "@/lib/meal-utils"
import {
  getHealthTrend,
  getLatestReadings,
  getMealAdherence,
} from "@/lib/services/health-logs"
import { getMealPlanByDate } from "@/lib/services/meals"
import { getUserProfile } from "@/lib/services/users"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { AdherenceTracker } from "@/components/health/adherence-tracker"
import { ReadingBadge } from "@/components/health/reading-badge"
import { TrendChart } from "@/components/health/trend-chart"

export const metadata: Metadata = { title: "Health · AduanePa" }

export default async function HealthPage() {
  const session = await auth()
  const userId = session!.user!.id

  const today = startOfDay(new Date())
  const [profile, trend, latest, plan, adherence] = await Promise.all([
    getUserProfile(userId),
    getHealthTrend(userId, 30),
    getLatestReadings(userId),
    getMealPlanByDate(userId, today),
    getMealAdherence(userId, today),
  ])

  const conditions = profile?.healthConditions ?? []
  const hasData = trend.length > 0
  const planMeals = plan?.meals ?? []
  const adherenceStatuses = Object.fromEntries(
    adherence.map((log) => [log.mealId, log.status])
  )

  if (!hasData) {
    return (
      <>
        <PageHeader title="Health" subtitle="Track your weight, blood pressure and blood sugar." />
        <EmptyState
          icon={HeartPulse}
          title="No health readings yet"
          description="Log your daily readings to start seeing trends over the last 30 days."
          action={
            <Button asChild>
              <Link href="/health/log">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Log today&apos;s data
              </Link>
            </Button>
          }
        />
      </>
    )
  }

  const tiles = [
    {
      label: "Weight",
      value: latest.weight,
      display: latest.weight != null ? `${latest.weight} kg` : "—",
      metric: "weight" as const,
    },
    {
      label: "Blood pressure",
      value: latest.bpSystolic,
      display:
        latest.bpSystolic != null
          ? `${latest.bpSystolic}/${latest.bpDiastolic ?? "—"}`
          : "—",
      metric: "bpSystolic" as const,
    },
    {
      label: "Blood sugar",
      value: latest.bloodSugar,
      display: latest.bloodSugar != null ? `${latest.bloodSugar} mmol/L` : "—",
      metric: "bloodSugar" as const,
    },
  ]

  return (
    <>
      <PageHeader
        title="Health"
        subtitle="Your readings over the last 30 days."
        action={
          <Button asChild>
            <Link href="/health/log">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Log today&apos;s data
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div
              key={tile.label}
              className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {tile.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-text-primary">{tile.display}</p>
              {tile.value != null && (
                <ReadingBadge
                  metric={tile.metric}
                  value={tile.value}
                  conditions={conditions}
                  className="mt-2"
                />
              )}
            </div>
          ))}
        </div>

        <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card">
          <h2 className="mb-4 text-base font-semibold text-text-primary">Trends</h2>
          <TrendChart data={trend} />
        </section>

        {planMeals.length > 0 && (
          <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card">
            <h2 className="mb-1 text-base font-semibold text-text-primary">
              Today&apos;s meal adherence
            </h2>
            <p className="mb-4 text-sm text-text-secondary">
              Mark each meal as done or skipped to sharpen your recommendations.
            </p>
            <AdherenceTracker
              meals={planMeals.map((m) => ({ id: m.id, name: m.name, type: m.type }))}
              initialStatuses={adherenceStatuses}
            />
          </section>
        )}
      </div>
    </>
  )
}
