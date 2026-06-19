import type { Tester } from "./harness"
import { fileContains, fileExists, readJson } from "./util"

export const meta = { phase: 0, title: "Project Scaffold & Tooling", implemented: true }

export async function run(t: Tester) {
  t.section("Tooling config")
  t.test(
    "tsconfig has strict mode",
    () => readJson<{ compilerOptions?: { strict?: boolean } }>("tsconfig.json").compilerOptions?.strict === true,
    { critical: true }
  )
  t.check(".prettierrc present", fileExists(".prettierrc"))
  t.check("eslint config present", fileExists("eslint.config.mjs") || fileExists(".eslintrc.json"))
  t.check("next.config present", fileExists("next.config.ts"))

  t.section("Design tokens")
  t.check("globals.css defines brand primary token", fileContains("app/globals.css", "--color-primary"))
  t.check("globals.css defines dark mode block", fileContains("app/globals.css", ".dark"))
  t.check(
    "prefers-reduced-motion respected",
    fileContains("app/globals.css", "prefers-reduced-motion")
  )

  t.section("Dependencies")
  const pkg = readJson<{ dependencies?: Record<string, string> }>("package.json")
  const deps = pkg.dependencies ?? {}
  for (const dep of [
    "next",
    "next-auth",
    "@prisma/client",
    "zod",
    "recharts",
    "@google/genai",
    "next-themes",
  ]) {
    t.check(`dependency: ${dep}`, dep in deps)
  }

  t.section("PWA bootstrap")
  t.check("manifest.json present", fileExists("public/manifest.json"), { weight: 2 })
  t.check(
    "manifest has theme_color",
    fileContains("public/manifest.json", "theme_color")
  )
  t.check("offline fallback page present", fileExists("app/offline/page.tsx"))
}
