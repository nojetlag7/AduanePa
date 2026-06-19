import type { Metadata } from "next"

import { auth } from "@/lib/auth"
import { generateGroceryList } from "@/lib/services/grocery"
import { PageHeader } from "@/components/shared/page-header"
import { GroceryList } from "@/components/grocery/grocery-list"

export const metadata: Metadata = { title: "Grocery List · AduanePa" }

export default async function GroceryPage() {
  const session = await auth()
  const userId = session!.user!.id

  const groups = await generateGroceryList(userId)

  return (
    <>
      <PageHeader
        title="Grocery List"
        subtitle="Ingredients aggregated from this week's meal plan, grouped by category."
      />
      <GroceryList groups={groups} />
    </>
  )
}
