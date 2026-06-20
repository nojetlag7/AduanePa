"use client"

import { Bar, BarChart, Cell, Tooltip, XAxis, YAxis } from "recharts"

import { ResponsiveChart } from "@/components/charts/responsive-chart"
import { useChartColors } from "@/lib/use-chart-colors"
import type { TopFood } from "@/lib/services/nutrition"

export function TopFoodsChart({ foods }: { foods: TopFood[] }) {
  const colors = useChartColors()

  if (foods.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-text-muted">
        Generate a few meals to see your most-eaten foods.
      </div>
    )
  }

  const height = Math.max(160, foods.length * 34)

  return (
    <ResponsiveChart height={height}>
      {(width, chartHeight) => (
        <BarChart
          width={width}
          height={chartHeight}
          data={foods}
          layout="vertical"
          margin={{ top: 0, right: 16, bottom: 0, left: 8 }}
          barCategoryGap={8}
        >
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 12, fill: colors.text }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: colors.grid, fillOpacity: 0.4 }}
            contentStyle={{
              backgroundColor: colors.tooltipBg,
              border: `1px solid ${colors.tooltipBorder}`,
              borderRadius: 12,
              fontSize: 12,
              color: colors.text,
            }}
            formatter={(value) => [`${value}×`, "Used"]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {foods.map((food) => (
              <Cell key={food.name} fill={colors.primary} />
            ))}
          </Bar>
        </BarChart>
      )}
    </ResponsiveChart>
  )
}
