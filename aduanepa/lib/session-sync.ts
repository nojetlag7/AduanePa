import { auth, unstable_update } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { isProfileComplete } from "@/lib/profile"

/** Only allow same-origin relative paths (blocks open redirects). */
export function safeRedirectPath(path: string | null, fallback = "/onboarding"): string {
  if (path && path.startsWith("/") && !path.startsWith("//")) return path
  return fallback
}

/**
 * Align the JWT cookie with the database when claims are stale.
 * Must only be called from a Route Handler — not from Server Components.
 */
export async function syncSessionFromDb(): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) return

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      emailVerified: true,
      dateOfBirth: true,
      weight: true,
      height: true,
      language: true,
    },
  })
  if (!user) return

  const profileComplete = isProfileComplete(user)
  const needsSync =
    user.emailVerified !== session.user.isEmailVerified ||
    profileComplete !== session.user.isProfileComplete

  if (!needsSync) return

  await unstable_update({
    user: {
      isEmailVerified: user.emailVerified,
      isProfileComplete: profileComplete,
      language: user.language,
    },
  })
}
