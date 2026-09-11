'use server'

// Server action para la lista VIP (drops y lanzamientos). Vive en lib/ porque
// lo consume el Footer (global), no una ruta puntual.

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export interface SubscribeResult {
  ok: boolean
  /** true when the email was already on the list (still a success for the user). */
  already?: boolean
  error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SOURCES = new Set(['footer', 'encargo', 'drop'])

const RATE_WINDOW_MS = 60_000
const RATE_MAX = 4

export async function subscribeToVipList(rawEmail: string, rawSource?: string): Promise<SubscribeResult> {
  const email = String(rawEmail || '').trim().slice(0, 120)
  const source = SOURCES.has(String(rawSource)) ? String(rawSource) : 'footer'

  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Ese email no parece válido.' }

  const h = await headers()
  const ip = getClientIp(h)
  // Antes reinventaba su propio limitador en vez de usar lib/rate-limit.ts,
  // que ya usan encargo/tejedoras/cupón (auditoría 03/09/2026) — mismo
  // algoritmo, código repetido sin necesidad.
  if (!checkRateLimit(`subscribe:${ip}`, { windowMs: RATE_WINDOW_MS, max: RATE_MAX })) {
    return { ok: false, error: 'Demasiados intentos. Probá en un minuto.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('subscribers').insert({ email, source })
    if (error) {
      // Duplicate = already subscribed → success from the user's point of view.
      if (error.code === '23505' || /duplicate|unique/i.test(error.message || '')) {
        return { ok: true, already: true }
      }
      console.error('subscribe insert error', error)
      return { ok: false, error: 'No pudimos anotarte ahora. Probá de nuevo en un rato.' }
    }
    return { ok: true }
  } catch (e) {
    console.error('subscribe unexpected error', e)
    return { ok: false, error: 'Error inesperado. Probá de nuevo.' }
  }
}
