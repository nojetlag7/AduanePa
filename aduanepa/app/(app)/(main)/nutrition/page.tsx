import type { Metadata } from "next"
import { Apple } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Nutrition · AduanePa" }

export default function NutritionPage() {
  return (
    <>
      <PageHeader title="Nutrition" subtitle="Your macro breakdown and intake trends." />
      <EmptyState
        icon={Apple}
        title="Nutrition analytics are coming soon"
        description="Charts for calories, macros and your most-eaten foods will appear here."
      />
    </>
  )
}
