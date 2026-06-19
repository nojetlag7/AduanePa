import { HealthCondition } from "@prisma/client"

export type ReadingStatus = "healthy" | "borderline" | "high"

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  healthy: "In range",
  borderline: "Borderline",
  high: "High",
}

/**
 * Systolic blood pressure (mmHg). Hypertensive users get a tighter target
 * (controlled BP < 130) per common clinical guidance.
 */
export function classifySystolic(
  value: number,
  conditions: HealthCondition[] = []
): ReadingStatus {
  const hypertensive = conditions.includes(HealthCondition.HYPERTENSION)
  if (hypertensive) {
    if (value < 130) return "healthy"
    if (value < 140) return "borderline"
    return "high"
  }
  if (value < 120) return "healthy"
  if (value < 140) return "borderline"
  return "high"
}

/** Fasting blood sugar (mmol/L). */
export function classifyBloodSugar(value: number): ReadingStatus {
  if (value < 5.6) return "healthy"
  if (value < 7.0) return "borderline"
  return "high"
}

/**
 * Resolve the status for a given metric. Weight has no universal healthy
 * range without more context, so it stays neutral (null).
 */
export function classifyReading(
  metric: "weight" | "bpSystolic" | "bloodSugar",
  value: number,
  conditions: HealthCondition[] = []
): ReadingStatus | null {
  switch (metric) {
    case "bpSystolic":
      return classifySystolic(value, conditions)
    case "bloodSugar":
      return classifyBloodSugar(value)
    case "weight":
      return null
  }
}
