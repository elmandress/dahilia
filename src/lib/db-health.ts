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

// Sana: no re-chequear por 5 min (mantiene el overhead en ~0 en operación normal).
const OK_TTL_MS = 5 * 60 * 1000
// Caída: re-chequear cada 30 s para que el sitio VUELVA rápido tras el reset.
const DOWN_TTL_MS = 30 * 1000
// Corta el chequeo a los 2 s: un 402 de cuota responde al toque, así que un
// timeout implica red lenta, no cuota agotada → fail-open (asumir sana).
const PROBE_TIMEOUT_MS = 2000

type HealthCache = { down: boolean; checkedAt: number }
let cache: HealthCache | null = null
let inFlight: Promise<boolean> | null = null

async function probe(): Promise<boolean> {
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
    // por Fair Use. Cualquiera de los dos = base caída para el visitante.
    return res.status === 402 || res.status === 403
  } catch {
    // Timeout / error de red: fail-open. Nunca tirar el sitio a mantenimiento
    // por un blip transitorio — solo lo hacemos ante un 402/403 explícito.
    return false
  } finally {
    clearTimeout(timer)
  }
}

/**
 * ¿La base está caída por cuota/restricción? Cacheado en memoria.
 * `true` solo ante un 402/403 explícito de Supabase; nunca por timeout.
 */
export async function isDbDown(): Promise<boolean> {
  const now = Date.now()
  if (cache) {
    const ttl = cache.down ? DOWN_TTL_MS : OK_TTL_MS
    if (now - cache.checkedAt < ttl) return cache.down
  }
  // Coalescir chequeos concurrentes: bajo carga, un solo probe a la vez.
  if (!inFlight) {
    inFlight = probe().then((down) => {
      cache = { down, checkedAt: Date.now() }
      inFlight = null
      return down
    })
  }
  return inFlight
}
