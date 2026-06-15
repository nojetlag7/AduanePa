import { redirect } from "next/navigation"
import { AppShell } from "@/components/shared/app-shell"
import { auth } from "@/lib/auth"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Middleware already enforces this, but guard here too so `session.user` is
  // never null for the shell.
  if (!session?.user?.id) redirect("/login")
  if (!session.user.isEmailVerified) redirect("/verify-email")

  return (
    <AppShell user={{ name: session.user.name ?? "User", email: session.user.email ?? "" }}>
      {children}
    </AppShell>
  )
}
