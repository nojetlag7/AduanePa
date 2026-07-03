import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendOtpEmail } from "@/lib/email"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { generateOtp } from "@/lib/services/otp"
import { registerSchema } from "@/lib/validations/auth"

export async function POST(request: Request) {
  // 10 registration attempts per IP per hour
  const rl = rateLimit(`register:${getClientIp(request)}`, { limit: 10, windowMs: 60 * 60 * 1000 })
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { name, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists" },
      { status: 409 }
    )
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, emailVerified: false },
  })

  // Generate and send the OTP. If the email fails, the account still exists and
  // the user can trigger a resend from the verification page.
  let emailSent = true
  try {
    const code = await generateOtp(user.id, user.email)
    await sendOtpEmail({ email: user.email, name: user.name }, code)
  } catch (error) {
    console.error("[register] OTP email failed:", error)
    emailSent = false
  }

  return NextResponse.json({ userId: user.id, emailSent }, { status: 201 })
}
