import { readdirSync } from "node:fs"
import { relative, resolve } from "node:path"
import { IngredientsSchema, InstructionsSchema } from "@/types"
import type { Tester } from "./harness"
import { ROOT, fileContains, fileExists, readText } from "./util"

export const meta = {
  phase: 14,
  title: "Hardening, Accessibility & Final QA",
  implemented: true,
}

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next") continue
    const full = resolve(dir, entry.name)
    if (entry.isDirectory()) walkTsFiles(full, out)
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full)
  }
  return out
}

function collectSourceFiles(): string[] {
  const files: string[] = []
  for (const root of ["app", "components", "lib", "hooks"]) {
    const abs = resolve(ROOT, root)
    try {
      walkTsFiles(abs, files)
    } catch {
      // skip missing roots
    }
  }
  return files.map((f) => relative(ROOT, f).replace(/\\/g, "/"))
}

export async function run(t: Tester) {
  t.section("Error boundary & loading UX")
  t.check("app error boundary", fileExists("app/(app)/error.tsx"), { critical: true })
  t.check(
    "error boundary exposes alert semantics",
    fileContains("app/(app)/error.tsx", 'role="alert"'),
    { weight: 2 }
  )
  t.check("app loading shell", fileExists("app/(app)/loading.tsx"))
  t.check("dashboard loading", fileExists("app/(app)/(main)/dashboard/loading.tsx"), {
    critical: true,
  })
  t.check("meals loading", fileExists("app/(app)/(main)/meals/loading.tsx"), { critical: true })
  t.check("meal detail loading", fileExists("app/(app)/(main)/meals/[id]/loading.tsx"), {
    critical: true,
  })
  t.check("health loading", fileExists("app/(app)/(main)/health/loading.tsx"), { critical: true })
  t.check("health log loading", fileExists("app/(app)/(main)/health/log/loading.tsx"), {
    critical: true,
  })
  t.check("nutrition loading", fileExists("app/(app)/(main)/nutrition/loading.tsx"))
  t.check("grocery loading", fileExists("app/(app)/(main)/grocery/loading.tsx"))
  t.check("settings loading", fileExists("app/(app)/(main)/settings/loading.tsx"))

  t.section("Accessibility foundations")
  t.check(
    "globals.css focus-visible ring",
    fileContains("app/globals.css", ":focus-visible"),
    { critical: true }
  )
  t.check(
    "globals.css prefers-reduced-motion",
    fileContains("app/globals.css", "prefers-reduced-motion"),
    { critical: true, weight: 2 }
  )
  t.check(
    "sidebar collapsed links use aria-label",
    fileContains("components/shared/sidebar.tsx", "aria-label={collapsed ? label"),
    { weight: 2 }
  )
  t.check(
    "language settings radiogroup",
    fileContains("components/settings/language-settings.tsx", 'role="radiogroup"')
  )
  t.check(
    "appearance settings radiogroup",
    fileContains("components/settings/appearance-settings.tsx", 'role="radiogroup"')
  )

  t.section("Form validation UX")
  t.check(
    "health profile uses Zod + fieldErrors",
    fileContains("components/settings/health-profile-settings.tsx", "healthProfileSettingsSchema") &&
      fileContains("components/settings/health-profile-settings.tsx", "fieldErrors"),
    { weight: 2, critical: true }
  )
  t.check(
    "ingredient input surfaces empty-list error",
    fileContains("components/make-me-a-meal/ingredient-input.tsx", "Add at least one ingredient"),
    { weight: 2 }
  )
  t.check(
    "profile settings inline field errors",
    fileContains("components/settings/profile-settings.tsx", "errors.name")
  )

  t.section("Empty / edge states")
  t.check(
    "meals empty state has GeneratePlanButton",
    fileContains("app/(app)/(main)/meals/page.tsx", "GeneratePlanButton"),
    { critical: true, weight: 2 }
  )
  t.check(
    "grocery empty state has GeneratePlanButton",
    fileContains("components/grocery/grocery-list.tsx", "GeneratePlanButton") &&
      fileContains("components/grocery/grocery-list.tsx", "EmptyState"),
    { critical: true, weight: 2 }
  )
  t.check(
    "health empty state CTA",
    fileContains("app/(app)/(main)/health/page.tsx", "/health/log")
  )
  t.check(
    "recommendations insufficient-data message",
    fileContains("components/dashboard/recommendations-panel.tsx", "enoughData") ||
      fileContains("components/dashboard/recommendations-panel.tsx", "minDays")
  )
  t.check(
    "make-me-a-meal no-meal-state component",
    fileExists("components/make-me-a-meal/no-meal-state.tsx"),
    { critical: true }
  )

  t.section("No alert/confirm dialogs")
  const sources = collectSourceFiles()
  const alertHits = sources.filter((rel) => {
    const text = readText(rel)
    return /\balert\s*\(/.test(text) || /\bconfirm\s*\(/.test(text)
  })
  t.check("no alert() or confirm() in app/components/lib/hooks", alertHits.length === 0, {
    critical: true,
    weight: 3,
    detail: alertHits.length ? alertHits.slice(0, 5).join(", ") : undefined,
  })

  t.section("Secrets stay server-only")
  t.check("gemini is server-only", fileContains("lib/gemini.ts", "server-only"), {
    critical: true,
    weight: 2,
  })
  t.check("translate is server-only", fileContains("lib/translate.ts", "server-only"), {
    critical: true,
    weight: 2,
  })
  const clientLeak = sources
    .filter((rel) => rel.startsWith("components/") || rel.startsWith("hooks/"))
    .filter((rel) => {
      const text = readText(rel)
      return (
        text.includes("GEMINI_API_KEY") ||
        text.includes("PRIMARY_TRANSLATION_API_KEY") ||
        text.includes("SECONDARY_TRANSLATION_API_KEY") ||
        text.includes("FIREBASE_PRIVATE_KEY")
      )
    })
  t.check("no API secrets referenced in client components/hooks", clientLeak.length === 0, {
    critical: true,
    weight: 3,
    detail: clientLeak.join(", ") || undefined,
  })

  t.section("No explicit any in app/components/lib")
  const anyHits = sources
    .filter((rel) => /^(app|components|lib)\//.test(rel))
    .filter((rel) => {
      const text = readText(rel)
      return /(?::\s*any\b|\bas any\b)/.test(text)
    })
  t.check("no `: any` or `as any` in app/components/lib", anyHits.length === 0, {
    weight: 2,
    detail: anyHits.slice(0, 5).join(", ") || undefined,
  })

  t.section("Meal Json validated at service boundary")
  t.check(
    "sanitizeMealJson used in meals service",
    fileContains("lib/services/meals.ts", "sanitizeMealJson"),
    { critical: true, weight: 2 }
  )
  t.check(
    "parseMealInstructions exported",
    fileContains("lib/meal-utils.ts", "parseMealInstructions")
  )
  t.check(
    "IngredientsSchema rejects invalid payload",
    !IngredientsSchema.safeParse([{ name: "", amount: -1, unit: "" }]).success
  )
  t.check(
    "InstructionsSchema accepts string steps",
    InstructionsSchema.safeParse(["Chop onions", "Simmer 10 min"]).success,
    { critical: true }
  )
  t.check(
    "InstructionsSchema rejects empty step",
    !InstructionsSchema.safeParse([""]).success
  )

  t.section("userId scoping in services (spot checks)")
  t.check(
    "getMealById scopes via mealPlan.userId",
    fileContains("lib/services/meals.ts", "mealPlan: { userId }"),
    { critical: true }
  )
  t.check(
    "deleteSavedMeal scopes by userId",
    fileContains("lib/services/meals.ts", "id: savedMealId, userId")
  )
  t.check(
    "device token helpers scoped",
    fileContains("lib/services/notifications.ts", "userId") &&
      fileExists("lib/services/notifications.ts")
  )
}
