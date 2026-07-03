/**
 * Phase test runner.
 *
 * Usage:
 *   npm run test:phase -- 8                 run phase 8
 *   npm run test:phase -- 5 6 7             run several phases
 *   npm run test:phase -- 8 --threshold 90  custom pass threshold
 *   npm run test                            run every implemented phase
 *   npm run test -- --strict                also hard-gate on critical checks
 *
 * A phase passes when score% >= threshold (default 80). With --strict, any
 * failed critical check also fails the phase regardless of score.
 */
import { config } from "dotenv"

// Load env BEFORE importing anything that touches Prisma (lib/db reads
// DATABASE_URL at module load). .env.local wins; .env fills any gaps.
config({ path: ".env.local" })
config({ path: ".env" })

import type { PhaseModule } from "./tests/harness"
import { Tester } from "./tests/harness"

const C = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
}

const LAST_IMPLEMENTED_PHASE = 13
const ALL_PHASES = Array.from({ length: 16 }, (_, i) => i) // 0..15

interface Args {
  phases: number[]
  threshold: number
  strict: boolean
}

function parseArgs(argv: string[]): Args {
  const phases: number[] = []
  let threshold = 80
  let strict = false
  let all = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--all") all = true
    else if (arg === "--strict") strict = true
    else if (arg === "--threshold") threshold = Number(argv[++i])
    else if (/^\d+$/.test(arg)) phases.push(Number(arg))
  }

  if (all || phases.length === 0) {
    return { phases: ALL_PHASES, threshold, strict }
  }
  return { phases, threshold, strict }
}

async function loadPhase(phase: number): Promise<PhaseModule | null> {
  try {
    return (await import(`./tests/phase-${phase}.ts`)) as PhaseModule
  } catch {
    return null
  }
}

interface Outcome {
  phase: number
  title: string
  status: "pass" | "fail" | "pending" | "missing"
  pct: number
  earned: number
  total: number
}

async function runPhase(phase: number, args: Args): Promise<Outcome> {
  const mod = await loadPhase(phase)

  if (!mod) {
    return { phase, title: "(no test file)", status: "missing", pct: 0, earned: 0, total: 0 }
  }

  const { meta, run } = mod
  console.log(
    `\n${C.cyan}${C.bold}━━ Phase ${phase}: ${meta.title} ━━${C.reset}`
  )

  if (!meta.implemented || !run) {
    console.log(`  ${C.dim}Pending — no tests written for this phase yet.${C.reset}`)
    return { phase, title: meta.title, status: "pending", pct: 0, earned: 0, total: 0 }
  }

  const tester = new Tester(phase, meta.title)
  await run(tester)
  const score = tester.score()

  const meetsThreshold = score.pct >= args.threshold
  const criticalOk = !args.strict || score.criticalFailed.length === 0
  const passed = meetsThreshold && criticalOk

  const bar = passed ? `${C.green}` : `${C.red}`
  console.log(
    `\n  ${bar}${C.bold}Score: ${score.earned}/${score.total} (${score.pct.toFixed(1)}%)` +
      `  threshold ${args.threshold}%  →  ${passed ? "PASS" : "FAIL"}${C.reset}`
  )
  if (args.strict && score.criticalFailed.length > 0) {
    console.log(`  ${C.red}${score.criticalFailed.length} critical check(s) failed.${C.reset}`)
  }

  return {
    phase,
    title: meta.title,
    status: passed ? "pass" : "fail",
    pct: score.pct,
    earned: score.earned,
    total: score.total,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  console.log(
    `${C.bold}AduanePa phase tests${C.reset} ${C.dim}(threshold ${args.threshold}%` +
      `${args.strict ? ", strict criticals" : ""})${C.reset}`
  )

  const outcomes: Outcome[] = []
  for (const phase of args.phases) {
    // In --all mode, don't complain about phases beyond what's built.
    if (phase > LAST_IMPLEMENTED_PHASE && args.phases.length > 1) {
      const mod = await loadPhase(phase)
      if (!mod || !mod.meta.implemented) continue
    }
    outcomes.push(await runPhase(phase, args))
  }

  // ── Summary ────────────────────────────────────────────────────────────
  console.log(`\n${C.bold}━━ Summary ━━${C.reset}`)
  const gated = outcomes.filter((o) => o.status === "pass" || o.status === "fail")
  for (const o of outcomes) {
    if (o.status === "missing") continue
    const label =
      o.status === "pass"
        ? `${C.green}PASS${C.reset}`
        : o.status === "fail"
          ? `${C.red}FAIL${C.reset}`
          : `${C.dim}PENDING${C.reset}`
    const score = o.total > 0 ? ` ${o.pct.toFixed(1)}% (${o.earned}/${o.total})` : ""
    console.log(`  Phase ${o.phase}: ${label}${score}  ${C.dim}${o.title}${C.reset}`)
  }

  const failed = gated.filter((o) => o.status === "fail")
  try {
    const { prisma } = await import("@/lib/db")
    await prisma.$disconnect()
  } catch {
    /* DB may never have connected — ignore */
  }

  if (failed.length > 0) {
    console.log(
      `\n${C.red}${C.bold}${failed.length} phase(s) below threshold — do not advance.${C.reset}`
    )
    process.exit(1)
  }

  if (gated.length === 0) {
    console.log(`\n${C.yellow}No gated phases ran.${C.reset}`)
    return
  }

  console.log(`\n${C.green}${C.bold}All gated phases met the threshold.${C.reset}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
