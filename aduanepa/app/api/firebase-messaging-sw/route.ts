import { NextResponse } from "next/server"

/**
 * Serves `/firebase-messaging-sw.js` with Firebase web config injected from
 * NEXT_PUBLIC_* env vars at request time — never commit those values to git.
 *
 * Rewritten from `/firebase-messaging-sw.js` in next.config.ts.
 */
export function GET() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ""
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? ""
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ""
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? ""
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? ""
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ""

  if (!apiKey || !projectId || !appId || !messagingSenderId) {
    return new NextResponse("// Firebase web config is not set on the server.", {
      status: 503,
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-store",
      },
    })
  }

  const script = `/* Dedicated FCM service worker (Firebase compat build).
 * Config is injected at runtime from NEXT_PUBLIC_* env — not stored in git.
 */
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js"
)
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
)

firebase.initializeApp(${JSON.stringify({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  })})

const messaging = firebase.messaging()

messaging.onBackgroundMessage(function (payload) {
  var title =
    (payload.notification && payload.notification.title) ||
    (payload.data && payload.data.title) ||
    "AduanePa"
  var body =
    (payload.notification && payload.notification.body) ||
    (payload.data && payload.data.body) ||
    "You have a new update."
  var icon =
    (payload.notification && payload.notification.icon) ||
    (payload.data && payload.data.icon) ||
    "/icons/android-chrome-192x192.png"
  var url = (payload.data && payload.data.url) || "/dashboard"

  self.registration.showNotification(title, {
    body: body,
    icon: icon,
    badge: "/icons/favicon-32x32.png",
    data: { url: url },
  })
})

self.addEventListener("notificationclick", function (event) {
  event.notification.close()
  var targetUrl =
    (event.notification.data && event.notification.data.url) || "/dashboard"

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i]
        if ("focus" in client) {
          if (client.navigate) client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})
`

  return new NextResponse(script, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
