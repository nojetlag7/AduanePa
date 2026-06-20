"use client"

import { Cell, Pie, PieChart } from "recharts"

import { useChartColors } from "@/lib/use-chart-colors"

const DONUT_SIZE = 180

export function MacroDonut({
  proteinG,
  carbsG,
  fatG,
}: {
  proteinG: number
  carbsG: number
  fatG: number
}) {
  const colors = useChartColors()

  const data = [
    { key: "protein", label: "Protein", grams: proteinG, color: colors.protein },
    { key: "carbs", label: "Carbs", grams: carbsG, color: colors.carbs },
    { key: "fat", label: "Fat", grams: fatG, color: colors.fat },
  ]
  const total = proteinG + carbsG + fatG

  if (total <= 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-text-muted">
        No macro data yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      <div
        className="relative shrink-0"
        style={{ height: DONUT_SIZE, width: DONUT_SIZE }}
      >
        <PieChart width={DONUT_SIZE} height={DONUT_SIZE}>
          <Pie
            data={data}
            dataKey="grams"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={80}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-text-primary">
            {Math.round(total)}
            <span className="text-xs font-normal text-text-muted">g</span>
          </span>
          <span className="text-[10px] uppercase tracking-wide text-text-muted">
            per day
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2 sm:w-auto">
        {data.map((entry) => {
          const pct = total > 0 ? Math.round((entry.grams / total) * 100) : 0
          return (
            <li key={entry.key} className="flex items-center gap-2 text-sm">
              <span
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: entry.color }}
                aria-hidden="true"
              />
              <span className="font-medium text-text-primary">{entry.label}</span>
              <span className="ml-auto tabular-nums text-text-secondary">
                {Math.round(entry.grams)}g
              </span>
              <span className="w-9 text-right tabular-nums text-text-muted">{pct}%</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
