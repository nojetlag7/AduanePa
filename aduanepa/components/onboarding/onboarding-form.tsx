"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { DietaryGoal, HealthCondition, LanguagePreference } from "@prisma/client"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  onboardingStep1Schema,
  onboardingStep2Schema,
  onboardingStep3Schema,
  onboardingStep4Schema,
  SELECTABLE_CONDITIONS,
} from "@/lib/validations/onboarding"
import { cn } from "@/lib/utils"

const TOTAL_STEPS = 4

const STEP_HEADINGS = [
  { title: "About you", subtitle: "We use this to personalise your nutrition targets." },
  { title: "Health conditions", subtitle: "Select any that apply — we'll adjust your meal plans." },
  { title: "Your goal", subtitle: "What would you like your meals to help you achieve?" },
  { title: "Language", subtitle: "Choose how you'd like to use AduanePa." },
]

const CONDITION_LABELS: Record<(typeof SELECTABLE_CONDITIONS)[number], string> = {
  [HealthCondition.HYPERTENSION]: "High blood pressure (hypertension)",
  [HealthCondition.DIABETES]: "Diabetes",
  [HealthCondition.OBESITY]: "Obesity",
}

const GOAL_OPTIONS: { value: DietaryGoal; label: string; description: string }[] = [
  {
    value: DietaryGoal.WEIGHT_LOSS,
    label: "Lose weight",
    description: "Gradual calorie deficit with satisfying, local meals.",
  },
  {
    value: DietaryGoal.MUSCLE_GAIN,
    label: "Build muscle",
    description: "Higher protein and calories to support strength gains.",
  },
  {
    value: DietaryGoal.MAINTENANCE,
    label: "Maintain weight",
    description: "Balanced nutrition to stay where you are.",
  },
  {
    value: DietaryGoal.HEART_HEALTH,
    label: "Heart health",
    description: "Lower saturated fat, more fibre and omega-3 friendly foods.",
  },
  {
    value: DietaryGoal.BLOOD_SUGAR_CONTROL,
    label: "Blood sugar control",
    description: "Low-GI carbs and steady meal timing.",
  },
]

const LANGUAGE_OPTIONS: { value: LanguagePreference; label: string }[] = [
  { value: LanguagePreference.ENGLISH, label: "English" },
  { value: LanguagePreference.TWI, label: "Twi" },
  { value: LanguagePreference.GA, label: "Ga" },
]

function dateInputBounds() {
  const today = new Date()
  const max = new Date(today)
  max.setFullYear(today.getFullYear() - 10)
  const min = new Date(today)
  min.setFullYear(today.getFullYear() - 120)
  return {
    max: max.toISOString().slice(0, 10),
    min: min.toISOString().slice(0, 10),
  }
}

type FormState = {
  dateOfBirth: string
  weight: string
  height: string
  healthConditions: (typeof SELECTABLE_CONDITIONS)[number][]
  noneSelected: boolean
  dietaryGoal: DietaryGoal | ""
  language: LanguagePreference | ""
}

