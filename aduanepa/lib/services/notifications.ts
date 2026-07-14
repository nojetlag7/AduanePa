import "server-only"
import { prisma } from "@/lib/db"
import { getAdminMessaging } from "@/lib/firebase/admin"

// ─── Token persistence ───────────────────────────────────────────────────────

export async function saveDeviceToken(
  userId: string,
  token: string,
  userAgent?: string | null
) {
  return prisma.deviceToken.upsert({
    where: { token },
    create: {
      userId,
      token,
      userAgent: userAgent ?? null,
    },
    update: {
      userId,
      userAgent: userAgent ?? null,
    },
  })
}

export async function listDeviceTokens(userId: string) {
  return prisma.deviceToken.findMany({
    where: { userId },
    select: { id: true, token: true, userAgent: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })
}

export async function removeDeviceToken(userId: string, token: string) {
  // Scope delete to the owning user so one user cannot wipe another's token.
  return prisma.deviceToken.deleteMany({
    where: { userId, token },
  })
}

export async function removeAllDeviceTokens(userId: string) {
  return prisma.deviceToken.deleteMany({ where: { userId } })
}

export async function setNotificationsEnabled(userId: string, enabled: boolean) {
  return prisma.user.update({
    where: { id: userId },
    data: { notificationsEnabled: enabled },
    select: { id: true, notificationsEnabled: true },
  })
}

// ─── Send helpers ────────────────────────────────────────────────────────────

export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, string>
  url?: string
}

export async function sendNotificationToToken(
  token: string,
  payload: NotificationPayload
): Promise<{ success: boolean; errorCode?: string }> {
  const messaging = getAdminMessaging()
  if (!messaging) {
    return { success: false, errorCode: "ADMIN_NOT_CONFIGURED" }
  }

  try {
    await messaging.send({
      token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...(payload.data ?? {}),
        url: payload.url ?? "/dashboard",
        title: payload.title,
        body: payload.body,
      },
      webpush: {
        fcmOptions: {
          link: payload.url ?? "/dashboard",
        },
      },
    })
    return { success: true }
  } catch (err) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "SEND_FAILED"
    return { success: false, errorCode: code }
  }
}

/**
 * Fan-out to every device token for a user.
 * Prunes tokens that Firebase reports as unregistered / invalid.
 */
export async function sendNotificationToUser(
  userId: string,
  payload: NotificationPayload
): Promise<{ sent: number; pruned: number }> {
  const tokens = await listDeviceTokens(userId)
  if (tokens.length === 0) return { sent: 0, pruned: 0 }

  let sent = 0
  let pruned = 0

  await Promise.all(
    tokens.map(async ({ token }) => {
      const result = await sendNotificationToToken(token, payload)
      if (result.success) {
        sent++
        return
      }

      const stale =
        result.errorCode === "messaging/registration-token-not-registered" ||
        result.errorCode === "messaging/invalid-registration-token"

      if (stale) {
        await removeDeviceToken(userId, token)
        pruned++
      }
    })
  )

  return { sent, pruned }
}
