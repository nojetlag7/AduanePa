"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { RefreshCw, ShoppingCart } from "lucide-react"

import { GeneratePlanButton } from "@/components/dashboard/generate-plan-button"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { GroceryGroup } from "@/lib/services/grocery"

function itemKey(category: string, name: string, unit: string) {
  return `${category}::${name}::${unit}`
}

export function GroceryList({ groups }: { groups: GroceryGroup[] }) {
  const router = useRouter()
  const t = useTranslations("grocery")
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
    window.setTimeout(() => setRefreshing(false), 800)
  }

  if (totalItems === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title={t("emptyTitle")}
        description={t("emptyDescription")}
        action={<GeneratePlanButton hasPlan={false} />}
      />
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
