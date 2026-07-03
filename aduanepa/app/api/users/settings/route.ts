import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateProfile } from "@/lib/services/users"
import { profileSettingsSchema } from "@/lib/validations/settings"

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

  const parsed = profileSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    const profile = await updateProfile(session.user.id, parsed.data)
    return NextResponse.json({ profile })
  } catch (err) {
    if (err instanceof Error && err.message === "EMAIL_TAKEN") {
      return NextResponse.json(
        { error: "Validation failed", fields: { email: ["This email is already in use"] } },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
