import type { Tester } from "./harness"
import { fileExists } from "./util"

export const meta = {
  phase: 13,
  title: "PWA & Localisation",
  implemented: true,
}

export async function run(t: Tester) {
  t.section("Files")
  t.check("i18n/request.ts", fileExists("i18n/request.ts"), { critical: true })
  t.check("messages/en.json", fileExists("messages/en.json"), { critical: true })
  t.check("messages/tw.json", fileExists("messages/tw.json"), { critical: true })
  t.check("messages/gaa.json", fileExists("messages/gaa.json"), { critical: true })
  t.check("lib/translate.ts", fileExists("lib/translate.ts"), { critical: true })
  t.check("lib/locale.ts", fileExists("lib/locale.ts"))
  t.check("lib/rate-limit.ts", fileExists("lib/rate-limit.ts"))
  t.check("public/manifest.json", fileExists("public/manifest.json"), { critical: true })

  t.section("Message catalogs — structure")
  const en = (await import("../../messages/en.json")).default as Record<string, unknown>
  const tw = (await import("../../messages/tw.json")).default as Record<string, unknown>
  const gaa = (await import("../../messages/gaa.json")).default as Record<string, unknown>

  const topLevelKeys = ["nav", "common", "meals", "health", "dashboard", "settings", "auth", "landing"]
  for (const key of topLevelKeys) {
    t.check(`en.json has "${key}" namespace`, key in en)
    t.check(`tw.json has "${key}" namespace`, key in tw)
    t.check(`gaa.json has "${key}" namespace`, key in gaa)
  }

  const enNav = (en.nav ?? {}) as Record<string, string>
  const twNav = (tw.nav ?? {}) as Record<string, string>
  const navKeys = ["dashboard", "meals", "health", "settings", "signOut"]
  for (const k of navKeys) {
    t.check(`nav.${k} translated in en`, typeof enNav[k] === "string" && enNav[k].length > 0)
    t.check(`nav.${k} translated in tw`, typeof twNav[k] === "string" && twNav[k].length > 0, {
      weight: 2,
    })
  }

  // tw translations must differ from en for key strings (proving they aren't just English copies)
  const enDash = (en.nav as Record<string, string>).dashboard ?? ""
  const twDash = (tw.nav as Record<string, string>).dashboard ?? ""
  t.check("Twi nav.dashboard differs from English", enDash !== twDash, {
    weight: 2,
    critical: true,
    detail: `en="${enDash}" tw="${twDash}"`,
  })

  const enWelcome = ((en.dashboard as Record<string, string>) ?? {}).welcome ?? ""
  const twWelcome = ((tw.dashboard as Record<string, string>) ?? {}).welcome ?? ""
  t.check("Twi dashboard.welcome differs from English", enWelcome !== twWelcome, { weight: 2 })

  t.section("Locale mapping (lib/locale.ts)")
  const { languageToLocale, LOCALE_COOKIE } = await import("@/lib/locale")
  t.check("ENGLISH → en", languageToLocale("ENGLISH") === "en", { critical: true })
  t.check("TWI → tw", languageToLocale("TWI") === "tw", { critical: true })
  t.check("GA → gaa", languageToLocale("GA") === "gaa", { critical: true })
  t.check("LOCALE_COOKIE is 'NEXT_LOCALE'", LOCALE_COOKIE === "NEXT_LOCALE")

  t.section("Rate limiter (lib/rate-limit.ts)")
  const { rateLimit, getClientIp } = await import("@/lib/rate-limit")
  const key = `test:${Date.now()}`
  const r1 = rateLimit(key, { limit: 2, windowMs: 60_000 })
  const r2 = rateLimit(key, { limit: 2, windowMs: 60_000 })
  const r3 = rateLimit(key, { limit: 2, windowMs: 60_000 })
  t.check("first request succeeds", r1.success, { critical: true })
  t.check("second request within limit succeeds", r2.success)
  t.check("third request over limit fails", !r3.success, { critical: true, weight: 2 })
  t.check("remaining decrements", r2.remaining < r1.remaining)

  const mockReq = { headers: new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }) } as Request
  t.check("getClientIp reads first x-forwarded-for IP", getClientIp(mockReq) === "1.2.3.4")

  t.section("Translation module (lib/translate.ts)")
  // translate.ts uses 'server-only' so it cannot be imported by tsx.
  // Verify correct contract by inspecting the source file.
  const fs2 = await import("node:fs")
  const translateSrc = fs2.readFileSync("lib/translate.ts", "utf-8")
  t.check("translate.ts has 'server-only' import", translateSrc.includes("server-only"), {
    critical: true,
    weight: 2,
    detail: "Ensures translation keys never leak to the client bundle",
  })
  t.check("LANG_CODE has TWI → en-tw", translateSrc.includes('"en-tw"'), { critical: true })
  t.check("LANG_CODE has GA → en-gaa", translateSrc.includes('"en-gaa"'), { critical: true })
  t.check("translateMeal is exported", translateSrc.includes("export async function translateMeal"))
  t.check("translateMeals is exported", translateSrc.includes("export async function translateMeals"))
  t.check("translateText is exported", translateSrc.includes("export async function translateText"))
  t.check("uses PRIMARY_TRANSLATION_API_KEY env var", translateSrc.includes("PRIMARY_TRANSLATION_API_KEY"), {
    weight: 2,
  })
  t.check("uses SECONDARY_TRANSLATION_API_KEY fallback", translateSrc.includes("SECONDARY_TRANSLATION_API_KEY"), {
    weight: 2,
  })
  t.check("response parsed as text not JSON (plain-string API)", translateSrc.includes("res.text()"), {
    critical: true,
    weight: 2,
  })
  t.check("English no-op: LANG_CODE[language] is undefined guard", translateSrc.includes("if (!langCode) return"))

  t.section("PWA manifest")
  const manifest = (await import("../../public/manifest.json")).default as Record<string, unknown>
  t.check("manifest has id field", "id" in manifest, { weight: 2 })
  t.check("manifest has name", manifest.name === "AduanePa", { critical: true })
  t.check("manifest has start_url", typeof manifest.start_url === "string")
  t.check("manifest has display: standalone", manifest.display === "standalone", { weight: 2 })
  t.check("manifest has theme_color", typeof manifest.theme_color === "string")
  t.check("manifest has icons array", Array.isArray(manifest.icons) && (manifest.icons as unknown[]).length >= 2, {
    critical: true,
  })
  t.check(
    "manifest has shortcuts",
    Array.isArray(manifest.shortcuts) && (manifest.shortcuts as unknown[]).length > 0
  )

  t.section("Security — next.config.ts")
  t.check("next.config.ts exists", fileExists("next.config.ts"), { critical: true })
  const fs = await import("node:fs")
  const configContent = fs.readFileSync("next.config.ts", "utf-8")
  t.check("config has X-Content-Type-Options header", configContent.includes("X-Content-Type-Options"), {
    weight: 2,
    critical: true,
  })
  t.check("config has X-Frame-Options header", configContent.includes("X-Frame-Options"), { weight: 2 })
  t.check("config has Strict-Transport-Security header", configContent.includes("Strict-Transport-Security"), { weight: 2 })
  t.check("config has Permissions-Policy header", configContent.includes("Permissions-Policy"))
  t.check("config has next-intl plugin", configContent.includes("createNextIntlPlugin"), {
    critical: true,
    weight: 2,
  })
  t.check("config has removeConsole in production", configContent.includes("removeConsole"))
}
