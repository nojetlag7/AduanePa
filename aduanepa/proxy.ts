import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/lib/auth.config"

const { auth } = NextAuth(authConfig)

// Routes reachable without a session.
const PUBLIC_PATHS = new Set(["/", "/login", "/register", "/offline", "/privacy"])

export default auth((req) => {
  const { nextUrl } = req
  const path = nextUrl.pathname
  const session = req.auth
  const isLoggedIn = !!session?.user
  const isVerified = session?.user?.isEmailVerified === true
  const isProfileComplete = session?.user?.isProfileComplete === true
  const isVerifyPage = path === "/verify-email"
  const isAuthPage = path === "/login" || path === "/register"
  const isOnboardingPage = path === "/onboarding"

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

  // Verified but profile incomplete: onboarding and privacy policy only.
  if (!isProfileComplete) {
    if (isOnboardingPage || path === "/privacy") return NextResponse.next()
    return NextResponse.redirect(new URL("/onboarding", nextUrl))
  }

  // Complete profile: keep users out of auth, verify, and onboarding pages.
  if (isAuthPage || isVerifyPage || isOnboardingPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  // Run on everything except API routes, Next internals, and static assets.
  // Include webp/avif/gif so next/image can fetch public-folder sources without
  // auth proxy redirecting the optimizer's internal request to /login.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js|firebase-messaging-sw.js|workbox-.*|swe-worker-.*|icons|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|webmanifest)).*)",
  ],
}
