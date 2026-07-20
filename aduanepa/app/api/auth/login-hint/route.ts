import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { rateLimit, getClientIp } from "@/lib/rate-limit"
import { z } from "zod"

const loginHintSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
})

export async function POST(request: Request) {
  const rl = rateLimit(`login-hint:${getClientIp(request)}`, {
    limit: 30,
    windowMs: 60 * 60 * 1000,
  })
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = loginHintSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ method: "unknown" })
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: {
      password: true,
      accounts: { where: { provider: "google" }, select: { id: true }, take: 1 },
    },
  })

  if (!user) {
    return NextResponse.json({ method: "unknown" })
  }

  if (!user.password && user.accounts.length > 0) {
    return NextResponse.json({ method: "google" })
  }

  return NextResponse.json({ method: "credentials" })
}
