import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import {
  removeAllDeviceTokens,
  removeDeviceToken,
  saveDeviceToken,
  setNotificationsEnabled,
} from "@/lib/services/notifications"
import { notificationsPreferenceSchema } from "@/lib/validations/notifications"

/** Toggle notifications preference; optionally attach/detach an FCM token. */
export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = notificationsPreferenceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const userId = session.user.id
  const { enabled, token } = parsed.data
  const userAgent = request.headers.get("user-agent")

  if (enabled) {
    if (token) {
      await saveDeviceToken(userId, token, userAgent)
    }
    const user = await setNotificationsEnabled(userId, true)
    return NextResponse.json({ notificationsEnabled: user.notificationsEnabled })
  }

  // Disabling: clear preference and drop this device token (or all if none provided).
  if (token) {
    await removeDeviceToken(userId, token)
  } else {
    await removeAllDeviceTokens(userId)
  }
  const user = await setNotificationsEnabled(userId, false)
  return NextResponse.json({ notificationsEnabled: user.notificationsEnabled })
}
