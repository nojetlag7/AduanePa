import type { LanguagePreference } from "@prisma/client"
import type { Locale } from "@/i18n/request"

/**
 * Maps a LanguagePreference enum value to the next-intl locale code used in
 * the NEXT_LOCALE cookie and message catalogs.
 */
export function languageToLocale(language: LanguagePreference): Locale {
  switch (language) {
    case "TWI":
      return "tw"
    case "GA":
      return "gaa"
    default:
      return "en"
  }
}

/** Cookie name — must match the string used in i18n/request.ts */
export const LOCALE_COOKIE = "NEXT_LOCALE"
