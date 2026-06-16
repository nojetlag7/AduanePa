import { AppShell } from "@/components/shared/app-shell"
import { auth } from "@/lib/auth"

export default async function MainAppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  return (
    <AppShell user={{ name: session!.user.name ?? "User", email: session!.user.email ?? "" }}>
      {children}
    </AppShell>
  )
}
