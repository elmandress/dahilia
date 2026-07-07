'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notifyNewEncargo, reportSystemError } from '@/lib/email'

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

// Crude in-process rate limiter. Survives within a single server instance only;
// good enough to stop honest mistakes (form spamming on submit) but not a distributed
// attack — that needs a Redis/Upstash bucket. Acceptable for current scale.
const submissionLog = new Map<string, number[]>()
const RATE_WINDOW_MS = 60_000 // 1 minute
const RATE_MAX = 3            // 3 submissions per minute per IP+email

function getClientIp(h: Headers): string {
  const fwd = h.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return h.get('x-real-ip') || 'unknown'
}

function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const window = submissionLog.get(key) || []
  const recent = window.filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) return false
  recent.push(now)
  submissionLog.set(key, recent)
  // Best-effort cleanup
  if (submissionLog.size > 1000) {
    for (const [k, ts] of submissionLog) {
      if (ts.every((t) => now - t > RATE_WINDOW_MS)) submissionLog.delete(k)
    }
  }
  return true
}

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
  if (!checkRateLimit(`${ip}|${email || whatsapp || 'anon'}`)) {
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
    })
    if (error) {
      // If the tracking_code column doesn't exist yet (migration not run), retry
      // without it so the encargo still saves — the customer just won't get a code.
      const missingColumn = typeof error.message === 'string' && /tracking_code/.test(error.message)
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
export async function lookupEncargo(rawCode: string): Promise<EncargoStatusResult> {
  const code = clean(rawCode, 16).toUpperCase()
  if (code.length < 6) return { found: false, error: 'Ingresá un código válido (ej. DAH-AB2CDE).' }

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
