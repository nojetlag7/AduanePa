import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

// Routes reachable without a session.
const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/offline"])

export default auth((req) => {
  const { nextUrl } = req
  const path = nextUrl.pathname
  const session = req.auth
  const isLoggedIn = !!session?.user
  const isVerified = session?.user?.isEmailVerified === true
  const isVerifyPage = path === "/verify-email"
  const isAuthPage = path === "/login" || path === "/register"

  if (!isLoggedIn) {
    if (PUBLIC_PATHS.has(path)) return NextResponse.next()
    // /verify-email and every protected (app) route require a session.
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Authenticated but email not yet verified: confine the user to /verify-email.
  if (!isVerified) {
    if (isVerifyPage) return NextResponse.next()
    return NextResponse.redirect(new URL("/verify-email", nextUrl))
  }

  // Authenticated and verified: keep them out of the auth/verify pages.
  if (isAuthPage || isVerifyPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Run on everything except API routes, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|workbox-.*|swe-worker-.*|icons|.*\\.(?:png|jpg|jpeg|svg|ico|webmanifest)).*)",
  ],
}
