import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updatePassword } from "@/lib/services/users"
import { passwordSettingsSchema } from "@/lib/validations/settings"

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

  const parsed = passwordSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    await updatePassword(session.user.id, parsed.data.currentPassword, parsed.data.newPassword)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error && err.message === "WRONG_PASSWORD") {
      return NextResponse.json(
        { error: "Validation failed", fields: { currentPassword: ["Incorrect password"] } },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
  }
}
