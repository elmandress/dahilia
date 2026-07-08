'use server'

// Server action para la lista VIP (drops y lanzamientos). Vive en lib/ porque
// lo consume el Footer (global), no una ruta puntual.

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export interface SubscribeResult {
  ok: boolean
  /** true when the email was already on the list (still a success for the user). */
  already?: boolean
  error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const SOURCES = new Set(['footer', 'encargo', 'drop'])

// Same in-process limiter pattern as the other public forms.
const log = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 4

function allow(key: string): boolean {
  const now = Date.now()
  const recent = (log.get(key) || []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) return false
  recent.push(now)
  log.set(key, recent)
  return true
}

export async function subscribeToVipList(rawEmail: string, rawSource?: string): Promise<SubscribeResult> {
  const email = String(rawEmail || '').trim().slice(0, 120)
  const source = SOURCES.has(String(rawSource)) ? String(rawSource) : 'footer'

  if (!EMAIL_RE.test(email)) return { ok: false, error: 'Ese email no parece válido.' }

  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0].trim() || h.get('x-real-ip') || 'unknown'
  if (!allow(ip)) return { ok: false, error: 'Demasiados intentos. Probá en un minuto.' }

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
