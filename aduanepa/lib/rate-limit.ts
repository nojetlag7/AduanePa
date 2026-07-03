/**
 * Simple in-memory token-bucket rate limiter.
 *
 * Suitable for a single-process Next.js server or development.
 * For multi-replica production deployments, replace the in-memory
 * store with a shared Redis/Upstash counter.
 *
 * Usage:
 *   const result = await rateLimit(ip, { limit: 5, windowMs: 60_000 })
 *   if (!result.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface Bucket {
  count: number
  resetAt: number
}

const store = new Map<string, Bucket>()

export interface RateLimitOptions {
  /** Max requests allowed in the window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(key: string, opts: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  let bucket = store.get(key)

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + opts.windowMs }
    store.set(key, bucket)
  }

  bucket.count++
  const remaining = Math.max(0, opts.limit - bucket.count)
  return {
    success: bucket.count <= opts.limit,
    remaining,
    resetAt: bucket.resetAt,
  }
}

/** Returns the real client IP from standard proxy headers, falling back to a sentinel. */
export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  )
}
