/**
 * Vercel looks for `.next` at the Git repo root (`/vercel/path0/.next`).
 * The Next.js app lives in `aduanepa/`, so after `next build` we mirror
 * that output to the repo root for the platform packager.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const src = path.join(root, "aduanepa", ".next")
const dest = path.join(root, ".next")

if (!fs.existsSync(src)) {
  console.error(`[sync-next-output] Missing build output at ${src}`)
  process.exit(1)
}

fs.rmSync(dest, { recursive: true, force: true })
fs.cpSync(src, dest, { recursive: true })

const marker = path.join(dest, "package.json")
if (!fs.existsSync(marker)) {
  fs.writeFileSync(marker, JSON.stringify({ type: "commonjs" }))
}

console.log(`[sync-next-output] Mirrored ${src} → ${dest}`)
