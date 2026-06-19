"use client"

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import type { DailyNutrition } from "@/lib/services/nutrition"
import type { NutritionalTargets } from "@/types"

export function NutritionRing({
  consumed,
  targets,
}: {
  consumed: DailyNutrition | null
  targets: NutritionalTargets | null
}) {
  const calories = consumed?.calories ?? 0
  const target = targets?.calories ?? 0
  const remaining = Math.max(target - calories, 0)

  const chartData =
    target > 0
      ? [
          { name: "Consumed", value: Math.min(calories, target) },
          { name: "Remaining", value: remaining },
        ]
      : [{ name: "Empty", value: 1 }]

  const pct =
    target > 0 ? Math.min(Math.round((calories / target) * 100), 100) : 0

  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-text-primary">
        Daily nutrition
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Calories and macros from today&apos;s plan.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative h-44 w-44">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={52}
                outerRadius={72}
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                <Cell fill="hsl(var(--primary))" />
                <Cell fill="hsl(var(--muted))" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-text-primary">{pct}%</span>
            <span className="text-xs text-text-muted">of target</span>
          </div>
        </div>

        <div className="grid w-full max-w-xs gap-2 text-sm sm:max-w-none">
          <div className="flex justify-between">
            <span className="text-text-secondary">Calories</span>
            <span className="font-medium text-text-primary">
              {calories}
              {target > 0 ? ` / ${Math.round(target)}` : ""} kcal
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Protein</span>
            <span className="font-medium text-text-primary">
              {consumed?.proteinG ?? 0}
              {targets ? ` / ${targets.proteinG}` : ""} g
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Carbs</span>
            <span className="font-medium text-text-primary">
              {consumed?.carbsG ?? 0}
              {targets ? ` / ${targets.carbsG}` : ""} g
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Fat</span>
            <span className="font-medium text-text-primary">
              {consumed?.fatG ?? 0}
              {targets ? ` / ${targets.fatG}` : ""} g
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-muted">
        Nutritional values are estimates. Macros use FoodItem data when ingredients match our database.
      </p>
    </section>
  )
}
