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

export const metadata: Metadata = {
  title: "Verify your email · AduanePa",
}

export default async function VerifyEmailPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  if (session.user.isEmailVerified) redirect("/dashboard")

  return (
    <Card className="rounded-2xl">
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
