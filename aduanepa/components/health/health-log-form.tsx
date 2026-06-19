"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HealthLogSchema } from "@/lib/validations/health"

export interface TodayLogValues {
  weight: string
  bloodSugar: string
  bpSystolic: string
  bpDiastolic: string
  notes: string
}

const EMPTY: TodayLogValues = {
  weight: "",
  bloodSugar: "",
  bpSystolic: "",
  bpDiastolic: "",
  notes: "",
}

export function HealthLogForm({
  initialValues,
  isUpdate,
}: {
  initialValues?: Partial<TodayLogValues>
  isUpdate?: boolean
}) {
  const router = useRouter()
  const [values, setValues] = React.useState<TodayLogValues>({ ...EMPTY, ...initialValues })
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [submitting, setSubmitting] = React.useState(false)

  function setField(key: keyof TodayLogValues, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErrors({})

    const payload = {
      weight: values.weight,
      bloodSugar: values.bloodSugar,
      bpSystolic: values.bpSystolic,
      bpDiastolic: values.bpDiastolic,
      notes: values.notes,
    }

    const parsed = HealthLogSchema.safeParse(payload)
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors
      const flat: Record<string, string> = {}
      for (const [key, msgs] of Object.entries(fieldErrors)) {
        if (msgs?.[0]) flat[key] = msgs[0]
      }
      setErrors(flat)
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/health/logs", {
        method: "POST",
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
          toast.error(data.error ?? "Could not save your readings.")
        }
        return
      }

      toast.success(isUpdate ? "Today's readings updated." : "Readings logged.")
      router.push("/health")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-6 sm:p-7">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Weight (kg)" htmlFor="weight" error={errors.weight}>
            <Input
              id="weight"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={20}
              max={300}
              placeholder="e.g. 72.5"
              value={values.weight}
              onChange={(e) => setField("weight", e.target.value)}
              aria-invalid={!!errors.weight}
            />
          </Field>

          <Field label="Blood sugar (mmol/L)" htmlFor="bloodSugar" error={errors.bloodSugar}>
            <Input
              id="bloodSugar"
              type="number"
              inputMode="decimal"
              step="0.1"
              min={2}
              max={30}
              placeholder="e.g. 5.4"
              value={values.bloodSugar}
              onChange={(e) => setField("bloodSugar", e.target.value)}
              aria-invalid={!!errors.bloodSugar}
            />
          </Field>

          <Field label="Systolic BP (mmHg)" htmlFor="bpSystolic" error={errors.bpSystolic}>
            <Input
              id="bpSystolic"
              type="number"
              inputMode="numeric"
              min={60}
              max={250}
              placeholder="e.g. 118"
              value={values.bpSystolic}
              onChange={(e) => setField("bpSystolic", e.target.value)}
              aria-invalid={!!errors.bpSystolic}
            />
          </Field>

          <Field label="Diastolic BP (mmHg)" htmlFor="bpDiastolic" error={errors.bpDiastolic}>
            <Input
              id="bpDiastolic"
              type="number"
              inputMode="numeric"
              min={40}
              max={150}
              placeholder="e.g. 76"
              value={values.bpDiastolic}
              onChange={(e) => setField("bpDiastolic", e.target.value)}
              aria-invalid={!!errors.bpDiastolic}
            />
          </Field>
        </div>

        <Field label="Notes (optional)" htmlFor="notes" error={errors.notes}>
          <textarea
            id="notes"
            rows={3}
            maxLength={500}
            placeholder="Anything worth remembering about today…"
            value={values.notes}
            onChange={(e) => setField("notes", e.target.value)}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </Field>

        <p className="text-xs text-text-muted">
          All fields are optional — log just what you measured today.
        </p>

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isUpdate ? "Update readings" : "Save readings"}
          </Button>
        </div>
      </form>
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
