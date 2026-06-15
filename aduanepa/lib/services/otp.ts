import "server-only"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

const OTP_TTL_MS = 10 * 60 * 1000 // 10 minutes
const MAX_SENDS_PER_HOUR = 3

/** Generates a cryptographically reasonable 6-digit numeric code. */
function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Invalidates all of a user's existing OTPs by marking them used. Call before
 * generating a fresh code to prevent replay of older codes.
 */
export async function invalidateOtps(userId: string): Promise<void> {
  await prisma.emailOtp.updateMany({
    where: { userId, usedAt: null },
    data: { usedAt: new Date() },
  })
}

/**
 * Returns true if the user has hit the send rate limit (3 per rolling hour).
 */
export async function isRateLimited(userId: string): Promise<boolean> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentSends = await prisma.emailOtp.count({
    where: { userId, createdAt: { gte: oneHourAgo } },
  })
  return recentSends >= MAX_SENDS_PER_HOUR
}

/**
 * Generates a 6-digit OTP, hashes it, persists it (10-minute expiry), and
 * returns the plain code so the caller can email it. Prior unused OTPs are
 * invalidated first.
 */
export async function generateOtp(userId: string, email: string): Promise<string> {
  await invalidateOtps(userId)

  const code = generateCode()
  const hashedCode = await bcrypt.hash(code, 10)

  await prisma.emailOtp.create({
    data: {
      userId,
      email,
      code: hashedCode,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  })

  return code
}

type VerifyResult =
  | { success: true }
  | { success: false; error: string }

/**
 * Verifies a submitted code against the most recent unused, unexpired OTP for
 * the user. Marks it used on success.
 */
export async function verifyOtp(userId: string, code: string): Promise<VerifyResult> {
  const otp = await prisma.emailOtp.findFirst({
    where: { userId, usedAt: null },
    orderBy: { createdAt: "desc" },
  })

  if (!otp) {
    return { success: false, error: "No verification code found. Please request a new one." }
  }

  if (otp.expiresAt < new Date()) {
    return { success: false, error: "This code has expired. Please request a new one." }
  }

  const matches = await bcrypt.compare(code, otp.code)
  if (!matches) {
    return { success: false, error: "Incorrect code. Please check and try again." }
  }

  await prisma.emailOtp.update({
    where: { id: otp.id },
    data: { usedAt: new Date() },
  })

  return { success: true }
}
