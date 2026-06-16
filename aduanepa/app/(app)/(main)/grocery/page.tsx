import type { Metadata } from "next"
import { ShoppingBasket } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Grocery List · AduanePa" }

export default function GroceryPage() {
  return (
    <>
      <PageHeader title="Grocery List" subtitle="Everything you need for this week's plan." />
      <EmptyState
        icon={ShoppingBasket}
        title="Your grocery list is coming soon"
        description="We'll aggregate ingredients from your meal plan and group them by category."
      />
    </>
  )
}
