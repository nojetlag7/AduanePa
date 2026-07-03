import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateHealthProfile } from "@/lib/services/users"
import { healthProfileSettingsSchema } from "@/lib/validations/settings"

export async function PATCH(request: Request) {
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

  const parsed = healthProfileSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const profile = await updateHealthProfile(session.user.id, parsed.data)
  return NextResponse.json({ profile })
}
