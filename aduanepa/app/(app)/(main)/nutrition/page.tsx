import type { Metadata } from "next"

import { auth } from "@/lib/auth"
import { calculateDailyTargets } from "@/lib/nutrition"
import { startOfDay } from "@/lib/meal-utils"
import {
  getMacroBreakdown,
  getNutritionTrend,
  getTopFoods,
} from "@/lib/services/nutrition"
import { getUserProfile } from "@/lib/services/users"
import { PageHeader } from "@/components/shared/page-header"
import { CalorieTrendChart } from "@/components/nutrition/calorie-trend-chart"
import { GoalProgressBar } from "@/components/nutrition/goal-progress-bar"
import { MacroDonut } from "@/components/nutrition/macro-donut"
import { TopFoodsChart } from "@/components/nutrition/top-foods-chart"

export const metadata: Metadata = { title: "Nutrition · AduanePa" }

function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section
      className={`rounded-xl border border-border-light bg-bg-card p-5 shadow-card ${className ?? ""}`}
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-text-muted">{description}</p>
        ) : null}
      </header>
      {children}
    </section>
  )
}

export default async function NutritionPage() {
  const session = await auth()
  const userId = session!.user!.id

  const today = startOfDay(new Date())
  const last30 = startOfDay(new Date())
  last30.setDate(last30.getDate() - 29)

  const [profile, trend, breakdown, topFoods] = await Promise.all([
    getUserProfile(userId),
    getNutritionTrend(userId, 30),
    getMacroBreakdown(userId, last30, today),
    getTopFoods(userId, 10),
  ])

  const targets = profile ? calculateDailyTargets(profile) : null

  return (
    <>
      <PageHeader
        title="Nutrition"
        subtitle="Your macro breakdown and intake trends over the last 30 days."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Panel
          title="Calorie trend"
          description="Daily calories from your meal plans."
          className="lg:col-span-2"
        >
          <CalorieTrendChart data={trend} targetCalories={targets?.calories ?? null} />
        </Panel>

        <Panel
          title="Average macro split"
          description={
            breakdown.daysWithData > 0
              ? `Averaged across ${breakdown.daysWithData} day${breakdown.daysWithData === 1 ? "" : "s"} with a plan.`
              : "Macro distribution will appear once you plan meals."
          }
        >
          <MacroDonut
            proteinG={breakdown.proteinG}
            carbsG={breakdown.carbsG}
            fatG={breakdown.fatG}
          />
        </Panel>

        <Panel
          title="Goal progress"
          description="Average daily intake vs. your targets."
        >
          <GoalProgressBar average={breakdown} targets={targets} />
        </Panel>

        <Panel
          title="Most-eaten foods"
          description="Ingredients that show up most across your meals."
          className="lg:col-span-2"
        >
          <TopFoodsChart foods={topFoods} />
        </Panel>
      </div>
    </>
  )
}
