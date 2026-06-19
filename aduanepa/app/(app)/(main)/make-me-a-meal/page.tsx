import type { Metadata } from "next"
import { MakeMeAMealClient } from "@/components/make-me-a-meal/make-me-a-meal-client"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Make Me a Meal · AduanePa" }

export default function MakeMeAMealPage() {
  return (
    <>
      <PageHeader
        title="Make Me a Meal"
        subtitle="Tell us what you have at home and we'll build a meal that fits your dietary needs."
      />
      <MakeMeAMealClient />
    </>
  )
}
