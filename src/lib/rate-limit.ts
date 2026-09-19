// Crude in-process rate limiter, shared by the handful of public endpoints that
// need one (encargo/tejedora forms, coupon lookups, tracking-code lookups).
// Survives within a single server instance only — good enough to blunt casual
// scripted abuse at current scale, not a distributed-attack defence (that needs
// a Redis/Upstash bucket). Mirrors the pattern that already existed inline in
// src/app/encargo/actions.ts and src/app/tejedoras/actions.ts.
const buckets = new Map<string, number[]>()

// La limpieza usa la ventana más larga que pide cualquier ruta, no la del
// pedido que la dispara: antes, una llamada de 1 minuto podía borrar el balde
// de 10 minutos de los formularios y devolverle el cupo entero a quien lo
// estaba agotando (19/09/2026).
const LONGEST_WINDOW_MS = 60 * 60_000

export function checkRateLimit(key: string, opts: { windowMs: number; max: number }): boolean {
  const now = Date.now()
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < opts.windowMs)
  if (recent.length >= opts.max) return false
  recent.push(now)
  buckets.set(key, recent)
  // Best-effort cleanup so the map doesn't grow unbounded.
  if (buckets.size > 2000) {
    for (const [k, ts] of buckets) {
      if (ts.every((t) => now - t > LONGEST_WINDOW_MS)) buckets.delete(k)
    }
  }
  return true
}

// De qué IP viene el pedido, para los baldes de arriba.
//
// x-nf-client-connection-ip primero (auditoría de seguridad 19/09/2026): lo
// escribe el borde de Netlify con la IP real de la conexión. El primer valor de
// x-forwarded-for, que era lo único que se miraba, lo puede escribir el propio
// cliente: mandando uno distinto en cada pedido, cada pedido estrenaba un balde
// y ningún límite del sitio frenaba nada. En local ese header no existe y se
// sigue por el camino de antes.
export function getClientIp(h: Headers): string {
  const edge = h.get('x-nf-client-connection-ip')
  if (edge) return edge.trim()
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return h.get('x-real-ip') || 'unknown'
}
