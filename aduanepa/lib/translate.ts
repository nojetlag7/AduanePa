import "server-only"
import type { LanguagePreference } from "@prisma/client"

// ─── Config ─────────────────────────────────────────────────────────────────

const PRIMARY_KEY = process.env.PRIMARY_TRANSLATION_API_KEY
const SECONDARY_KEY = process.env.SECONDARY_TRANSLATION_API_KEY
const BASE_URL = "https://translation-api.ghananlp.org/v1/translate"

/**
 * Maps LanguagePreference enum values to Khaya API language-pair codes.
 * Only Twi and Ga require runtime translation; English is a no-op.
 */
export const LANG_CODE: Partial<Record<LanguagePreference, string>> = {
  TWI: "en-tw",
  GA: "en-gaa",
}

// ─── Core HTTP helper ────────────────────────────────────────────────────────

async function callApi(
  text: string,
  lang: string,
  apiKey: string
): Promise<string | null> {
  try {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Ocp-Apim-Subscription-Key": apiKey,
      },
      body: JSON.stringify({ in: text, lang }),
      // Abort after 5 seconds — translation is post-processing, not critical path
      signal: AbortSignal.timeout(5000),
    })

    if (!res.ok) return null
    // Response is a plain string, NOT JSON
    return await res.text()
  } catch {
    return null
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Translate a single text string.
 *
 * Tries the primary key first; falls back to secondary on any failure.
 * Returns the original English text if both keys fail — never throws.
 */
export async function translateText(text: string, lang: string): Promise<string> {
  if (!text?.trim()) return text
  if (!PRIMARY_KEY && !SECONDARY_KEY) return text

  let result = PRIMARY_KEY ? await callApi(text, lang, PRIMARY_KEY) : null
  if (!result && SECONDARY_KEY) result = await callApi(text, lang, SECONDARY_KEY)

  // Strip surrounding quotes that the API sometimes adds
  if (result) result = result.replace(/^["']|["']$/g, "").trim()

  return result || text
}

/**
 * Translate the `name` and `description` fields of a meal object.
 * All other fields (ingredients, instructions, macros) are left untouched.
 *
 * Safe to call with ENGLISH — returns the meal unchanged immediately.
 */
export async function translateMeal<T extends { name: string; description?: string | null }>(
  meal: T,
  language: LanguagePreference
): Promise<T> {
  const langCode = LANG_CODE[language]
  if (!langCode) return meal

  const [name, description] = await Promise.all([
    translateText(meal.name, langCode),
    meal.description ? translateText(meal.description, langCode) : Promise.resolve(meal.description),
  ])

  return { ...meal, name, description }
}

/**
 * Translate all meals in an array concurrently.
 * Safe to call with ENGLISH — returns the array unchanged immediately.
 */
export async function translateMeals<T extends { name: string; description?: string | null }>(
  meals: T[],
  language: LanguagePreference
): Promise<T[]> {
  const langCode = LANG_CODE[language]
  if (!langCode) return meals

  return Promise.all(meals.map((m) => translateMeal(m, language)))
}
