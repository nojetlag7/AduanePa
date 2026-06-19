"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { GroceryGroup } from "@/lib/services/grocery"

function itemKey(category: string, name: string, unit: string) {
  return `${category}::${name}::${unit}`
}

export function GroceryList({ groups }: { groups: GroceryGroup[] }) {
  const router = useRouter()
  const [checked, setChecked] = React.useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = React.useState(false)

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0)
  const checkedCount = checked.size

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function regenerate() {
    setRefreshing(true)
    setChecked(new Set())
    router.refresh()
    // Re-enable shortly; router.refresh resolves on the server round-trip.
    window.setTimeout(() => setRefreshing(false), 800)
  }

  if (totalItems === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border-medium bg-bg-muted/40 p-8 text-center">
        <p className="text-sm font-medium text-text-primary">
          No meals planned for this week yet.
        </p>
        <p className="mt-1 text-sm text-text-muted">
          Generate a meal plan and your grocery list will be built automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          <span className="font-medium text-text-primary">{checkedCount}</span> of{" "}
          {totalItems} items checked
        </p>
        <Button variant="secondary" size="sm" onClick={regenerate} disabled={refreshing}>
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          Regenerate
        </Button>
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <section
            key={group.category}
            className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card"
          >
            <h2 className="mb-3 flex items-center justify-between text-sm font-semibold text-text-primary">
              {group.category}
              <span className="text-xs font-normal text-text-muted">
                {group.items.length} item{group.items.length === 1 ? "" : "s"}
              </span>
            </h2>
            <ul className="divide-y divide-border-light">
              {group.items.map((item) => {
                const key = itemKey(group.category, item.name, item.unit)
                const isChecked = checked.has(key)
                return (
                  <li key={key} className="flex items-center gap-3 py-2.5">
                    <Checkbox
                      id={key}
                      checked={isChecked}
                      onCheckedChange={() => toggle(key)}
                    />
                    <label
                      htmlFor={key}
                      className={`flex flex-1 cursor-pointer items-center justify-between gap-3 text-sm ${
                        isChecked
                          ? "text-text-muted line-through"
                          : "text-text-primary"
                      }`}
                    >
                      <span>{item.name}</span>
                      <span className="tabular-nums text-text-muted">
                        {item.amount} {item.unit}
                      </span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
