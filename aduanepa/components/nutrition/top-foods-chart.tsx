"use client"

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { TopFood } from "@/lib/services/nutrition"

export function TopFoodsChart({ foods }: { foods: TopFood[] }) {
  if (foods.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-text-muted">
        Generate a few meals to see your most-eaten foods.
      </div>
    )
  }

  const height = Math.max(160, foods.length * 34)

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
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
            tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--bg-muted)" }}
            contentStyle={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--text-primary)",
            }}
            formatter={(value) => [`${value}×`, "Used"]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {foods.map((food) => (
              <Cell key={food.name} fill="var(--color-primary)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
