import { DietaryGoal, HealthCondition, LanguagePreference } from "@prisma/client"
import {
  updateProfile,
  updateHealthProfile,
  updatePassword,
  updateLanguage,
  deleteAccount,
} from "@/lib/services/users"
import {
  profileSettingsSchema,
  healthProfileSettingsSchema,
  passwordSettingsSchema,
  languageSettingsSchema,
  deleteAccountSchema,
} from "@/lib/validations/settings"
import type { Tester } from "./harness"
import { fileExists, getTestUser } from "./util"

export const meta = {
  phase: 12,
  title: "Settings Page",
  implemented: true,
}

export async function run(t: Tester) {
  t.section("Files")
  t.check("settings page", fileExists("app/(app)/(main)/settings/page.tsx"))
  t.check("settings API route", fileExists("app/api/users/settings/route.ts"))
  t.check("health-profile API route", fileExists("app/api/users/health-profile/route.ts"))
  t.check("password API route", fileExists("app/api/users/password/route.ts"))
  t.check("language API route", fileExists("app/api/users/language/route.ts"))
  t.check("account delete API route", fileExists("app/api/users/account/route.ts"))
  t.check("settings validations", fileExists("lib/validations/settings.ts"))
  t.check("profile-settings component", fileExists("components/settings/profile-settings.tsx"))
  t.check("health-profile-settings component", fileExists("components/settings/health-profile-settings.tsx"))
  t.check("password-settings component", fileExists("components/settings/password-settings.tsx"))
  t.check("language-settings component", fileExists("components/settings/language-settings.tsx"))
  t.check("appearance-settings component", fileExists("components/settings/appearance-settings.tsx"))
  t.check("danger-zone component", fileExists("components/settings/danger-zone.tsx"))

  t.section("Validation — profileSettingsSchema")
  const validProfile = {
    name: "Test User",
    email: "test@example.com",
    dateOfBirth: "1990-01-01",
    weight: "70",
    height: "175",
  }
  t.check("accepts valid profile", profileSettingsSchema.safeParse(validProfile).success, {
    weight: 2,
    critical: true,
  })
  t.check(
    "rejects short name",
    !profileSettingsSchema.safeParse({ ...validProfile, name: "X" }).success
  )
  t.check(
    "rejects invalid email",
    !profileSettingsSchema.safeParse({ ...validProfile, email: "notanemail" }).success,
    { critical: true }
  )
  t.check(
    "rejects weight below 20",
    !profileSettingsSchema.safeParse({ ...validProfile, weight: "10" }).success
  )
  t.check(
    "rejects height above 250",
    !profileSettingsSchema.safeParse({ ...validProfile, height: "300" }).success
  )
  t.check(
    "rejects age below 10",
    !profileSettingsSchema.safeParse({ ...validProfile, dateOfBirth: "2020-01-01" }).success
  )

  t.section("Validation — healthProfileSettingsSchema")
  t.check(
    "accepts valid health profile",
    healthProfileSettingsSchema.safeParse({
      healthConditions: [HealthCondition.HYPERTENSION],
      dietaryGoal: DietaryGoal.WEIGHT_LOSS,
    }).success,
    { weight: 2, critical: true }
  )
  t.check(
    "empty conditions becomes [NONE]",
    (() => {
      const r = healthProfileSettingsSchema.safeParse({
        healthConditions: [],
        dietaryGoal: DietaryGoal.MAINTENANCE,
      })
      return r.success && r.data.healthConditions[0] === HealthCondition.NONE
    })(),
    { weight: 2 }
  )
  t.check(
    "rejects invalid dietaryGoal",
    !healthProfileSettingsSchema.safeParse({
      healthConditions: [],
      dietaryGoal: "INVALID",
    }).success
  )

  t.section("Validation — passwordSettingsSchema")
  const validPw = {
    currentPassword: "OldPass123",
    newPassword: "NewPass456",
    confirmNewPassword: "NewPass456",
  }
  t.check("accepts valid password change", passwordSettingsSchema.safeParse(validPw).success, {
    weight: 2,
    critical: true,
  })
  t.check(
    "rejects mismatched confirm",
    !passwordSettingsSchema.safeParse({ ...validPw, confirmNewPassword: "Different" }).success,
    { critical: true }
  )
  t.check(
    "rejects new == current",
    !passwordSettingsSchema.safeParse({
      ...validPw,
      newPassword: "OldPass123",
      confirmNewPassword: "OldPass123",
    }).success
  )
  t.check(
    "rejects short new password",
    !passwordSettingsSchema.safeParse({ ...validPw, newPassword: "short", confirmNewPassword: "short" }).success
  )

  t.section("Validation — languageSettingsSchema")
  t.check(
    "accepts ENGLISH",
    languageSettingsSchema.safeParse({ language: LanguagePreference.ENGLISH }).success,
    { weight: 2 }
  )
  t.check(
    "accepts TWI",
    languageSettingsSchema.safeParse({ language: LanguagePreference.TWI }).success
  )
  t.check(
    "accepts GA",
    languageSettingsSchema.safeParse({ language: LanguagePreference.GA }).success
  )
  t.check(
    "rejects unknown language",
    !languageSettingsSchema.safeParse({ language: "SPANISH" }).success,
    { critical: true }
  )

  t.section("Validation — deleteAccountSchema")
  t.check(
    "accepts non-empty password",
    deleteAccountSchema.safeParse({ password: "MyPassword" }).success,
    { weight: 2 }
  )
  t.check(
    "rejects empty password",
    !deleteAccountSchema.safeParse({ password: "" }).success,
    { critical: true }
  )

  t.section("Service functions — DB round-trip")
  const user = await getTestUser()
  if (!user) {
    t.check("services exercised against test user", false, {
      weight: 2,
      detail: "no test user — run npm run test:seed-user",
    })
    return
  }

  // updateHealthProfile
  const updated = await updateHealthProfile(user.id, {
    healthConditions: [HealthCondition.DIABETES],
    dietaryGoal: DietaryGoal.BLOOD_SUGAR_CONTROL,
  }).catch(() => null)
  t.check(
    "updateHealthProfile saves new conditions + goal",
    !!updated &&
      updated.healthConditions.includes(HealthCondition.DIABETES) &&
      updated.dietaryGoal === DietaryGoal.BLOOD_SUGAR_CONTROL,
    { weight: 2, critical: true }
  )

  // updateLanguage
  const lang = await updateLanguage(user.id, { language: LanguagePreference.TWI }).catch(() => null)
  t.check("updateLanguage saves TWI", lang === LanguagePreference.TWI, { weight: 2 })

  // restore language
  await updateLanguage(user.id, { language: LanguagePreference.ENGLISH }).catch(() => null)

  // restore health profile
  await updateHealthProfile(user.id, {
    healthConditions: [],
    dietaryGoal: DietaryGoal.MAINTENANCE,
  }).catch(() => null)

  // updatePassword — wrong current password
  const wrongPwErr = await updatePassword(user.id, "DEFINITELY_WRONG", "NewPass1234").catch(
    (e: Error) => e.message
  )
  t.check(
    "updatePassword throws WRONG_PASSWORD for bad current password",
    wrongPwErr === "WRONG_PASSWORD",
    { weight: 2, critical: true }
  )

  // updateProfile — duplicate email check
  const dupErr = await updateProfile(user.id, {
    name: "Test",
    email: user.email,
    dateOfBirth: user.dateOfBirth ?? new Date("1990-01-01"),
    weight: user.weight ?? 70,
    height: user.height ?? 175,
  }).catch((e: Error) => e.message)
  // same email is allowed if it belongs to this user — should succeed
  t.check(
    "updateProfile: same email for same user is allowed (no false EMAIL_TAKEN)",
    typeof dupErr !== "string" || dupErr !== "EMAIL_TAKEN",
    { weight: 2 }
  )
}
