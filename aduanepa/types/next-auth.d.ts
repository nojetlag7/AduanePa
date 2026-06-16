import type { LanguagePreference, MeasurementSystem, ThemePreference } from "@prisma/client"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id?: string
    language?: LanguagePreference
    theme?: ThemePreference
    measurementSystem?: MeasurementSystem
    isEmailVerified?: boolean
    isProfileComplete?: boolean
  }

  interface Session {
    user: {
      id: string
      language: LanguagePreference
      theme: ThemePreference
      measurementSystem: MeasurementSystem
      isEmailVerified: boolean
      isProfileComplete: boolean
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    language: LanguagePreference
    theme: ThemePreference
    measurementSystem: MeasurementSystem
    isEmailVerified: boolean
    isProfileComplete: boolean
  }
}
