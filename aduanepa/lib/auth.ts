import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/lib/auth.config"
import { prisma } from "@/lib/db"
import { isProfileComplete } from "@/lib/profile"
import { loginSchema } from "@/lib/validations/auth"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
