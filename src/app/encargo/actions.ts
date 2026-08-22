'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notifyNewEncargo, reportSystemError } from '@/lib/email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export interface EncargoSubmission {
  ok: boolean
  error?: string
  /** Short tracking code the customer can use at /encargo/estado. */
  code?: string
}

// Human-friendly code: no ambiguous chars (0/O, 1/I), grouped like DAH-7K2Q.
function makeTrackingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `DAH-${s.slice(0, 3)}${s.slice(3)}`
}

const RATE_WINDOW_MS = 60_000 // 1 minute
const RATE_MAX = 3            // 3 submissions per minute por IP+email

const MAX = {
  name: 80,
  email: 120,
  whatsapp: 40,
  tipo: 40,
  talle: 8,
  message: 1500,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
// Strip ASCII control chars (0x00-0x1F + 0x7F) to defend against bizarre input.
const CTRL_CHARS = new RegExp(
  '[' + String.fromCharCode(0) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']',
  'g'
)

function clean(s: unknown, max: number): string {
  if (typeof s !== 'string') return ''
  return s.replace(CTRL_CHARS, '').trim().slice(0, max)
}

// Fire owner + customer notifications without ever breaking the save (no-ops
// until the email env vars are set). Shared by both insert paths.
async function safeNotify(p: {
  name: string; email: string; contact: string; tipo: string; talle: string; message: string; code?: string
}): Promise<void> {
  try {
    await notifyNewEncargo({
      name: p.name,
      email: p.email || null,
      contact: p.contact,
      garmentType: p.tipo,
      size: p.talle || null,
      message: p.message || null,
      trackingCode: p.code,
    })
  } catch (e) {
    console.error('encargo notification failed (encargo saved OK)', e)
  }
}

export async function submitEncargo(form: FormData): Promise<EncargoSubmission> {
  const name = clean(form.get('name'), MAX.name)
  const email = clean(form.get('email'), MAX.email)
  const whatsapp = clean(form.get('whatsapp'), MAX.whatsapp)
  const tipo = clean(form.get('tipo'), MAX.tipo)
  const talle = clean(form.get('talle'), MAX.talle)
  const message = clean(form.get('message'), MAX.message)
  // Atribución de canal — opcional, capturada en el navegador (ver
  // src/lib/attribution.ts). Nunca bloquea el envío del encargo.
  const utmSource = clean(form.get('utm_source'), 100) || null
  const utmMedium = clean(form.get('utm_medium'), 100) || null
  const utmCampaign = clean(form.get('utm_campaign'), 100) || null
  const referrerHost = clean(form.get('referrer_host'), 200) || null

  if (name.length < 2) return { ok: false, error: 'El nombre es requerido.' }
  // Contact: email OR WhatsApp (at least one). Many clients only use WhatsApp,
  // so don't force an email. Validate email format only when one is given.
  const hasWhatsapp = whatsapp.replace(/\D/g, '').length >= 6
  const hasEmail = email.length > 0
  if (!hasEmail && !hasWhatsapp) {
    return { ok: false, error: 'Dejanos un mail o un WhatsApp para responderte.' }
  }
  if (hasEmail && !EMAIL_RE.test(email)) {
    return { ok: false, error: 'El email no es válido.' }
  }
  if (!tipo) return { ok: false, error: 'Elegí qué querés tejer.' }

  const TIPOS = new Set(['Cardigan', 'Top', 'Set', 'Otro'])
  const TALLES = new Set(['XS', 'S', 'M', 'L', 'XL', ''])
  if (!TIPOS.has(tipo)) return { ok: false, error: 'Tipo inválido.' }
  if (!TALLES.has(talle)) return { ok: false, error: 'Talle inválido.' }

  const h = await headers()
  const ip = getClientIp(h)
  if (!checkRateLimit(`encargo:${ip}|${email || whatsapp || 'anon'}`, { windowMs: RATE_WINDOW_MS, max: RATE_MAX })) {
    return { ok: false, error: 'Demasiados envíos seguidos. Esperá un minuto y volvé a intentar.' }
  }

  try {
    const supabase = await createClient()
    const code = makeTrackingCode()
    const { error } = await supabase.from('custom_orders').insert({
      customer_name: name,
      customer_email: email,
      whatsapp: whatsapp || null,
      garment_type: tipo,
      size: talle || null,
      message: message || null,
      status: 'new',
      tracking_code: code,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      referrer_host: referrerHost,
    })
    if (error) {
      // Si falta tracking_code y/o las columnas de atribución (migración no
      // corrida), reintentamos sin lo que falte — el encargo se guarda igual.
      // PGRST204 es el código real que devuelve Supabase para "columna
      // inexistente" en un insert (verificado en vivo 22/08) — el chequeo por
      // mensaje ya alcanzaba, esto es una segunda red de seguridad.
      const missingColumn = error.code === 'PGRST204' || (typeof error.message === 'string'
        && /tracking_code|utm_source|utm_medium|utm_campaign|referrer_host/.test(error.message))
      if (missingColumn) {
        const retry = await supabase.from('custom_orders').insert({
          customer_name: name, customer_email: email, whatsapp: whatsapp || null,
          garment_type: tipo, size: talle || null, message: message || null, status: 'new',
        })
        if (retry.error) {
          console.error('encargo insert error (retry)', retry.error)
          await reportSystemError('encargo insert (retry)', retry.error)
          return { ok: false, error: 'No pudimos guardar tu encargo. Intentá de nuevo.' }
        }
        await safeNotify({ name, email, contact: email || whatsapp, tipo, talle, message })
        return { ok: true }
      }
      console.error('encargo insert error', error)
      await reportSystemError('encargo insert', error)
      return { ok: false, error: 'No pudimos guardar tu encargo. Intentá de nuevo.' }
    }
    await safeNotify({ name, email, contact: email || whatsapp, tipo, talle, message, code })
    return { ok: true, code }
  } catch (e) {
    console.error('encargo unexpected error', e)
    await reportSystemError('encargo submit', e)
    return { ok: false, error: 'Error inesperado. Intentá de nuevo en un momento.' }
  }
}

export type EncargoStatus = 'new' | 'replied' | 'in_progress' | 'done' | 'cancelled'

export interface EncargoStatusResult {
  found: boolean
  status?: EncargoStatus
  name?: string
  createdAt?: string
  updatedAt?: string
  error?: string
}

// Public status lookup by tracking code. Uses the SECURITY DEFINER RPC
// (get_order_status) so the anon client only ever sees the safe fields.
//
// Seguridad (auditoría 2026-08): a diferencia de submitEncargo (arriba), esta
// función no tenía ningún límite de intentos — permitía scriptear la
// enumeración de tracking codes (nombre de pila + estado por cada código
// adivinado). El espacio de códigos es grande (32^6), así que fuerza bruta
// completa no es práctica, pero igual cerramos el agujero: mismo límite que
// el resto de los formularios públicos de este archivo.
const LOOKUP_RATE_WINDOW_MS = 60_000
const LOOKUP_RATE_MAX = 10

export async function lookupEncargo(rawCode: string): Promise<EncargoStatusResult> {
  const code = clean(rawCode, 16).toUpperCase()
  if (code.length < 6) return { found: false, error: 'Ingresá un código válido (ej. DAH-AB2CDE).' }

  const h = await headers()
  const ip = getClientIp(h)
  if (!checkRateLimit(`encargo-lookup:${ip}`, { windowMs: LOOKUP_RATE_WINDOW_MS, max: LOOKUP_RATE_MAX })) {
    return { found: false, error: 'Demasiados intentos. Esperá un minuto y volvé a intentar.' }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_order_status', { p_code: code })
    if (error) {
      console.error('lookupEncargo rpc error', error)
      return { found: false, error: 'No pudimos buscar tu encargo ahora. Probá de nuevo en un momento.' }
    }
    const row = Array.isArray(data) ? data[0] : data
    if (!row) return { found: false }
    return {
      found: true,
      status: row.status as EncargoStatus,
      name: row.customer_name as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }
  } catch (e) {
    console.error('lookupEncargo unexpected', e)
    return { found: false, error: 'Error inesperado. Probá de nuevo.' }
  }
}
