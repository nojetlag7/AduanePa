import Link from "next/link"
import { ArrowDown, ArrowUp, Minus, HeartPulse } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { LatestReadings } from "@/lib/services/health-logs"

function trendIcon(trend: "up" | "down" | "stable" | null) {
  if (trend === "up") return <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
  if (trend === "down") return <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
  if (trend === "stable") return <Minus className="h-3.5 w-3.5" aria-hidden="true" />
  return null
}

function readingBadge(value: number | null, kind: "weight" | "bp" | "sugar") {
  if (value == null) return "secondary" as const
  if (kind === "weight") return "secondary" as const
  if (kind === "bp") {
    if (value < 120) return "default" as const
    if (value < 140) return "secondary" as const
    return "destructive" as const
  }
  if (value < 5.6) return "default" as const
  if (value < 7.0) return "secondary" as const
  return "destructive" as const
}

export function HealthSnapshot({ readings }: { readings: LatestReadings }) {
  const hasData =
    readings.weight != null ||
    readings.bloodSugar != null ||
    readings.bpSystolic != null

  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-text-primary">
            Health snapshot
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Latest readings vs. roughly one week ago.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/health/log">Log today&apos;s data</Link>
        </Button>
      </div>

      {!hasData ? (
        <div className="mt-5 flex flex-col items-center rounded-lg border border-dashed border-border-medium px-4 py-8 text-center">
          <HeartPulse className="mb-2 h-8 w-8 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">No health readings yet.</p>
          <p className="mt-1 text-xs text-text-muted">
            Log weight, blood pressure, or blood sugar to see trends here.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ReadingTile
            label="Weight"
            value={readings.weight != null ? `${readings.weight} kg` : "—"}
            trend={readings.trends.weight}
            badge={readingBadge(readings.weight, "weight")}
          />
          <ReadingTile
            label="Blood pressure"
            value={
              readings.bpSystolic != null
                ? `${readings.bpSystolic}/${readings.bpDiastolic ?? "—"}`
                : "—"
            }
            trend={readings.trends.bpSystolic}
            badge={readingBadge(readings.bpSystolic, "bp")}
          />
          <ReadingTile
            label="Blood sugar"
            value={readings.bloodSugar != null ? `${readings.bloodSugar} mmol/L` : "—"}
            trend={readings.trends.bloodSugar}
            badge={readingBadge(readings.bloodSugar, "sugar")}
          />
        </div>
      )}
    </section>
  )
}

function ReadingTile({
  label,
  value,
  trend,
  badge,
}: {
  label: string
  value: string
  trend: "up" | "down" | "stable" | null
  badge: "default" | "secondary" | "destructive"
}) {
  return (
    <div className="rounded-lg border border-border-light bg-bg-muted/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
        {trend && (
          <span className="text-text-muted" title={`Trend: ${trend}`}>
            {trendIcon(trend)}
          </span>
        )}
      </div>
      <p className="mt-2 text-lg font-semibold text-text-primary">{value}</p>
      <Badge variant={badge} className="mt-2">
        {badge === "default" ? "In range" : badge === "secondary" ? "Borderline" : "High"}
      </Badge>
    </div>
  )
}
