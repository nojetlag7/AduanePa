import type { Metadata } from "next"
import { ChefHat } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Make Me a Meal · AduanePa" }

export default function MakeMeAMealPage() {
  return (
    <>
      <PageHeader
        title="Make Me a Meal"
        subtitle="Tell us what you have at home and we'll build a meal."
      />
      <EmptyState
        icon={ChefHat}
        title="Ingredient-based meals are coming soon"
        description="Enter the ingredients you have and get a culturally relevant recipe that fits your dietary needs."
      />
    </>
  )
}
