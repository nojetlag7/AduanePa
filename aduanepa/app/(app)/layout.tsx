import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

/** Shared auth guard for all protected app routes (shell + onboarding). */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user?.id) redirect("/login")
  if (!session.user.isEmailVerified) redirect("/verify-email")

  return children
}
