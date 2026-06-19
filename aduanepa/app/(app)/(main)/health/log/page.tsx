import type { Metadata } from "next"
import Link from "next/link"
import { HeartPulse } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Log Health Data · AduanePa" }

export default function HealthLogPage() {
  return (
    <>
      <PageHeader
        title="Log today's data"
        subtitle="Record weight, blood pressure, and blood sugar."
      />
      <EmptyState
        icon={HeartPulse}
        title="Health logging arrives in Phase 10"
        description="The dashboard snapshot will populate once you can log readings here."
        action={
          <Button asChild variant="outline">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        }
      />
    </>
  )
}
