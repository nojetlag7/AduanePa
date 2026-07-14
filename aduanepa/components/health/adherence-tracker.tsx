"use client"

import * as React from "react"
import Link from "next/link"
import { Check, Minus, X } from "lucide-react"
import { LogStatus, MealType } from "@prisma/client"
import { toast } from "sonner"

import { MEAL_SLOT_ORDER, MEAL_TYPE_LABELS } from "@/lib/meal-utils"
import { cn } from "@/lib/utils"

export interface AdherenceMeal {
  id: string
  name: string
  type: MealType
}

const OPTIONS: {
  status: LogStatus
  label: string
  icon: typeof Check
  activeClass: string
}[] = [
  {
    status: LogStatus.COMPLETED,
    label: "Done",
    icon: Check,
    activeClass: "bg-success-bg text-success-dark ring-success/40",
  },
  {
    status: LogStatus.SKIPPED,
    label: "Skipped",
    icon: X,
    activeClass: "bg-error-bg text-error-dark ring-error/40",
  },
  {
    status: LogStatus.PENDING,
    label: "Pending",
    icon: Minus,
    activeClass: "bg-bg-muted text-text-secondary ring-border-medium",
  },
]

export function AdherenceTracker({
  meals,
  initialStatuses,
  date,
  compact = false,
}: {
  meals: AdherenceMeal[]
  /** mealId → LogStatus already recorded for the day. */
  initialStatuses: Record<string, LogStatus>
  /** YYYY-MM-DD; defaults to today on the server. */
  date?: string
  compact?: boolean
}) {
  const [statuses, setStatuses] = React.useState<Record<string, LogStatus>>(
    () => ({ ...initialStatuses })
  )
  const [pending, setPending] = React.useState<string | null>(null)

  // Order meals by slot (Breakfast → Snack) for a stable, intuitive layout.
  const ordered = React.useMemo(
    () =>
      [...meals].sort(
        (a, b) => MEAL_SLOT_ORDER.indexOf(a.type) - MEAL_SLOT_ORDER.indexOf(b.type)
      ),
    [meals]
  )

  async function setStatus(mealId: string, status: LogStatus) {
    const previous = statuses[mealId] ?? LogStatus.PENDING
    if (previous === status) return

    setStatuses((s) => ({ ...s, [mealId]: status }))
    setPending(mealId)

    try {
      const res = await fetch("/api/health/adherence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId, status, date }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? "Could not save")
      }
    } catch (error) {
      // Revert optimistic update on failure.
      setStatuses((s) => ({ ...s, [mealId]: previous }))
      toast.error(error instanceof Error ? error.message : "Could not save")
    } finally {
      setPending(null)
    }
  }

  if (ordered.length === 0) {
    return (
      <p className="text-sm text-text-muted">
        No meals planned for today yet —{" "}
        <Link href="/dashboard" className="font-medium text-primary underline-offset-2 hover:underline">
          generate a plan
        </Link>{" "}
        to track adherence.
      </p>
    )
  }

  return (
    <ul className="space-y-2.5">
      {ordered.map((meal) => {
        const current = statuses[meal.id] ?? LogStatus.PENDING
        return (
          <li
            key={meal.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-light bg-bg-card px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                {MEAL_TYPE_LABELS[meal.type]}
              </p>
              {!compact && (
                <p className="truncate text-sm font-medium text-text-primary">
                  {meal.name}
                </p>
              )}
            </div>

            <div
              className="flex shrink-0 items-center gap-1"
              role="group"
              aria-label={`Mark ${MEAL_TYPE_LABELS[meal.type]} adherence`}
            >
              {OPTIONS.map((opt) => {
                const Icon = opt.icon
                const active = current === opt.status
                return (
                  <button
                    key={opt.status}
                    type="button"
                    onClick={() => setStatus(meal.id, opt.status)}
                    disabled={pending === meal.id}
                    aria-pressed={active}
                    aria-label={opt.label}
                    title={opt.label}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset transition-all",
                      "disabled:cursor-not-allowed disabled:opacity-60",
                      active
                        ? opt.activeClass
                        : "text-text-muted ring-transparent hover:bg-bg-muted hover:text-text-secondary"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    {!compact && <span>{opt.label}</span>}
                  </button>
                )
              })}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
