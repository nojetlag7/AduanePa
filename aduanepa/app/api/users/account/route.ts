import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { deleteAccount } from "@/lib/services/users"
import { deleteAccountSchema } from "@/lib/validations/settings"

export async function DELETE(request: Request) {
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

  const parsed = deleteAccountSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  try {
    await deleteAccount(session.user.id, parsed.data)
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof Error) {
      if (err.message === "WRONG_PASSWORD") {
        return NextResponse.json(
          { error: "Validation failed", fields: { password: ["Incorrect password"] } },
          { status: 400 }
        )
      }
      if (err.message === "EMAIL_MISMATCH") {
        return NextResponse.json(
          {
            error: "Validation failed",
            fields: { confirmEmail: ["Email does not match your account"] },
          },
          { status: 400 }
        )
      }
      if (err.message === "PASSWORD_REQUIRED") {
        return NextResponse.json(
          { error: "Validation failed", fields: { password: ["Password is required"] } },
          { status: 400 }
        )
      }
      if (err.message === "EMAIL_CONFIRMATION_REQUIRED") {
        return NextResponse.json(
          {
            error: "Validation failed",
            fields: { confirmEmail: ["Enter your email to confirm deletion"] },
          },
          { status: 400 }
        )
      }
    }
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 })
  }
}
