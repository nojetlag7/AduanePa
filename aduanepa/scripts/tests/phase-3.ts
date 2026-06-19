import type { Tester } from "./harness"
import { fileContains, fileExists } from "./util"

export const meta = { phase: 3, title: "App Shell & Layout", implemented: true }

export async function run(t: Tester) {
  t.section("Shell components")
  t.check("app-shell present", fileExists("components/shared/app-shell.tsx"))
  t.check("sidebar present", fileExists("components/shared/sidebar.tsx"))
  t.check("app-header present", fileExists("components/shared/app-header.tsx"))
  t.check("brand-logo present", fileExists("components/shared/brand-logo.tsx"))
  t.check("theme-toggle present", fileExists("components/shared/theme-toggle.tsx"))

  t.section("Shared utilities")
  t.check("empty-state present", fileExists("components/shared/empty-state.tsx"))
  t.check("page-header present", fileExists("components/shared/page-header.tsx"))
  t.check("protected loading UI", fileExists("app/(app)/loading.tsx"))
  t.check("protected error boundary", fileExists("app/(app)/error.tsx"))

  t.section("Navigation")
  const navItems = ["/dashboard", "/meals", "/make-me-a-meal", "/health", "/nutrition", "/grocery", "/settings"]
  for (const href of navItems) {
    t.check(`nav link: ${href}`, fileContains("components/shared/sidebar.tsx", `"${href}"`))
  }

  t.section("Landing page")
  t.check("public landing page present", fileExists("app/page.tsx"))
}
