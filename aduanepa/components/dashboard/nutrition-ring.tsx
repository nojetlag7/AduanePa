"use client"

import type { DailyNutrition } from "@/lib/services/nutrition"
import type { NutritionalTargets } from "@/types"

const RING_SIZE = 176
const RING_STROKE = 14
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function NutritionRing({
  consumed,
  targets,
}: {
  consumed: DailyNutrition | null
  targets: NutritionalTargets | null
}) {
  const calories = consumed?.calories ?? 0
  const target = targets?.calories ?? 0

  const pct =
    target > 0 ? Math.min(Math.round((calories / target) * 100), 100) : 0

  const progressOffset = RING_CIRCUMFERENCE * (1 - pct / 100)

  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-text-primary">
        Daily nutrition
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        Calories and macros from today&apos;s plan.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="relative shrink-0"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            className="-rotate-90"
            aria-hidden="true"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="var(--border-medium)"
              strokeWidth={RING_STROKE}
            />
            {target > 0 && pct > 0 && (
              <circle
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth={RING_STROKE}
                strokeLinecap="round"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={progressOffset}
                className="transition-[stroke-dashoffset] duration-500 ease-out"
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums text-text-primary">
              {pct}%
            </span>
            <span className="text-xs text-text-muted">of target</span>
          </div>
        </div>

        <div className="grid w-full max-w-xs gap-2 text-sm sm:max-w-none">
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">Calories</span>
            <span className="font-medium tabular-nums text-text-primary">
              {calories}
              {target > 0 ? ` / ${Math.round(target)}` : ""} kcal
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">Protein</span>
            <span className="font-medium tabular-nums text-text-primary">
              {consumed?.proteinG ?? 0}
              {targets ? ` / ${targets.proteinG}` : ""} g
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">Carbs</span>
            <span className="font-medium tabular-nums text-text-primary">
              {consumed?.carbsG ?? 0}
              {targets ? ` / ${targets.carbsG}` : ""} g
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-text-secondary">Fat</span>
            <span className="font-medium tabular-nums text-text-primary">
              {consumed?.fatG ?? 0}
              {targets ? ` / ${targets.fatG}` : ""} g
            </span>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-text-muted">
        Nutritional values are estimates. Macros use FoodItem data when ingredients match our
        database.
      </p>
    </section>
  )
}
