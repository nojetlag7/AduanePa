import type {
  LanguagePreference,
  MeasurementSystem,
  ThemePreference,
} from "@prisma/client"
import type { NextAuthConfig } from "next-auth"
import { isProfileComplete } from "@/lib/profile"

// Edge-safe Auth.js configuration. Contains NO database or bcrypt imports so it
// can run inside middleware on the Edge runtime. The Credentials provider with
// its Prisma-backed `authorize` lives in lib/auth.ts (Node runtime only).
export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  // Providers are added in lib/auth.ts. Middleware only needs to decode the JWT.
  providers: [],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string
        token.language = user.language as LanguagePreference
        token.theme = user.theme as ThemePreference
        token.measurementSystem = user.measurementSystem as MeasurementSystem
        token.isEmailVerified = user.isEmailVerified ?? false
        token.isProfileComplete = user.isProfileComplete ?? false
      }
      if (trigger === "update") {
        const patch = session as {
          isEmailVerified?: boolean
          isProfileComplete?: boolean
          language?: LanguagePreference
        } | null
        if (patch?.isEmailVerified !== undefined) {
          token.isEmailVerified = patch.isEmailVerified
        } else if (!patch || Object.keys(patch).length === 0) {
          // Bare update() after OTP verification (legacy call site).
          token.isEmailVerified = true
        }
        if (patch?.isProfileComplete !== undefined) {
          token.isProfileComplete = patch.isProfileComplete
        }
        if (patch?.language !== undefined) {
          token.language = patch.language
        }
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.language = token.language as LanguagePreference
        session.user.theme = token.theme as ThemePreference
        session.user.measurementSystem = token.measurementSystem as MeasurementSystem
        session.user.isEmailVerified = token.isEmailVerified as boolean
        session.user.isProfileComplete = token.isProfileComplete as boolean
      }
      return session
    },
  },
} satisfies NextAuthConfig
