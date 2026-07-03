import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateLanguage } from "@/lib/services/users"
import { languageSettingsSchema } from "@/lib/validations/settings"

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

  const parsed = languageSettingsSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const language = await updateLanguage(session.user.id, parsed.data)
  return NextResponse.json({ language })
}
