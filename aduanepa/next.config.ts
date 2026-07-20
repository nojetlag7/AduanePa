import type { NextConfig } from "next"
import withPWAInit from "@ducanh2912/next-pwa"
import createNextIntlPlugin from "next-intl/plugin"

const withNextIntl = createNextIntlPlugin("./i18n/request.ts")

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    // Cache API responses that are safe to read offline
    runtimeCaching: [
      {
        urlPattern: /^https?:\/\/.*\/api\/meals\/generate/,
        handler: "NetworkFirst",
        options: {
          cacheName: "meal-plan-cache",
          expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /^https?:\/\/.*\/api\/meals\/(saved|make-me-a-meal)/,
        handler: "NetworkFirst",
        options: { cacheName: "meals-cache", expiration: { maxEntries: 20 } },
      },
    ],
  },
})

// ─── Security headers ────────────────────────────────────────────────────────
const securityHeaders = [
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent clickjacking — allow same-origin embeds (e.g. iframes within app)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Limit referrer info sent to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // HSTS — enforce HTTPS for 2 years (enable only when TLS is confirmed on prod)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Restrict browser feature access
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Enable DNS prefetching for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // Cross-origin resource policy
  { key: "Cross-Origin-Resource-Policy", value: "same-site" },
  // Cross-origin opener policy (helps with SharedArrayBuffer, popup isolation)
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
]

const nextConfig: NextConfig = {
  // Do not set outputFileTracingRoot to a parent of the app — on Vercel that
  // makes the packager look for `.next` at the Git repo root and fail with
  // ENOENT on `.next/package.json` when Root Directory is `aduanepa`.

  images: {
    // Next.js 16: quality values must be allowlisted.
    qualities: [75],
    localPatterns: [
      { pathname: "/landing_page_meals/**" },
      { pathname: "/icons/**" },
    ],
    // sharp is installed; enable WebP/AVIF auto-conversion
    formats: ["image/avif", "image/webp"],
  },

  // Apply security headers to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },

  // Browsers request /favicon.ico by default — serve the file from public/icons/
  // FCM SW is generated from env at runtime (never commit Firebase keys to public/)
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/icons/favicon.ico" },
      {
        source: "/firebase-messaging-sw.js",
        destination: "/api/firebase-messaging-sw",
      },
    ]
  },

  // Compiler options
  compiler: {
    // Remove console.log in production; keep .error and .warn
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
}

// Chain: next-intl → PWA (only in prod) → base config
const withIntlAndPWA =
  process.env.NODE_ENV === "development"
    ? withNextIntl(nextConfig)
    : withPWA(withNextIntl(nextConfig))

export default withIntlAndPWA
