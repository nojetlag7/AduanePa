import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateLanguage } from "@/lib/services/users"
import { languageToLocale, LOCALE_COOKIE } from "@/lib/locale"
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
  const locale = languageToLocale(language)

  const response = NextResponse.json({ language, locale })

  // Mirror the DB language preference to the NEXT_LOCALE cookie so next-intl
  // picks up the new locale on the next request without a full sign-out.
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    httpOnly: false, // must be readable by client for cookie-sync on language change
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })

  return response
}
