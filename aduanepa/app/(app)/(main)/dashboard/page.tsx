import { getTranslations } from "next-intl/server"
import { auth } from "@/lib/auth"
import { calculateDailyTargets } from "@/lib/nutrition"
import { startOfDay } from "@/lib/meal-utils"
import {
  getHealthTrend,
  getLatestReadings,
  getMealAdherence,
} from "@/lib/services/health-logs"
import { getMealPlanByDate, getSavedSourceMealIds } from "@/lib/services/meals"
import { getDailyNutrition } from "@/lib/services/nutrition"
import {
  MIN_DAYS_FOR_RECOMMENDATIONS,
  getLatestRecommendation,
} from "@/lib/services/recommendations"
import { getUserProfile } from "@/lib/services/users"
import { AdherenceTracker } from "@/components/health/adherence-tracker"
import { HealthSnapshot } from "@/components/dashboard/health-snapshot"
import { NutritionRing } from "@/components/dashboard/nutrition-ring"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { RecommendationsPanel } from "@/components/dashboard/recommendations-panel"
import { TodaysMeals } from "@/components/dashboard/todays-meals"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard · AduanePa",
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id
  const today = startOfDay(new Date())
  const t = await getTranslations("dashboard")

  const [profile, plan, consumed, readings, savedIds, adherence, trend, latestReco] =
    await Promise.all([
      getUserProfile(userId),
      getMealPlanByDate(userId, today),
      getDailyNutrition(userId, today),
      getLatestReadings(userId),
      getSavedSourceMealIds(userId),
      getMealAdherence(userId, today),
      getHealthTrend(userId, 7),
      getLatestRecommendation(userId),
    ])

  const targets = profile ? calculateDailyTargets(profile) : null
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"
  const planMeals = plan?.meals ?? []
  const hasPlan = planMeals.length > 0

  const adherenceStatuses = Object.fromEntries(
    adherence.map((log) => [log.mealId, log.status])
  )
  const todayLabel = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <>
      <section className="relative mb-6 overflow-hidden rounded-2xl border border-border-light bg-bg-card p-6 shadow-card sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/12 via-bg-card to-bg-card dark:from-primary/15"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-16 -right-12 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            {todayLabel}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-text-primary sm:text-3xl">
            {t("welcome", { name: firstName })}
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-text-secondary">
            {t("welcomeSubtitle")}
          </p>
        </div>
      </section>

      <div className="space-y-6">
        <TodaysMeals meals={planMeals} hasPlan={hasPlan} savedMealIds={savedIds} />

        <div className="grid gap-6 lg:grid-cols-2">
          <NutritionRing consumed={consumed} targets={targets} />
          <HealthSnapshot readings={readings} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {hasPlan && (
            <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card">
              <h2 className="mb-4 font-display text-base font-semibold text-text-primary">
                {t("adherence")}
              </h2>
              <AdherenceTracker
                meals={planMeals.map((m) => ({ id: m.id, name: m.name, type: m.type }))}
                initialStatuses={adherenceStatuses}
                compact
              />
            </section>
          )}
          <RecommendationsPanel
            initialItems={latestReco?.items ?? []}
            daysLogged={trend.length}
            minDays={MIN_DAYS_FOR_RECOMMENDATIONS}
          />
        </div>

        <QuickActions />
      </div>
    </>
  )
}
