"use client"

import Link from "next/link"
import { Activity, ChefHat, UtensilsCrossed } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"

/** Secondary shortcuts — primary "Generate plan" lives on Today's meals. */
export function QuickActions() {
  const t = useTranslations("dashboard")

  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-card">
      <h2 className="font-display text-lg font-semibold text-text-primary">{t("quickActions")}</h2>
      <p className="mt-1 text-sm text-text-secondary">{t("quickActionsSubtitle")}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button asChild variant="secondary" className="w-full justify-start sm:w-auto">
          <Link href="/meals">
            <UtensilsCrossed className="h-4 w-4" aria-hidden="true" />
            {t("viewAllMeals")}
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full justify-start sm:w-auto">
          <Link href="/health/log">
            <Activity className="h-4 w-4" aria-hidden="true" />
            {t("logHealthData")}
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full justify-start sm:w-auto">
          <Link href="/make-me-a-meal">
            <ChefHat className="h-4 w-4" aria-hidden="true" />
            {t("makeMeAMeal")}
          </Link>
        </Button>
      </div>
    </section>
  )
}
