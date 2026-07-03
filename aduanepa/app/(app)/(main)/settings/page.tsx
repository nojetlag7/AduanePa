import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getUserProfile } from "@/lib/services/users"
import { PageHeader } from "@/components/shared/page-header"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { HealthProfileSettings } from "@/components/settings/health-profile-settings"
import { PasswordSettings } from "@/components/settings/password-settings"
import { LanguageSettings } from "@/components/settings/language-settings"
import { AppearanceSettings } from "@/components/settings/appearance-settings"
import { DangerZone } from "@/components/settings/danger-zone"

export const metadata: Metadata = { title: "Settings · AduanePa" }

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border-light bg-bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-5 space-y-0.5">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const user = await getUserProfile(session.user.id)
  if (!user) redirect("/login")

  return (
    <>
      <PageHeader title="Settings" subtitle="Manage your profile, health conditions, and preferences." />

      <div className="space-y-4 sm:space-y-5">
        <Section
          title="Profile"
          description="Update your name, email, and physical measurements."
        >
          <ProfileSettings user={user} />
        </Section>

        <Section
          title="Health profile"
          description="Update your health conditions and dietary goal. Changes take effect on your next meal generation."
        >
          <HealthProfileSettings user={user} />
        </Section>

        <Section
          title="Password"
          description="Change your account password."
        >
          <PasswordSettings />
        </Section>

        <Section
          title="Language"
          description="Choose the language for meal names and descriptions."
        >
          <LanguageSettings user={user} />
        </Section>

        <Section
          title="Appearance"
          description="Choose how AduanePa looks for you."
        >
          <AppearanceSettings />
        </Section>

        <Section
          title="Danger zone"
        >
          <DangerZone />
        </Section>
      </div>
    </>
  )
}
