"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  formatDisplayDate,
  shiftDate,
  toDateInputValue,
} from "@/lib/meal-utils"

export function MealsDateNav({ date }: { date: Date }) {
  const router = useRouter()
  const value = toDateInputValue(date)
  const prev = toDateInputValue(shiftDate(date, -1))
  const next = toDateInputValue(shiftDate(date, 1))

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-1">
        <Button asChild variant="outline" size="icon" aria-label="Previous day">
          <Link href={`/meals?date=${prev}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon" aria-label="Next day">
          <Link href={`/meals?date=${next}`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="text-center">
        <p className="font-display text-base font-semibold text-text-primary">
          {formatDisplayDate(date)}
        </p>
        <input
          type="date"
          value={value}
          onChange={(e) => router.push(`/meals?date=${e.target.value}`)}
          className="mt-1 rounded-md border border-border-light bg-bg-card px-2 py-1 text-xs text-text-secondary"
          aria-label="Pick a date"
        />
      </div>
    </div>
  )
}
