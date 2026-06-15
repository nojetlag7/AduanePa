import type { Metadata } from "next"
import { HeartPulse } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Health · AduanePa" }

export default function HealthPage() {
  return (
    <>
      <PageHeader title="Health" subtitle="Track your weight, blood pressure and blood sugar." />
      <EmptyState
        icon={HeartPulse}
        title="Health monitoring is coming soon"
        description="Log your daily readings and watch your trends over time."
      />
    </>
  )
}
