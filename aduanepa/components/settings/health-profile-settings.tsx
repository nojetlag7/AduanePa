"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DietaryGoal, HealthCondition } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  healthProfileSettingsSchema,
  type HealthProfileSettingsInput,
} from "@/lib/validations/settings"
import type { UserProfile } from "@/types"

const CONDITION_LABELS: Record<string, string> = {
  HYPERTENSION: "Hypertension (high blood pressure)",
  DIABETES: "Diabetes",
  OBESITY: "Obesity",
}

const GOAL_OPTIONS: { value: DietaryGoal; label: string; description: string }[] = [
  { value: DietaryGoal.WEIGHT_LOSS, label: "Weight loss", description: "Calorie deficit, high satiety foods" },
  { value: DietaryGoal.MUSCLE_GAIN, label: "Muscle gain", description: "Calorie surplus, high protein" },
  { value: DietaryGoal.MAINTENANCE, label: "Maintenance", description: "Balanced diet at current weight" },
  { value: DietaryGoal.HEART_HEALTH, label: "Heart health", description: "Low saturated fat, omega-3 rich" },
  { value: DietaryGoal.BLOOD_SUGAR_CONTROL, label: "Blood sugar control", description: "Low GI, complex carbs" },
]

const SELECTABLE = [HealthCondition.HYPERTENSION, HealthCondition.DIABETES, HealthCondition.OBESITY]

interface Props {
  user: UserProfile
}

export function HealthProfileSettings({ user }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<
    Partial<Record<keyof HealthProfileSettingsInput, string[]>>
  >({})

  const initConditions = user.healthConditions.filter((c): c is (typeof SELECTABLE)[number] =>
    SELECTABLE.includes(c as (typeof SELECTABLE)[number])
  )
  const [conditions, setConditions] = useState<HealthCondition[]>(initConditions)
  const [goal, setGoal] = useState<DietaryGoal>(user.dietaryGoal ?? DietaryGoal.MAINTENANCE)

  function toggleCondition(condition: HealthCondition) {
    setConditions((prev) =>
      prev.includes(condition) ? prev.filter((c) => c !== condition) : [...prev, condition]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const parsed = healthProfileSettingsSchema.safeParse({
      healthConditions: conditions,
      dietaryGoal: goal,
    })
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors as typeof errors)
      return
    }
    setErrors({})
    setSaving(true)

    try {
      const res = await fetch("/api/users/health-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          healthConditions: conditions,
          dietaryGoal: goal,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.fields) setErrors(json.fields)
        else toast.error(json.error ?? "Failed to update health profile")
        return
      }
      toast.success("Health profile updated")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <p id="health-conditions-label" className="text-sm font-medium text-text-primary">
          Health conditions
        </p>
        <div
          role="group"
          aria-labelledby="health-conditions-label"
          className="space-y-2.5"
        >
          {SELECTABLE.map((c) => (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-light p-3 transition-colors hover:bg-bg-muted"
            >
              <Checkbox
                checked={conditions.includes(c)}
                onCheckedChange={() => toggleCondition(c)}
              />
              <span className="text-sm text-text-primary">{CONDITION_LABELS[c]}</span>
            </label>
          ))}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border-light p-3 transition-colors hover:bg-bg-muted">
            <Checkbox
              checked={conditions.length === 0}
              onCheckedChange={() => setConditions([])}
            />
            <span className="text-sm text-text-primary">None of the above</span>
          </label>
        </div>
        {errors.healthConditions && (
          <p className="text-xs text-error">{errors.healthConditions[0]}</p>
        )}
      </div>

      <div className="space-y-3">
        <p id="dietary-goal-label" className="text-sm font-medium text-text-primary">
          Dietary goal
        </p>
        <div
          role="radiogroup"
          aria-labelledby="dietary-goal-label"
          className="grid gap-2 sm:grid-cols-2"
        >
          {GOAL_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-bg-muted ${
                goal === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border-light"
              }`}
            >
              <input
                type="radio"
                name="dietaryGoal"
                value={opt.value}
                checked={goal === opt.value}
                onChange={() => setGoal(opt.value)}
                className="mt-0.5 accent-primary"
              />
              <span>
                <span className="block text-sm font-medium text-text-primary">{opt.label}</span>
                <span className="block text-xs text-text-muted">{opt.description}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.dietaryGoal && (
          <p className="text-xs text-error">{errors.dietaryGoal[0]}</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save health profile"}
        </Button>
      </div>
    </form>
  )
}
