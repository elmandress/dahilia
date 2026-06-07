'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export interface EncargoSubmission {
  ok: boolean
  error?: string
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
    const { error } = await supabase.from('custom_orders').insert({
      customer_name: name,
      customer_email: email,
      whatsapp: whatsapp || null,
      garment_type: tipo,
      size: talle || null,
      message: message || null,
      status: 'new',
    })
    if (error) {
      console.error('encargo insert error', error)
      return { ok: false, error: 'No pudimos guardar tu encargo. Intentá de nuevo.' }
    }
    return { ok: true }
  } catch (e) {
    console.error('encargo unexpected error', e)
    return { ok: false, error: 'Error inesperado. Intentá de nuevo en un momento.' }
  }
}
