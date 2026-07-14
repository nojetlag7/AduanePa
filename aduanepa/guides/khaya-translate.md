# Khaya AI Translation API — Integration Guide

This document is the integration reference for the Ghana NLP / Khaya AI translation service
used in AduanePa to translate AI-generated meal names and descriptions into Twi and Ga.

> **Relevant phase:** Phase 13 — PWA & Localisation (section 13.3)
> **Where used:** `lib/translate.ts` — called post-Gemini response when `user.language` is `TWI` or `GA`
> **Do NOT call for static UI strings** — those are handled by `next-intl` message catalogs.

---

## Provider

| Property | Value |
|----------|-------|
| Service name | Khaya AI (Ghana NLP) |
| Developer portal | https://translation.ghananlp.org |
| API host | `https://translation-api.ghananlp.org` |
| Managed via | Azure API Management |
| Authentication | Subscription key in request header |
| Protocol | REST (JSON over HTTPS) |

---

## Authentication

Pass your subscription key in every request header:

```
Ocp-Apim-Subscription-Key: <your_api_key>
```

AduanePa has **two keys** in `.env.local` for primary/fallback use:

```env
PRIMARY_TRANSLATION_API_KEY=e855...   # primary
SECONDARY_TRANSLATION_API_KEY=14fa...  # fallback on 429/5xx
```

> Both keys are **server-only** — never set as `NEXT_PUBLIC_*`. Enforced by `server-only`
> import in `lib/translate.ts`.

---

## Text Translation Endpoint

### `POST /v1/translate`

Translates a single piece of text from a source language to a target language.

**Request**

```http
POST https://translation-api.ghananlp.org/v1/translate
Content-Type: application/json
Cache-Control: no-cache
Ocp-Apim-Subscription-Key: <api_key>

{
  "in": "Grilled tilapia with kontomire stew",
  "lang": "en-tw"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `in` | `string` | Text to translate (source language) |
| `lang` | `string` | Language pair code (see table below) |

**Response (200)**

Returns the translated string directly (not wrapped in an object):

```
"Tilapia a wɔpono no ne kontomire nkwan"
```

> The response is a **plain string**, not `{ "text": "..." }`. Parse with `response.text()`,
> not `response.json()`.

**Error Response**

```json
{
  "type": "Unauthorized",
  "message": "Access denied due to invalid subscription key. ..."
}
```

| Status | Meaning |
|--------|---------|
| 200 | Success — body is the translated string |
| 400 | Bad request — malformed body or unsupported language pair |
| 401 | Invalid or missing subscription key |
| 429 | Rate limit exceeded — switch to secondary key and retry |
| 5xx | Server error — retry with secondary key |

---

## Supported Language Codes (AduanePa-relevant)

| Pair | Direction | Code |
|------|-----------|------|
| English → Twi | en → tw | `en-tw` |
| English → Ga | en → Ga | `en-gaa` |
| Twi → English | tw → en | `tw-en` |
| Ga → English | gaa → en | `gaa-en` |

Additional languages (not needed for MVP): `en-ee` (Ewe), `en-fat` (Fante), `en-dag` (Dagbani), `en-ki` (Kikuyu).

---

## AduanePa Integration Contract

### Where translation is applied

Translation runs **post-Gemini** — after the AI responds and the response passes Zod validation.
Only these fields are translated:

| Field | Component |
|-------|-----------|
| `meal.name` | Meal card title, meal detail page |
| `meal.description` | Meal card subtitle, detail page |

Fields that are **NOT translated:**
- `meal.instructions` — procedural; translation quality unreliable for step-by-step text
- `meal.ingredients[].name` — DB-sourced; translated names would break nutrition lookup
- Macro values, prep time, badges — numeric/enum, not language-dependent
- All static UI strings — handled by `next-intl` catalogs

### Architecture (`lib/translate.ts`)

```ts
import "server-only"

const PRIMARY_KEY = process.env.PRIMARY_TRANSLATION_API_KEY!
const SECONDARY_KEY = process.env.SECONDARY_TRANSLATION_API_KEY!
const BASE = "https://translation-api.ghananlp.org/v1/translate"

