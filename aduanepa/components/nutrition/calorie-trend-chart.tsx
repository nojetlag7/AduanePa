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
import { useChartColors } from "@/lib/use-chart-colors"
import type { TrendPoint } from "@/lib/services/nutrition"

export function CalorieTrendChart({
  data,
  targetCalories,
}: {
  /** Up to 30 oldest→newest daily points. */
  data: TrendPoint[]
  targetCalories?: number | null
}) {
  const colors = useChartColors()
  const [range, setRange] = React.useState<"14" | "30">("14")
  const visible = range === "14" ? data.slice(-14) : data

  const hasData = visible.some((p) => p.calories > 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">Daily calories</p>
        <Tabs value={range} onValueChange={(v) => setRange(v as "14" | "30")}>
          <TabsList>
            <TabsTrigger value="14">14 days</TabsTrigger>
            <TabsTrigger value="30">30 days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {hasData ? (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visible} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: colors.axis }}
                tickLine={false}
                axisLine={{ stroke: colors.grid }}
                minTickGap={16}
              />
              <YAxis
                tick={{ fontSize: 11, fill: colors.axis }}
                tickLine={false}
                axisLine={false}
                width={44}
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
                formatter={(value) => [`${value} kcal`, "Calories"]}
              />
              <Line
                type="monotone"
                dataKey="calories"
                stroke={colors.primary}
                strokeWidth={2}
                dot={{ r: 2, fill: colors.primary }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[260px] items-center justify-center text-sm text-text-muted">
          No calorie history for this period yet.
        </div>
      )}

      {targetCalories ? (
        <p className="text-xs text-text-muted">
          Daily target: <span className="font-medium text-text-secondary">{Math.round(targetCalories)} kcal</span>
        </p>
      ) : null}
    </div>
  )
}
