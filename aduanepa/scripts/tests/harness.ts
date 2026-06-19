/**
 * Scored test harness for phase verification.
 *
 * Each phase test registers weighted checks. A phase "passes" when its score
 * percentage meets the threshold (default 80%). Critical checks are surfaced
 * separately for visibility (use --strict on the runner to also hard-gate them).
 */

export interface CheckEntry {
  name: string
  weight: number
  critical: boolean
  passed: boolean
  detail?: string
}

export interface PhaseScore {
  total: number
  earned: number
  pct: number
  criticalFailed: CheckEntry[]
  failed: CheckEntry[]
}

const C = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
}

export class Tester {
  readonly phase: number
  readonly title: string
  readonly entries: CheckEntry[] = []

  constructor(phase: number, title: string) {
    this.phase = phase
    this.title = title
  }

  /** Record a boolean check synchronously. */
  check(
    name: string,
    passed: boolean,
    opts: { weight?: number; critical?: boolean; detail?: string } = {}
  ): void {
    const entry: CheckEntry = {
      name,
      weight: opts.weight ?? 1,
      critical: opts.critical ?? false,
      passed: Boolean(passed),
      detail: opts.detail,
    }
    this.entries.push(entry)

    const tag = entry.passed
      ? `${C.green}PASS${C.reset}`
      : entry.critical
        ? `${C.red}FAIL!${C.reset}`
        : `${C.yellow}FAIL${C.reset}`
    const detail = entry.detail ? ` ${C.dim}— ${entry.detail}${C.reset}` : ""
    const star = entry.critical ? `${C.dim}*${C.reset}` : ""
    console.log(`    [${tag}] ${name}${star}${detail}`)
  }

  /**
   * Run an async/sync producer that returns a boolean (or throws). Exceptions
   * are caught and recorded as failures with the error message as detail.
   */
  async test(
    name: string,
    fn: () => boolean | Promise<boolean>,
    opts: { weight?: number; critical?: boolean; detail?: string } = {}
  ): Promise<void> {
    try {
      const result = await fn()
      this.check(name, result, opts)
    } catch (error) {
      this.check(name, false, {
        ...opts,
        detail: error instanceof Error ? error.message : String(error),
      })
    }
  }

  /** Visual grouping header in the output. */
  section(label: string): void {
    console.log(`\n  ${C.bold}${label}${C.reset}`)
  }

  score(): PhaseScore {
    const total = this.entries.reduce((sum, e) => sum + e.weight, 0)
    const earned = this.entries.reduce((sum, e) => sum + (e.passed ? e.weight : 0), 0)
    const pct = total === 0 ? 100 : (earned / total) * 100
    return {
      total,
      earned,
      pct,
      criticalFailed: this.entries.filter((e) => e.critical && !e.passed),
      failed: this.entries.filter((e) => !e.passed),
    }
  }
}

export interface PhaseModule {
  meta: { phase: number; title: string; implemented: boolean }
  run?: (t: Tester) => Promise<void> | void
}
