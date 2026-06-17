import { NextResponse } from "next/server"
import { auth, unstable_update } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { verifyOtp } from "@/lib/services/otp"
import { verifyOtpSchema } from "@/lib/validations/auth"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = verifyOtpSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const result = await verifyOtp(session.user.id, parsed.data.code)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { emailVerified: true, emailVerifiedAt: new Date() },
  })

  // Refresh the session cookie on the server so middleware allows /onboarding.
  await unstable_update({ user: { isEmailVerified: true } })

  return NextResponse.json({ success: true })
}
