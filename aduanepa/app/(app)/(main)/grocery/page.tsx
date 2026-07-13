import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { auth } from "@/lib/auth"
import { generateGroceryList } from "@/lib/services/grocery"
import { PageHeader } from "@/components/shared/page-header"
import { GroceryList } from "@/components/grocery/grocery-list"

export const metadata: Metadata = { title: "Grocery List · AduanePa" }

export default async function GroceryPage() {
  const session = await auth()
  const userId = session!.user!.id
  const t = await getTranslations("grocery")

  const groups = await generateGroceryList(userId)

  return (
    <>
      <PageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />
      <GroceryList groups={groups} />
    </>
  )
}
