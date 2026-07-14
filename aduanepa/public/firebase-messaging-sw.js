/* Dedicated FCM service worker (Firebase compat build).
 * Served from site root so scope covers the whole app.
 * Config values are the public NEXT_PUBLIC Firebase web keys only.
 */
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js"
)
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js"
)

firebase.initializeApp({
  apiKey: "AIzaSyCNGsm8a4rHkLRxLaJkjMIscN-BsTjhvaA",
  authDomain: "aduanepa-b1b06.firebaseapp.com",
  projectId: "aduanepa-b1b06",
  storageBucket: "aduanepa-b1b06.firebasestorage.app",
  messagingSenderId: "200192414360",
  appId: "1:200192414360:web:919aece992f2d27261b6ed",
})

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
