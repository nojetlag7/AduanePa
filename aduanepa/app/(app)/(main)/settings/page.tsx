import type { Metadata } from "next"
import { Settings } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Settings · AduanePa" }

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, health and preferences." />
      <EmptyState
        icon={Settings}
        title="Settings are coming soon"
        description="Update your profile, health conditions, language and appearance here."
      />
    </>
  )
}
