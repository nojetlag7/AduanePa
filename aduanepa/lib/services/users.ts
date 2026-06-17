import { prisma } from "@/lib/db"
import { isProfileComplete } from "@/lib/profile"
import type { OnboardingParsed } from "@/lib/validations/onboarding"
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
    },
    select: PROFILE_SELECT,
  })
}
