import type { HealthCondition } from "@prisma/client"
import {
  classifyReading,
  READING_STATUS_LABELS,
  type ReadingStatus,
} from "@/lib/health-thresholds"
import { cn } from "@/lib/utils"

const STATUS_CLASSES: Record<ReadingStatus, string> = {
  healthy: "bg-success-bg text-success-dark",
  borderline: "bg-warning-bg text-warning-dark",
  high: "bg-error-bg text-error-dark",
}

export function ReadingBadge({
  metric,
  value,
  conditions = [],
  className,
}: {
  metric: "weight" | "bpSystolic" | "bloodSugar"
  value: number
  conditions?: HealthCondition[]
  className?: string
}) {
  const status = classifyReading(metric, value, conditions)
  if (!status) return null

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_CLASSES[status],
        className
      )}
    >
      {READING_STATUS_LABELS[status]}
    </span>
  )
}
