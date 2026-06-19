import { auth } from "@/lib/auth"
import { calculateDailyTargets } from "@/lib/nutrition"
import { startOfDay } from "@/lib/meal-utils"
import { getLatestReadings } from "@/lib/services/health-logs"
import { getMealPlanByDate, getSavedSourceMealIds } from "@/lib/services/meals"
import { getDailyNutrition } from "@/lib/services/nutrition"
import { getUserProfile } from "@/lib/services/users"
import { PageHeader } from "@/components/shared/page-header"
import { HealthSnapshot } from "@/components/dashboard/health-snapshot"
import { NutritionRing } from "@/components/dashboard/nutrition-ring"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TodaysMeals } from "@/components/dashboard/todays-meals"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard · AduanePa",
}

export default async function DashboardPage() {
  const session = await auth()
  const userId = session!.user!.id
  const today = startOfDay(new Date())

  const [profile, plan, consumed, readings, savedIds] = await Promise.all([
    getUserProfile(userId),
    getMealPlanByDate(userId, today),
    getDailyNutrition(userId, today),
    getLatestReadings(userId),
    getSavedSourceMealIds(userId),
  ])

  const targets = profile ? calculateDailyTargets(profile) : null
  const firstName = session?.user?.name?.split(" ")[0] ?? "there"
  const hasPlan = (plan?.meals.length ?? 0) > 0

  return (
    <>
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's your nutrition at a glance."
      />

      <div className="space-y-6">
        <TodaysMeals meals={plan?.meals ?? []} hasPlan={hasPlan} savedMealIds={savedIds} />

        <div className="grid gap-6 lg:grid-cols-2">
          <NutritionRing consumed={consumed} targets={targets} />
          <HealthSnapshot readings={readings} />
        </div>

        <QuickActions />
      </div>
    </>
  )
}
