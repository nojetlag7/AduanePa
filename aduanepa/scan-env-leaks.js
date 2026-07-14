const fs = require("fs")
const path = require("path")

const envPath = path.join(__dirname, ".env.local")
const raw = fs.readFileSync(envPath, "utf8")

/** @type {{ key: string, value: string }[]} */
const secrets = []
for (const line of raw.split(/\r?\n/)) {
  const t = line.trim()
  if (!t || t.startsWith("#")) continue
  const i = t.indexOf("=")
  if (i < 0) continue
  const key = t.slice(0, i).trim()
  let val = t.slice(i + 1).trim()
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1)
  }
  if (val.length >= 8) {
    secrets.push({ key, value: val })
    if (val.includes("\\n")) {
      secrets.push({ key, value: val.replace(/\\n/g, "\n") })
    }
  }
}

const ignoreDir = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "out",
  "build",
])
const textExt = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".css",
  ".html",
  ".txt",
  ".svg",
  ".xml",
  ".webmanifest",
  ".map",
])

function walk(dir, out = []) {
  let entries
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const e of entries) {
    if (ignoreDir.has(e.name)) continue
    if (e.name.startsWith(".env")) continue
    if (e.name === "scan-env-leaks.js") continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) walk(full, out)
    else {
      const ext = path.extname(e.name).toLowerCase()
      if (!ext || textExt.has(ext)) out.push(full)
    }
  }
  return out
}

const root = __dirname
const files = walk(root)
const hits = []

for (const file of files) {
  let text
  try {
    text = fs.readFileSync(file, "utf8")
  } catch {
    continue
  }
  for (const { key, value } of secrets) {
    // Skip non-secret-ish short URLs that are expected in docs (NEXTAUTH_URL localhost)
    if (key === "NEXTAUTH_URL") continue
    if (key === "BREVO_SENDER_NAME") continue
    if (!value || value.length < 8) continue
    if (text.includes(value)) {
      hits.push({
        key,
        file: path.relative(root, file).replace(/\\/g, "/"),
        preview: value.slice(0, 12) + "…",
      })
    }
  }
}

const seen = new Set()
const unique = []
for (const h of hits) {
  const id = h.key + "|" + h.file
  if (seen.has(id)) continue
  seen.add(id)
  unique.push(h)
}

const publicHits = unique.filter((h) => h.file.startsWith("public/"))
const sourceHits = unique.filter((h) => !h.file.startsWith("public/"))

console.log(
  JSON.stringify(
    {
      scannedFiles: files.length,
      secretKeys: [...new Set(secrets.map((s) => s.key))],
      publicHits,
      sourceHits,
      totalHits: unique.length,
      firebaseSwExists: fs.existsSync(path.join(root, "public/firebase-messaging-sw.js")),
    },
    null,
    2
  )
)
