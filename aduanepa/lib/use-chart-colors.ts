"use client"

import * as React from "react"

/**
 * Recharts applies colours as SVG presentation attributes (e.g. `fill="..."`),
 * where CSS `var(--x)` does NOT resolve and silently falls back to black.
 *
 * This hook reads the design-token CSS variables off `:root` as concrete
 * values via `getComputedStyle`, so charts can be passed literal colours that
 * still track the active theme. It re-resolves whenever the `.dark` class on
 * `<html>` changes (next-themes toggles it), keeping charts theme-aware.
 */
export interface ChartColors {
  primary: string
  grid: string
  axis: string
  text: string
  tooltipBg: string
  tooltipBorder: string
  protein: string
  carbs: string
  fat: string
  accent: string
}

const FALLBACK: ChartColors = {
  primary: "#3a6951",
  grid: "#d8dfda",
  axis: "#828a90",
  text: "#16191c",
  tooltipBg: "#ffffff",
  tooltipBorder: "#d8dfda",
  protein: "#3a6951",
  carbs: "#d98a2b",
  fat: "#4f7fc9",
  accent: "#7c5cbf",
}

function readColors(): ChartColors {
  if (typeof window === "undefined") return FALLBACK
  const cs = getComputedStyle(document.documentElement)
  const v = (name: string, fallback: string) => {
    const value = cs.getPropertyValue(name).trim()
    return value || fallback
  }
  return {
    primary: v("--color-primary", FALLBACK.primary),
    grid: v("--border-light", FALLBACK.grid),
    axis: v("--text-muted", FALLBACK.axis),
    text: v("--text-primary", FALLBACK.text),
    tooltipBg: v("--bg-card", FALLBACK.tooltipBg),
    tooltipBorder: v("--border-light", FALLBACK.tooltipBorder),
    protein: v("--chart-protein", FALLBACK.protein),
    carbs: v("--chart-carbs", FALLBACK.carbs),
    fat: v("--chart-fat", FALLBACK.fat),
    accent: v("--chart-accent", FALLBACK.accent),
  }
}

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  })
  return () => observer.disconnect()
}

export function useChartColors(): ChartColors {
  return React.useSyncExternalStore(subscribe, readColors, () => FALLBACK)
}
