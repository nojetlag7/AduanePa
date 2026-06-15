import type {
  LanguagePreference,
  MeasurementSystem,
  ThemePreference,
} from "@prisma/client"
import type { NextAuthConfig } from "next-auth"

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
    jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string
        token.language = user.language as LanguagePreference
        token.theme = user.theme as ThemePreference
        token.measurementSystem = user.measurementSystem as MeasurementSystem
        token.isEmailVerified = user.isEmailVerified ?? false
      }
      // Called via useSession().update() after a successful OTP verification.
      if (trigger === "update") {
        token.isEmailVerified = true
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
      }
      return session
    },
  },
} satisfies NextAuthConfig
