import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getTodayLog, upsertHealthLog } from "@/lib/services/health-logs"
import { HealthLogSchema } from "@/lib/validations/health"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const log = await getTodayLog(session.user.id)
  return NextResponse.json({ log })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = HealthLogSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { notes, ...readings } = parsed.data
  const log = await upsertHealthLog(session.user.id, {
    ...readings,
    notes: notes || null,
  })

  return NextResponse.json({ log })
}
