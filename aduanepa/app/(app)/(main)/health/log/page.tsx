import type { Metadata } from "next"

import { auth } from "@/lib/auth"
import { getTodayLog } from "@/lib/services/health-logs"
import { PageHeader } from "@/components/shared/page-header"
import { HealthLogForm, type TodayLogValues } from "@/components/health/health-log-form"

export const metadata: Metadata = { title: "Log Health Data · AduanePa" }

function toFieldValue(value: number | null): string {
  return value == null ? "" : String(value)
}

export default async function HealthLogPage() {
  const session = await auth()
  const userId = session!.user!.id

  const existing = await getTodayLog(userId)

  const initialValues: Partial<TodayLogValues> | undefined = existing
    ? {
        weight: toFieldValue(existing.weight),
        bloodSugar: toFieldValue(existing.bloodSugar),
        bpSystolic: toFieldValue(existing.bpSystolic),
        bpDiastolic: toFieldValue(existing.bpDiastolic),
        notes: existing.notes ?? "",
      }
    : undefined

  const todayLabel = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <>
      <PageHeader
        title="Log today's data"
        subtitle={`Logging for: ${todayLabel}`}
      />
      <div className="mx-auto max-w-2xl">
        <HealthLogForm initialValues={initialValues} isUpdate={!!existing} />
      </div>
    </>
  )
}
