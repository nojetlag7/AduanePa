import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { languageToLocale, LOCALE_COOKIE } from "@/lib/locale"
import { safeRedirectPath, syncSessionFromDb } from "@/lib/session-sync"

/** Refresh the JWT from the database, then redirect (cookie writes require a route handler). */
export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  await syncSessionFromDb()

  const { searchParams } = new URL(request.url)
  const target = safeRedirectPath(searchParams.get("redirect"))
  const response = NextResponse.redirect(new URL(target, request.url))

  // Sync User.language → NEXT_LOCALE cookie on every session refresh/login
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { language: true },
  })
  if (user) {
    response.cookies.set(LOCALE_COOKIE, languageToLocale(user.language), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  return response
}
