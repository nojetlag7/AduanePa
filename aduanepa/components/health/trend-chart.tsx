"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { ResponsiveChart } from "@/components/charts/responsive-chart"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useChartColors } from "@/lib/use-chart-colors"
import type { HealthTrendPoint } from "@/lib/services/health-logs"

type Metric = "weight" | "bpSystolic" | "bloodSugar"

const METRICS: { key: Metric; label: string; unit: string }[] = [
  { key: "weight", label: "Weight", unit: "kg" },
  { key: "bpSystolic", label: "Blood pressure", unit: "mmHg" },
  { key: "bloodSugar", label: "Blood sugar", unit: "mmol/L" },
]

export function TrendChart({ data }: { data: HealthTrendPoint[] }) {
  const colors = useChartColors()
  const [metric, setMetric] = React.useState<Metric>("weight")
  const active = METRICS.find((m) => m.key === metric)!

  const metricColor: Record<Metric, string> = {
    weight: colors.protein,
    bpSystolic: colors.fat,
    bloodSugar: colors.carbs,
  }
  const lineColor = metricColor[metric]

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
        <ResponsiveChart height={280}>
          {(width, height) => (
            <LineChart
              width={width}
              height={height}
              data={series}
              margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: colors.axis }}
                tickLine={false}
                axisLine={{ stroke: colors.grid }}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 11, fill: colors.axis }}
                tickLine={false}
                axisLine={false}
                width={44}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.tooltipBg,
                  border: `1px solid ${colors.tooltipBorder}`,
                  borderRadius: 12,
                  fontSize: 12,
                  color: colors.text,
                }}
                labelStyle={{ color: colors.axis }}
                formatter={(value) => [`${value} ${active.unit}`, active.label]}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke={lineColor}
                strokeWidth={2}
                dot={{ r: 2.5, fill: lineColor }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            </LineChart>
          )}
        </ResponsiveChart>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-sm text-text-muted">
          No {active.label.toLowerCase()} readings logged yet.
        </div>
      )}
    </div>
  )
}
