import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import type { User } from "@prisma/client"

/** Project root (the `aduanepa` folder) — scripts run from there. */
export const ROOT = process.cwd()

export function fileExists(relPath: string): boolean {
  return existsSync(resolve(ROOT, relPath))
}

export function readText(relPath: string): string {
  return readFileSync(resolve(ROOT, relPath), "utf8")
}

export function fileContains(relPath: string, needle: string | RegExp): boolean {
  if (!fileExists(relPath)) return false
  const text = readText(relPath)
  return typeof needle === "string" ? text.includes(needle) : needle.test(text)
}

export function readJson<T = unknown>(relPath: string): T {
  return JSON.parse(readText(relPath)) as T
}

// ─── Test user ──────────────────────────────────────────────────────────────
// Shared seeded account used by DB-dependent phase checks. Override via env.

export const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? "boatengjo9@gmail.com"
export const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? "Test123!"

/**
 * Loads the shared test user from the DB. Returns null when the DB is
 * unreachable or the user has not been registered yet — callers decide how to
 * score that. Prisma is imported lazily so env is loaded first by the runner.
 */
export async function getTestUser(): Promise<User | null> {
  try {
    const { prisma } = await import("@/lib/db")
    return await prisma.user.findUnique({ where: { email: TEST_USER_EMAIL } })
  } catch {
    return null
  }
}
