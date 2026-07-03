import type { Tester } from "./harness"
import { fileExists, getTestUser } from "./util"

export const meta = { phase: 4, title: "Onboarding Flow", implemented: true }

export async function run(t: Tester) {
  t.section("Onboarding files")
  t.check("onboarding page present", fileExists("app/(app)/onboarding/page.tsx"))
  t.check("profile completeness helper present", fileExists("lib/profile.ts"))
  t.check("users service present", fileExists("lib/services/users.ts"))
  t.check("onboarding validations present", fileExists("lib/validations/onboarding.ts"))
  t.check("profile API route present", fileExists("app/api/users/profile/route.ts"))

  t.section("isProfileComplete logic")
  const { isProfileComplete } = await import("@/lib/profile")
  t.check(
    "complete profile → true",
    isProfileComplete({
      dateOfBirth: new Date("1998-01-01"),
      weight: 70,
      height: 175,
      privacyPolicyAcceptedAt: new Date(),
    }) === true,
    { weight: 2 }
  )
  t.check(
    "missing privacy consent → false",
    isProfileComplete({
      dateOfBirth: new Date("1998-01-01"),
      weight: 70,
      height: 175,
      privacyPolicyAcceptedAt: null,
    }) === false,
    { weight: 2 }
  )
  t.check(
    "missing weight → false",
    isProfileComplete({
      dateOfBirth: new Date("1998-01-01"),
      weight: null,
      height: 175,
      privacyPolicyAcceptedAt: new Date(),
    }) === false,
    { weight: 2 }
  )
  t.check(
    "all null → false",
    isProfileComplete({
      dateOfBirth: null,
      weight: null,
      height: null,
      privacyPolicyAcceptedAt: null,
    }) === false
  )

  t.section("Test user profile (DB)")
  const user = await getTestUser()
  if (!user) {
    t.check("test user present for profile check", false, {
      detail: "register/seed test user to verify onboarding completion",
    })
    return
  }
  t.check(
    "test user has completed onboarding",
    isProfileComplete(user),
    { weight: 2, detail: "run onboarding for the test user if this fails" }
  )
}
