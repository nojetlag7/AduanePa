import type { User } from "@prisma/client"

/** Profile is complete once baseline biodata from onboarding is saved. */
export function isProfileComplete(
  user: Pick<User, "dateOfBirth" | "weight" | "height">
): boolean {
  return user.dateOfBirth != null && user.weight != null && user.height != null
}
