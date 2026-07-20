import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import type { OnboardingParsed } from "@/lib/validations/onboarding"
import type {
  ProfileSettingsParsed,
  HealthProfileSettingsInput,
  LanguageSettingsInput,
} from "@/lib/validations/settings"
import type { LanguagePreference, UserProfile } from "@/types"

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  dateOfBirth: true,
  weight: true,
  height: true,
  healthConditions: true,
  dietaryGoal: true,
  language: true,
  theme: true,
  measurementSystem: true,
  notificationsEnabled: true,
} as const

export { isProfileComplete } from "@/lib/profile"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  })
}

export async function updateUserProfile(userId: string, data: OnboardingParsed) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      dateOfBirth: data.dateOfBirth,
      weight: data.weight,
      height: data.height,
      healthConditions: data.healthConditions,
      dietaryGoal: data.dietaryGoal,
      language: data.language,
      privacyPolicyAcceptedAt: new Date(),
    },
    select: PROFILE_SELECT,
  })
}

// ─── Settings-specific service functions ────────────────────────────────────

export async function updateProfile(userId: string, data: ProfileSettingsParsed) {
  const existing = await prisma.user.findFirst({
    where: { email: data.email, NOT: { id: userId } },
    select: { id: true },
  })
  if (existing) {
    throw new Error("EMAIL_TAKEN")
  }
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
      dateOfBirth: data.dateOfBirth,
      weight: data.weight,
      height: data.height,
    },
    select: PROFILE_SELECT,
  })
}

export async function updateHealthProfile(
  userId: string,
  data: HealthProfileSettingsInput
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      healthConditions: data.healthConditions,
      dietaryGoal: data.dietaryGoal,
    },
    select: PROFILE_SELECT,
  })
}

export async function getUserHasPassword(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })
  return !!user?.password
}

export async function updatePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })
  if (!user) throw new Error("USER_NOT_FOUND")
  if (!user.password) throw new Error("OAUTH_ONLY")

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw new Error("WRONG_PASSWORD")

  const hashed = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashed },
  })
}

export async function updateLanguage(
  userId: string,
  data: LanguageSettingsInput
): Promise<LanguagePreference> {
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { language: data.language },
    select: { language: true },
  })
  return updated.language
}

export async function deleteAccount(
  userId: string,
  confirmation: { password?: string; confirmEmail?: string }
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true, email: true },
  })
  if (!user) throw new Error("USER_NOT_FOUND")

  if (user.password) {
    if (!confirmation.password) throw new Error("PASSWORD_REQUIRED")
    const valid = await bcrypt.compare(confirmation.password, user.password)
    if (!valid) throw new Error("WRONG_PASSWORD")
  } else {
    if (!confirmation.confirmEmail) throw new Error("EMAIL_CONFIRMATION_REQUIRED")
    if (confirmation.confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      throw new Error("EMAIL_MISMATCH")
    }
  }

  await prisma.user.delete({ where: { id: userId } })
}
