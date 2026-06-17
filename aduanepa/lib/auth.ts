import type {
  LanguagePreference,
  MeasurementSystem,
  ThemePreference,
} from "@prisma/client"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/db"
import { isProfileComplete } from "@/lib/profile"
import { loginSchema } from "@/lib/validations/auth"

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
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
        }
        if (patch?.isProfileComplete !== undefined) {
          token.isProfileComplete = patch.isProfileComplete
        }
        if (patch?.language !== undefined) {
          token.language = patch.language
        }

        // After verification or profile saves, trust the database over stale JWT claims.
        if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              emailVerified: true,
              dateOfBirth: true,
              weight: true,
              height: true,
              language: true,
            },
          })
          if (dbUser) {
            token.isEmailVerified = dbUser.emailVerified
            token.isProfileComplete = isProfileComplete(dbUser)
            if (patch?.language === undefined) {
              token.language = dbUser.language
            }
          }
        }
      }

      return token
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) return null

        const passwordMatches = await bcrypt.compare(password, user.password)
        if (!passwordMatches) return null

        // Unverified users are still authenticated; middleware routes them to
        // /verify-email until their email is confirmed.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          language: user.language,
          theme: user.theme,
          measurementSystem: user.measurementSystem,
          isEmailVerified: user.emailVerified,
          isProfileComplete: isProfileComplete(user),
        }
      },
    }),
  ],
})
