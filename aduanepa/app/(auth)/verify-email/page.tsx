import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isProfileComplete } from "@/lib/profile"

export const metadata: Metadata = {
  title: "Verify your email · AduanePa",
}

export default async function VerifyEmailPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Trust the DB over a stale JWT — verification may succeed server-side before
  // the client session cookie catches up.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, dateOfBirth: true, weight: true, height: true },
  })

  if (user?.emailVerified || session.user.isEmailVerified) {
    redirect(user && isProfileComplete(user) ? "/dashboard" : "/onboarding")
  }

  return (
    <Card className="rounded-2xl border-border-light/70 shadow-sm dark:border-white/6">
      <CardHeader>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We sent a 6-digit code to{" "}
          <span className="font-medium text-text-primary">{session.user.email}</span>. Enter it
          below to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VerifyEmailForm />
      </CardContent>
    </Card>
  )
}
