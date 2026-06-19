import Link from "next/link"
import { Activity, ChefHat, UtensilsCrossed } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Secondary shortcuts — primary "Generate plan" lives on Today's meals. */
export function QuickActions() {
  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5">
      <h2 className="font-display text-lg font-semibold text-text-primary">Quick actions</h2>
      <p className="mt-1 text-sm text-text-secondary">
        Jump to logging, ingredient-based meals, or your full plan history.
      </p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/meals">
            <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
            View all meals
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/health/log">
            <Activity className="h-4 w-4" aria-hidden="true" />
            Log health data
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/make-me-a-meal">
            <ChefHat className="h-4 w-4" aria-hidden="true" />
            Make me a meal
          </Link>
        </Button>
      </div>
    </section>
  )
}
