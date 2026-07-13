import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { MakeMeAMealClient } from "@/components/make-me-a-meal/make-me-a-meal-client"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Make Me a Meal · AduanePa" }

export default async function MakeMeAMealPage() {
  const t = await getTranslations("makeMeAMeal")

  return (
    <>
      <PageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />
      <MakeMeAMealClient />
    </>
  )
}
