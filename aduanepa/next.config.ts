import path from "node:path"
import type { NextConfig } from "next"
import withPWAInit from "@ducanh2912/next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
})

const nextConfig: NextConfig = {
  // Pin the workspace root to this project. A stray lockfile in the user's home
  // directory otherwise makes Next infer the wrong root.
  outputFileTracingRoot: path.join(__dirname),
}

// next-pwa injects a webpack config, which collides with Turbopack (the Next 16
// dev default). PWA is disabled in development anyway, so only wrap for builds —
// this lets `next dev` run on Turbopack with no webpack config present.
export default process.env.NODE_ENV === "development" ? nextConfig : withPWA(nextConfig)
