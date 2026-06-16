import { prisma } from "@/lib/db"
import { isProfileComplete } from "@/lib/profile"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import type { UserProfile } from "@/types"

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
} as const

export { isProfileComplete } from "@/lib/profile"

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: PROFILE_SELECT,
  })
}

export async function updateUserProfile(userId: string, data: OnboardingInput) {
  const parsed = onboardingSchema.parse(data)

  return prisma.user.update({
    where: { id: userId },
    data: {
      dateOfBirth: parsed.dateOfBirth,
      weight: parsed.weight,
      height: parsed.height,
      healthConditions: parsed.healthConditions,
      dietaryGoal: parsed.dietaryGoal,
      language: parsed.language,
    },
    select: PROFILE_SELECT,
  })
}