// Maps LanguagePreference enum to Khaya API lang code
export const LANG_CODE: Record<string, string> = {
  TWI: "en-tw",
  GA:  "en-gaa",
}

/**
 * Translate a single text string using primary key, falling back to secondary
 * on 429 or 5xx. Returns the original text on any unrecoverable error so the
 * UI degrades gracefully rather than crashing.
 */
export async function translateText(text: string, langCode: string): Promise<string> { ... }

/**
 * Translate only the name and description of a meal object.
 * Safe to call when language === "ENGLISH" — returns meal unchanged.
 */
export async function translateMeal(meal: MealOutput, language: LanguagePreference): Promise<MealOutput> { ... }

/**
 * Translate all meals in an array concurrently (Promise.all).
 */
export async function translateMeals(meals: MealOutput[], language: LanguagePreference): Promise<MealOutput[]> { ... }
```

### Calling convention in API routes

```ts
// After Gemini response is parsed and validated:
const language = session.user.language  // "ENGLISH" | "TWI" | "GA"
const translatedMeals = await translateMeals(meals, language)
// Use translatedMeals in the DB save and response
```

**Never call `translateText` from a client component** — it reads server-only env vars.

---

## Rate Limiting & Retry Strategy

- The API is managed via Azure API Management; exact rate limits are not publicly documented.
- Use the **primary key** for all requests.
- On `429` (Too Many Requests) or any `5xx`, **immediately retry once** using the **secondary key**.
- If the secondary key also fails, return the **original English text** — never crash the request.
- Do not implement exponential backoff for individual requests; translation is a post-processing step
  on a user-initiated action and should complete in < 500 ms.

```ts
async function callApi(text: string, lang: string, key: string): Promise<string | null> {
  const res = await fetch(BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
      "Ocp-Apim-Subscription-Key": key,
    },
    body: JSON.stringify({ in: text, lang }),
  })
  if (!res.ok) return null
  return res.text()   // ← response is plain text, not JSON
}

export async function translateText(text: string, lang: string): Promise<string> {
  let result = await callApi(text, lang, PRIMARY_KEY)
  if (!result) result = await callApi(text, lang, SECONDARY_KEY)
  return result ?? text   // graceful English fallback
}
```

---

## Glossary / Quality Notes

- **Twi** (Akan dialect, also called Asante Twi) — language code `tw`; Khaya AI outperforms
  Google Translate for this language according to published BLEU score comparisons.
- **Ga** — language code `gaa` (three letters, not two); do not confuse with `ga` (unrelated).
- The AI system prompt stays in **English** for reliability. Translation is applied to output fields
  only — this is the "post-response" pattern described in `checklist.md` Phase 13 notes.
- Meal names generated by Gemini are already Ghanaian (e.g. "Grilled Tilapia with Kontomire Stew")
  which improves Khaya translation quality since it has strong coverage for Ghanaian food vocabulary.

---

## Testing

To verify the API keys work, run a quick cURL from your terminal (substitute your key):

```bash
curl -X POST https://translation-api.ghananlp.org/v1/translate \
  -H "Content-Type: application/json" \
  -H "Cache-Control: no-cache" \
  -H "Ocp-Apim-Subscription-Key: <your_api_key>" \
  -d '{"in": "Grilled tilapia", "lang": "en-tw"}'
```

Expected response: a plain string like `"Tilapia a wɔpono no"` (no JSON wrapper).

In Phase 13, add a smoke-test in `scripts/tests/phase-13.ts` that calls `translateText("Hello", "en-tw")`
and asserts the result is a non-empty string different from "Hello".

---

## Related files

| File | Role |
|------|------|
| `lib/translate.ts` | Translation wrapper (created in Phase 13) |
| `app/api/meals/generate/route.ts` | Calls `translateMeals` post-Gemini |
| `app/api/meals/make-me-a-meal/route.ts` | Same pattern |
| `guides/checklist.md` Phase 13 | Full localisation task list |
| `.env.local` | `PRIMARY_TRANSLATION_API_KEY`, `SECONDARY_TRANSLATION_API_KEY` |
