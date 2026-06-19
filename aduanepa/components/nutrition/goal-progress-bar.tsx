import { Progress } from "@/components/ui/progress"
import type { MacroBreakdown } from "@/lib/services/nutrition"
import type { NutritionalTargets } from "@/types"

interface Row {
  label: string
  value: number
  target: number
  unit: string
}

export function GoalProgressBar({
  average,
  targets,
}: {
  average: MacroBreakdown
  targets: NutritionalTargets | null
}) {
  if (!targets) {
    return (
      <p className="text-sm text-text-muted">
        Complete your profile to see how your average intake compares to your daily goals.
      </p>
    )
  }

  const rows: Row[] = [
    { label: "Calories", value: average.calories, target: targets.calories, unit: "kcal" },
    { label: "Protein", value: average.proteinG, target: targets.proteinG, unit: "g" },
    { label: "Carbs", value: average.carbsG, target: targets.carbsG, unit: "g" },
    { label: "Fat", value: average.fatG, target: targets.fatG, unit: "g" },
  ]

  return (
    <ul className="space-y-4">
      {rows.map((row) => {
        const pct = row.target > 0 ? Math.min(Math.round((row.value / row.target) * 100), 100) : 0
        return (
          <li key={row.label} className="space-y-1.5">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-medium text-text-primary">{row.label}</span>
              <span className="tabular-nums text-text-secondary">
                {Math.round(row.value)}
                <span className="text-text-muted"> / {Math.round(row.target)} {row.unit}</span>
              </span>
            </div>
            <Progress value={pct} aria-label={`${row.label}: ${pct}% of daily target`} />
          </li>
        )
      })}
    </ul>
  )
}
