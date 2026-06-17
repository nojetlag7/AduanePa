import type { LanguagePreference } from "@prisma/client"

export type SessionPatch = {
  isEmailVerified?: boolean
  isProfileComplete?: boolean
  language?: LanguagePreference
}

/** Read nested or flat fields from an Auth.js session update payload. */
export function readSessionPatch(session: unknown): SessionPatch {
  const data = session as (SessionPatch & { user?: SessionPatch }) | null
  return {
    isEmailVerified: data?.isEmailVerified ?? data?.user?.isEmailVerified,
    isProfileComplete: data?.isProfileComplete ?? data?.user?.isProfileComplete,
    language: data?.language ?? data?.user?.language,
  }
}
