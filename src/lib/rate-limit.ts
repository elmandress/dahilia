// Crude in-process rate limiter, shared by the handful of public endpoints that
// need one (encargo/tejedora forms, coupon lookups, tracking-code lookups).
// Survives within a single server instance only — good enough to blunt casual
// scripted abuse at current scale, not a distributed-attack defence (that needs
// a Redis/Upstash bucket). Mirrors the pattern that already existed inline in
// src/app/encargo/actions.ts and src/app/tejedoras/actions.ts.
const buckets = new Map<string, number[]>()

export function checkRateLimit(key: string, opts: { windowMs: number; max: number }): boolean {
  const now = Date.now()
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < opts.windowMs)
  if (recent.length >= opts.max) return false
  recent.push(now)
  buckets.set(key, recent)
  // Best-effort cleanup so the map doesn't grow unbounded.
  if (buckets.size > 2000) {
    for (const [k, ts] of buckets) {
      if (ts.every((t) => now - t > opts.windowMs)) buckets.delete(k)
    }
  }
  return true
}

export function getClientIp(h: Headers): string {
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return h.get('x-real-ip') || 'unknown'
}
