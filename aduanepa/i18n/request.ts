import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"

export const SUPPORTED_LOCALES = ["en", "tw", "gaa"] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "en"

function isValidLocale(value: string | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale)
}

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const raw = cookieStore.get("NEXT_LOCALE")?.value
  const locale: Locale = isValidLocale(raw) ? raw : DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
