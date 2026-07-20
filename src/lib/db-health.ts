// Detección de "base caída" para el modo mantenimiento automático.
//
// Contexto: en el plan Free de Supabase, cuando la organización supera la cuota
// (p. ej. Cached Egress), TODOS los servicios del proyecto quedan restringidos y
// responden HTTP 402 hasta que resetea el ciclo de facturación. El sitio no
// puede leer la DB y las páginas quedan vacías o tiran error. Esta utilidad
// detecta ese estado desde `proxy.ts` para servir un cartel de mantenimiento
// prolijo (503) en vez de un sitio roto — y volver sola cuando la DB vuelve.
//
// El chequeo es un GET liviano a PostgREST (una fila, una columna). Se cachea en
// memoria a nivel de módulo (persiste por instancia caliente del edge function),
// así que NO pega a Supabase en cada request: como mucho una vez cada
// `OK_TTL_MS` cuando está sana, o cada `DOWN_TTL_MS` cuando está caída.

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/env'

// Estado del probe:
//   'down'    → Supabase respondió 402/403 (cuota/restricción). Confiable.
//   'up'      → respondió 2xx. Confiable.
//   'unknown' → timeout / error de red / status raro. NO concluyente.
type Health = 'down' | 'up' | 'unknown'

// TTL por estado. Clave: 'unknown' se cachea POCO para que un arranque frío
// lento no deje el sitio "sano" (y por ende roto/vacío) durante minutos —
// re-chequea a los pocos segundos y se autocorrige. Un 'up' confiable sí se
// cachea largo (overhead ~0 en operación normal); 'down' re-chequea seguido
// para que el sitio VUELVA rápido cuando resetea la cuota.
const TTL_MS: Record<Health, number> = {
  up: 5 * 60 * 1000,
  down: 30 * 1000,
  unknown: 8 * 1000,
}
// Holgado: un 402 de cuota responde en ~100 ms, pero la PRIMera conexión en
// frío (DNS+TLS) puede tardar. Mejor un timeout amplio que un falso 'unknown'.
const PROBE_TIMEOUT_MS = 3500

type HealthCache = { state: Health; checkedAt: number }
let cache: HealthCache | null = null
let inFlight: Promise<Health> | null = null

async function probe(): Promise<Health> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/site_settings?select=key&limit=1`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        signal: controller.signal,
        cache: 'no-store',
      }
    )
    // 402 (Payment Required) = cuota agotada; 403 puede aparecer en restricción
    // por Fair Use. Cualquiera = base caída para el visitante.
    if (res.status === 402 || res.status === 403) return 'down'
    if (res.ok) return 'up'
    return 'unknown'
  } catch {
    // Timeout / error de red: NO concluyente. Fail-open (no tiramos el sitio a
    // mantenimiento por un blip), pero con TTL corto para reintentar enseguida.
    return 'unknown'
  } finally {
    clearTimeout(timer)
  }
}

/**
 * ¿La base está caída por cuota/restricción? Cacheado en memoria por instancia.
 * `true` solo ante un 402/403 explícito; nunca por timeout (fail-open).
 */
export async function isDbDown(): Promise<boolean> {
  const now = Date.now()
  if (cache && now - cache.checkedAt < TTL_MS[cache.state]) {
    return cache.state === 'down'
  }
  // Coalescir chequeos concurrentes: un solo probe a la vez bajo carga.
  if (!inFlight) {
    inFlight = probe().then((state) => {
      cache = { state, checkedAt: Date.now() }
      inFlight = null
      return state
    })
  }
  return (await inFlight) === 'down'
}
