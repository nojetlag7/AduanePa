import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
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
  return NextResponse.redirect(new URL(target, request.url))
}
