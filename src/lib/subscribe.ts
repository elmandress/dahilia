'use server'

// Server action para la lista VIP (drops y lanzamientos). Vive en lib/ porque
// lo consume el Footer (global), no una ruta puntual.

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCatalog } from '@/lib/catalog'
import { listaConfigured, sendToList, welcomeMail } from '@/lib/email/lista'
import { parseDropDateUY, dropWhenText } from '@/lib/drop-date'

export interface SubscribeResult {
  ok: boolean
  /** true when the email was already on the list (still a success for the user). */
  already?: boolean
  error?: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// popup / vip / home desde el 12/10/2026 (lista-vip-origenes-2026-10.sql): para
// saber qué entrada a la lista funciona. Sin ese SQL la base rechaza el
// origen nuevo y se guarda como 'drop' (ver más abajo): nadie queda afuera.
const SOURCES = new Set(['footer', 'encargo', 'drop', 'popup', 'vip', 'home', 'gracias'])
const LEGACY_SOURCES = new Set(['footer', 'encargo', 'drop'])

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
    let { error } = await supabase.from('subscribers').insert({ email, source })
    // 23514 = check_violation: la base todavía no acepta el origen nuevo.
    if (error?.code === '23514' && !LEGACY_SOURCES.has(source)) {
      ;({ error } = await supabase.from('subscribers').insert({ email, source: 'drop' }))
    }
    if (error) {
      // Duplicate = already subscribed → success from the user's point of view.
      if (error.code === '23505' || /duplicate|unique/i.test(error.message || '')) {
        // Se había dado de baja y se vuelve a anotar: vuelve a la lista.
        // (Con la clave pública no se puede actualizar; con la de servicio sí.)
        const db = createAdminClient()
        if (db) {
          const { data: back } = await db.from('subscribers').update({ unsubscribed_at: null })
            .eq('email', email).not('unsubscribed_at', 'is', null).select('id')
          if (back && back.length > 0) { await sendWelcome(email); return { ok: true } }
        }
        return { ok: true, already: true }
      }
      console.error('subscribe insert error', error)
      return { ok: false, error: 'No pudimos anotarte ahora. Probá de nuevo en un rato.' }
    }
    await sendWelcome(email)
    return { ok: true }
  } catch (e) {
    console.error('subscribe unexpected error', e)
    return { ok: false, error: 'Error inesperado. Probá de nuevo.' }
  }
}

/**
 * Mail de bienvenida a la lista (12/10/2026): confirma que entró y qué va a
 * recibir. Además de ser lo esperado, un primer mail abierto y sin quejas
 * ayuda a que el aviso del drop no caiga en spam. Nunca rompe la
 * suscripción: si el mail falla, la persona igual queda anotada.
 */
async function sendWelcome(email: string): Promise<void> {
  if (!listaConfigured()) return
  try {
    const { settings } = await getCatalog()
    const name = settings.drop_enabled !== 'false' ? (settings.drop_name ?? '').trim() : ''
    const when = parseDropDateUY(settings.drop_date)
    const nextDrop = name
      ? { name, whenText: when && when.getTime() > Date.now() ? dropWhenText(when) : undefined }
      : undefined
    await sendToList([email], (e) => welcomeMail(e, nextDrop), `bienvenida:${email}`)
  } catch (e) {
    console.error('lista: bienvenida', e)
  }
}
