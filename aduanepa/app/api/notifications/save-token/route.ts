import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { saveDeviceToken } from "@/lib/services/notifications"
import { saveDeviceTokenSchema } from "@/lib/validations/notifications"

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

  const parsed = saveDeviceTokenSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const userAgent = request.headers.get("user-agent")
  const record = await saveDeviceToken(session.user.id, parsed.data.token, userAgent)

  return NextResponse.json({
    ok: true,
    id: record.id,
  })
}
