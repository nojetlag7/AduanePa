import type { User } from "@prisma/client"

/** Profile is complete once baseline biodata and privacy consent from onboarding are saved. */
export function isProfileComplete(
  user: Pick<User, "dateOfBirth" | "weight" | "height" | "privacyPolicyAcceptedAt">
): boolean {
  return (
    user.dateOfBirth != null &&
    user.weight != null &&
    user.height != null &&
    user.privacyPolicyAcceptedAt != null
  )
}
