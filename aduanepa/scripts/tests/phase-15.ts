import type { Tester } from "./harness"
import { fileContains, fileExists } from "./util"

export const meta = {
  phase: 15,
  title: "Push Notifications (FCM)",
  implemented: true,
}

export async function run(t: Tester) {
  t.section("Files")
  t.check("lib/firebase/client.ts", fileExists("lib/firebase/client.ts"), { critical: true })
  t.check("lib/firebase/admin.ts", fileExists("lib/firebase/admin.ts"), { critical: true })
  t.check("lib/firebase/messaging.ts", fileExists("lib/firebase/messaging.ts"), { critical: true })
  t.check("lib/firebase/config.ts", fileExists("lib/firebase/config.ts"))
  t.check("public/firebase-messaging-sw.js", fileExists("public/firebase-messaging-sw.js"), {
    critical: true,
  })
  t.check("lib/services/notifications.ts", fileExists("lib/services/notifications.ts"), {
    critical: true,
  })
  t.check(
    "save-token API route",
    fileExists("app/api/notifications/save-token/route.ts"),
    { critical: true }
  )
  t.check(
    "preference API route",
    fileExists("app/api/notifications/preference/route.ts")
  )
  t.check("useFcmToken hook", fileExists("hooks/use-fcm-token.ts"))
  t.check(
    "foreground listener",
    fileExists("components/notifications/foreground-listener.tsx"),
    { critical: true }
  )
  t.check(
    "notification settings UI",
    fileExists("components/settings/notification-settings.tsx"),
    { critical: true }
  )

  t.section("Service worker contract")
  t.check(
    "SW uses firebase-app-compat",
    fileContains("public/firebase-messaging-sw.js", "firebase-app-compat")
  )
  t.check(
    "SW uses firebase-messaging-compat",
    fileContains("public/firebase-messaging-sw.js", "firebase-messaging-compat")
  )
  t.check(
    "SW handles onBackgroundMessage",
    fileContains("public/firebase-messaging-sw.js", "onBackgroundMessage")
  )
  t.check(
    "SW handles notificationclick",
    fileContains("public/firebase-messaging-sw.js", "notificationclick")
  )

  t.section("Admin + client safety")
  t.check(
    "admin module is server-only",
    fileContains("lib/firebase/admin.ts", 'import "server-only"'),
    { critical: true, weight: 2 }
  )
  t.check(
    "admin normalises private key newlines",
    fileContains("lib/firebase/admin.ts", "replace(/\\\\n/g")
  )
  t.check(
    "client uses isSupported before getMessaging",
    fileContains("lib/firebase/client.ts", "isSupported")
  )
  t.check(
    "messaging never throws to caller (typed result)",
    fileContains("lib/firebase/messaging.ts", "FcmTokenResult")
  )

  t.section("Schema — DeviceToken")
  t.check(
    "DeviceToken model in schema",
    fileContains("prisma/schema.prisma", "model DeviceToken"),
    { critical: true }
  )
  t.check(
    "DeviceToken.token is unique",
    fileContains("prisma/schema.prisma", "token     String   @unique") ||
      fileContains("prisma/schema.prisma", "token String @unique")
  )
  t.check(
    "DeviceToken cascades on user delete",
    fileContains("prisma/schema.prisma", "onDelete: Cascade")
  )

  t.section("Dependencies")
  const pkg = JSON.parse(
    (await import("node:fs")).readFileSync("package.json", "utf-8")
  ) as { dependencies?: Record<string, string> }
  const deps = pkg.dependencies ?? {}
  t.check("dependency: firebase", "firebase" in deps, { critical: true })
  t.check("dependency: firebase-admin", "firebase-admin" in deps, { critical: true })

  t.section("Service helpers")
  const svc = (await import("node:fs")).readFileSync("lib/services/notifications.ts", "utf-8")
  t.check("saveDeviceToken exported", svc.includes("export async function saveDeviceToken"))
  t.check("listDeviceTokens exported", svc.includes("export async function listDeviceTokens"))
  t.check("removeDeviceToken exported", svc.includes("export async function removeDeviceToken"))
  t.check(
    "sendNotificationToUser prunes stale tokens",
    svc.includes("registration-token-not-registered"),
    { weight: 2 }
  )

  t.section("Validation")
  const { saveDeviceTokenSchema, notificationsPreferenceSchema } = await import(
    "@/lib/validations/notifications"
  )
  t.check(
    "saveDeviceTokenSchema accepts a long token",
    saveDeviceTokenSchema.safeParse({ token: "a".repeat(40) }).success,
    { critical: true }
  )
  t.check(
    "saveDeviceTokenSchema rejects short token",
    !saveDeviceTokenSchema.safeParse({ token: "short" }).success
  )
  t.check(
    "preference schema accepts enable + token",
    notificationsPreferenceSchema.safeParse({
      enabled: true,
      token: "a".repeat(40),
    }).success
  )
  t.check(
    "preference schema accepts disable without token",
    notificationsPreferenceSchema.safeParse({ enabled: false }).success
  )
}
