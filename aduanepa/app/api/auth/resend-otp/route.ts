import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { sendOtpEmail } from "@/lib/email"
import { generateOtp, isRateLimited } from "@/lib/services/otp"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const userId = session.user.id

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
  }

  if (user.emailVerified) {
    return NextResponse.json({ error: "Email already verified" }, { status: 400 })
  }

  if (await isRateLimited(userId)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before requesting another code." },
      { status: 429 }
    )
  }

  try {
    const code = await generateOtp(userId, user.email)
    await sendOtpEmail(user.email, code)
  } catch (error) {
    console.error("[resend-otp] Failed:", error)
    return NextResponse.json({ error: "Failed to send verification email" }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
