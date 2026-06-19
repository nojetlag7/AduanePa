"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { HealthTrendPoint } from "@/lib/services/health-logs"

type Metric = "weight" | "bpSystolic" | "bloodSugar"

const METRICS: { key: Metric; label: string; unit: string }[] = [
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "bpSystolic", label: "Blood pressure", unit: "mmHg" },
  { key: "bloodSugar", label: "Blood sugar", unit: "mmol/L" },
]

export function TrendChart({ data }: { data: HealthTrendPoint[] }) {
  const [metric, setMetric] = React.useState<Metric>("weight")
  const active = METRICS.find((m) => m.key === metric)!

  const series = data.filter((p) => p[metric] != null)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          {active.label} <span className="text-text-muted">({active.unit})</span>
        </p>
        <Tabs value={metric} onValueChange={(v) => setMetric(v as Metric)}>
          <TabsList>
            {METRICS.map((m) => (
              <TabsTrigger key={m.key} value={m.key}>
                {m.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {series.length > 0 ? (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--border-light)" }}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
                width={44}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-light)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--text-primary)",
                }}
                labelStyle={{ color: "var(--text-muted)" }}
                formatter={(value) => [`${value} ${active.unit}`, active.label]}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke="var(--color-primary)"
                strokeWidth={2}
                dot={{ r: 2.5, fill: "var(--color-primary)" }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-sm text-text-muted">
          No {active.label.toLowerCase()} readings logged yet.
        </div>
      )}
    </div>
  )
}
