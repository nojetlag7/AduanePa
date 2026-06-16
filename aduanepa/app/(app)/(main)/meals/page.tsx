import type { Metadata } from "next"
import { UtensilsCrossed } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "My Meals · AduanePa" }

export default function MealsPage() {
  return (
    <>
      <PageHeader title="My Meals" subtitle="Your current and past meal plans." />
      <EmptyState
        icon={UtensilsCrossed}
        title="Meal plans are coming soon"
        description="This is where your daily plans and saved recipes will live."
      />
    </>
  )
}