export function OnboardingForm() {
  const router = useRouter()
  const { update } = useSession()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [values, setValues] = useState<FormState>({
    dateOfBirth: "",
    weight: "",
    height: "",
    healthConditions: [],
    noneSelected: false,
    dietaryGoal: "",
    language: LanguagePreference.ENGLISH,
  })

  const bounds = useMemo(() => dateInputBounds(), [])
  const progress = (step / TOTAL_STEPS) * 100
  const heading = STEP_HEADINGS[step - 1]

  function clearError(key: string) {
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  function toggleCondition(condition: (typeof SELECTABLE_CONDITIONS)[number], checked: boolean) {
    setValues((prev) => {
      const nextConditions = checked
        ? [...prev.healthConditions, condition]
        : prev.healthConditions.filter((c) => c !== condition)
      return {
        ...prev,
        healthConditions: nextConditions,
        noneSelected: false,
      }
    })
    clearError("healthConditions")
  }

  function toggleNone(checked: boolean) {
    setValues((prev) => ({
      ...prev,
      noneSelected: checked,
      healthConditions: checked ? [] : prev.healthConditions,
    }))
    clearError("healthConditions")
  }

  function validateCurrentStep(): boolean {
    setErrors({})

    if (step === 1) {
      const parsed = onboardingStep1Schema.safeParse(values)
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors
        setErrors({
          dateOfBirth: fieldErrors.dateOfBirth?.[0] ?? "",
          weight: fieldErrors.weight?.[0] ?? "",
          height: fieldErrors.height?.[0] ?? "",
        })
        return false
      }
    }

    if (step === 2) {
      if (!values.noneSelected && values.healthConditions.length === 0) {
        setErrors({ healthConditions: "Select at least one option" })
        return false
      }
      const parsed = onboardingStep2Schema.safeParse({
        healthConditions: values.noneSelected ? [] : values.healthConditions,
      })
      if (!parsed.success) {
        setErrors({ healthConditions: "Select valid health conditions" })
        return false
      }
    }

    if (step === 3) {
      const parsed = onboardingStep3Schema.safeParse({ dietaryGoal: values.dietaryGoal })
      if (!parsed.success) {
        setErrors({ dietaryGoal: parsed.error.flatten().fieldErrors.dietaryGoal?.[0] ?? "Select a goal" })
        return false
      }
    }

    if (step === 4) {
      const parsed = onboardingStep4Schema.safeParse({ language: values.language })
      if (!parsed.success) {
        setErrors({ language: parsed.error.flatten().fieldErrors.language?.[0] ?? "Select a language" })
        return false
      }
    }

    return true
  }

  function goNext() {
    if (!validateCurrentStep()) return
    setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  }

  function goBack() {
    setErrors({})
    setStep((s) => Math.max(s - 1, 1))
  }

  async function handleComplete() {
    if (!validateCurrentStep()) return

    setIsSubmitting(true)
    try {
      const payload = {
        dateOfBirth: values.dateOfBirth,
        weight: values.weight,
        height: values.height,
        healthConditions: values.noneSelected ? [] : values.healthConditions,
        dietaryGoal: values.dietaryGoal,
        language: values.language,
      }

      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok) {
        if (data.fields) {
          const flat: Record<string, string> = {}
          for (const [key, msgs] of Object.entries(data.fields as Record<string, string[]>)) {
            if (msgs?.[0]) flat[key] = msgs[0]
          }
          setErrors(flat)
        } else {
          toast.error(data.error ?? "Could not save your profile.")
        }
        return
      }

      await update({
        isProfileComplete: true,
        language: values.language as LanguagePreference,
      })

      toast.success("Profile saved. Welcome to AduanePa!")
      router.push("/dashboard")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="rounded-2xl border-border-light/70 p-6 shadow-sm sm:p-7 dark:border-white/6">
      <div className="mb-6 space-y-3">
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <div className="mb-6 space-y-1">
        <h1 className="font-display text-2xl font-bold text-text-primary">{heading.title}</h1>
        <p className="text-sm text-text-secondary">{heading.subtitle}</p>
      </div>

      <div key={step} className="animate-in fade-in-0 slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
        {step === 1 && (
          <div className="space-y-4">
            <Field label="Date of birth" htmlFor="dob" error={errors.dateOfBirth}>
              <Input
                id="dob"
                type="date"
                min={bounds.min}
                max={bounds.max}
                value={values.dateOfBirth}
                onChange={(e) => {
                  setValues((v) => ({ ...v, dateOfBirth: e.target.value }))
                  clearError("dateOfBirth")
                }}
                aria-invalid={!!errors.dateOfBirth}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Weight (kg)" htmlFor="weight" error={errors.weight}>
                <Input
                  id="weight"
                  type="number"
                  inputMode="decimal"
                  min={20}
                  max={300}
                  step="0.1"
                  placeholder="e.g. 70"
                  value={values.weight}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, weight: e.target.value }))
                    clearError("weight")
                  }}
                  aria-invalid={!!errors.weight}
                />
              </Field>
              <Field label="Height (cm)" htmlFor="height" error={errors.height}>
                <Input
                  id="height"
                  type="number"
                  inputMode="decimal"
                  min={50}
                  max={250}
                  step="0.1"
                  placeholder="e.g. 170"
                  value={values.height}
                  onChange={(e) => {
                    setValues((v) => ({ ...v, height: e.target.value }))
                    clearError("height")
                  }}
                  aria-invalid={!!errors.height}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            {SELECTABLE_CONDITIONS.map((condition) => (
              <label
                key={condition}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-light bg-bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/30"
              >
                <Checkbox
                  checked={values.healthConditions.includes(condition)}
                  onCheckedChange={(checked) => toggleCondition(condition, checked === true)}
                  className="mt-0.5"
                />
                <span className="text-sm font-medium text-text-primary">
                  {CONDITION_LABELS[condition]}
                </span>
              </label>
            ))}
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border-light bg-bg-muted/40 p-4 transition-colors duration-200 hover:border-primary/30">
              <Checkbox
                checked={values.noneSelected}
                onCheckedChange={(checked) => toggleNone(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm font-medium text-text-primary">None of the above</span>
            </label>
            {errors.healthConditions && (
              <p className="text-xs text-error">{errors.healthConditions}</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2" role="radiogroup" aria-label="Dietary goal">
            {GOAL_OPTIONS.map((option) => {
              const selected = values.dietaryGoal === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => {
                    setValues((v) => ({ ...v, dietaryGoal: option.value }))
                    clearError("dietaryGoal")
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-border-light bg-bg-muted/40 hover:border-primary/30"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-primary bg-primary text-white" : "border-border-medium"
                    )}
                  >
                    {selected && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-text-primary">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-text-secondary">
                      {option.description}
                    </span>
                  </span>
                </button>
              )
            })}
            {errors.dietaryGoal && <p className="text-xs text-error">{errors.dietaryGoal}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="space-y-2" role="radiogroup" aria-label="Language preference">
              {LANGUAGE_OPTIONS.map((option) => {
                const selected = values.language === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => {
                      setValues((v) => ({ ...v, language: option.value }))
                      clearError("language")
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border-light bg-bg-muted/40 hover:border-primary/30"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-primary bg-primary text-white" : "border-border-medium"
                      )}
                    >
                      {selected && <Check className="h-2.5 w-2.5" aria-hidden="true" />}
                    </span>
                    <span className="text-sm font-medium text-text-primary">{option.label}</span>
                  </button>
                )
              })}
            </div>
            {errors.language && <p className="text-xs text-error">{errors.language}</p>}
            <p className="text-xs text-text-muted">You can change this anytime in Settings.</p>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={goBack}
          disabled={step === 1 || isSubmitting}
          className={cn(step === 1 && "invisible")}
        >
          <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" />
          Back
        </Button>

        {step < TOTAL_STEPS ? (
          <Button
            type="button"
            onClick={goNext}
            className="bg-primary text-white hover:bg-primary-hover"
          >
            Next
            <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting}
            className="bg-primary text-white hover:bg-primary-hover"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete setup
          </Button>
        )}
      </div>
    </Card>
  )
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  )
}
