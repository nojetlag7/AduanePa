import type {
  LanguagePreference,
  MeasurementSystem,
  ThemePreference,
} from "@prisma/client"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/db"
import { isProfileComplete } from "@/lib/profile"
import { loginSchema } from "@/lib/validations/auth"
import { readSessionPatch } from "@/lib/session-patch"

const USER_JWT_SELECT = {
  id: true,
  emailVerified: true,
  dateOfBirth: true,
  weight: true,
  height: true,
  language: true,
  theme: true,
  measurementSystem: true,
  privacyPolicyAcceptedAt: true,
} as const

function applyDbUserToToken(
  token: Record<string, unknown>,
  dbUser: {
    id: string
    emailVerified: boolean
    dateOfBirth: Date | null
    weight: number | null
    height: number | null
    language: LanguagePreference
    theme: ThemePreference
    measurementSystem: MeasurementSystem
    privacyPolicyAcceptedAt: Date | null
  }
) {
  token.id = dbUser.id
  token.language = dbUser.language
  token.theme = dbUser.theme
  token.measurementSystem = dbUser.measurementSystem
  token.isEmailVerified = dbUser.emailVerified
  token.isProfileComplete = isProfileComplete(dbUser)
}

export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      allowDangerousEmailAccountLinking: true,
    }),
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
        if (!user.password) return null

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
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, user }) {
      if (account?.provider === "google" && user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true, emailVerifiedAt: new Date() },
        })
      }
      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: USER_JWT_SELECT,
        })
        if (dbUser) {
          applyDbUserToToken(token, dbUser)
          if (account?.provider === "google") {
            token.isEmailVerified = true
          }
        }
      }

      if (trigger === "update") {
        const patch = readSessionPatch(session)

        if (patch.isEmailVerified !== undefined) {
          token.isEmailVerified = patch.isEmailVerified
        }
        if (patch.isProfileComplete !== undefined) {
          token.isProfileComplete = patch.isProfileComplete
        }
        if (patch.language !== undefined) {
          token.language = patch.language
        }

        // After verification or profile saves, trust the database over stale JWT claims.
        if (token.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: USER_JWT_SELECT,
          })
          if (dbUser) {
            token.isEmailVerified = dbUser.emailVerified
            token.isProfileComplete = isProfileComplete(dbUser)
            if (patch.language === undefined) {
              token.language = dbUser.language
            }
          }
        }
      }

      return token
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return
      // Google confirms email ownership; skip OTP for OAuth sign-ups.
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifiedAt: new Date() },
      })
    },
  },
})
