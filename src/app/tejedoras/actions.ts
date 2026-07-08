'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notifyWeaverApplication, reportSystemError } from '@/lib/email'

export interface TejedoraSubmission {
  ok: boolean
  error?: string
}

// Same crude in-process rate limiter as the encargo form: enough to stop
// honest double-submits at current scale (see encargo/actions.ts for caveats).
const submissionLog = new Map<string, number[]>()
const RATE_WINDOW_MS = 60_000
const RATE_MAX = 3

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
  if (submissionLog.size > 1000) {
    for (const [k, ts] of submissionLog) {
      if (ts.every((t) => now - t > RATE_WINDOW_MS)) submissionLog.delete(k)
    }
  }
  return true
}

const MAX = {
  name: 80,
  location: 60,
  whatsapp: 40,
  email: 120,
  skills: 200,
  portfolio: 400,
  message: 1500,
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const CTRL_CHARS = new RegExp(
  '[' + String.fromCharCode(0) + '-' + String.fromCharCode(31) + String.fromCharCode(127) + ']',
  'g'
)

function clean(s: unknown, max: number): string {
  if (typeof s !== 'string') return ''
  return s.replace(CTRL_CHARS, '').trim().slice(0, max)
}

const EXPERIENCIAS = new Set(['<1', '1-3', '3-5', '5+'])
const DISPONIBILIDADES = new Set(['<5 h', '5-10 h', '10-20 h', '20+ h'])

export async function submitTejedora(form: FormData): Promise<TejedoraSubmission> {
  const name = clean(form.get('name'), MAX.name)
  const location = clean(form.get('location'), MAX.location)
  const whatsapp = clean(form.get('whatsapp'), MAX.whatsapp)
  const email = clean(form.get('email'), MAX.email)
  const experience = clean(form.get('experience'), 8)
  const skills = clean(form.get('skills'), MAX.skills)
  const availability = clean(form.get('availability'), 12)
  const hasMaterials = form.get('has_materials') === 'true'
  const portfolio = clean(form.get('portfolio'), MAX.portfolio)
  const message = clean(form.get('message'), MAX.message)

  if (name.length < 2) return { ok: false, error: 'Contanos cómo te llamás.' }
  const hasWhatsapp = whatsapp.replace(/\D/g, '').length >= 6
  const hasEmail = email.length > 0
  if (!hasEmail && !hasWhatsapp) {
    return { ok: false, error: 'Dejanos un WhatsApp o un mail para responderte.' }
  }
  if (hasEmail && !EMAIL_RE.test(email)) {
    return { ok: false, error: 'El email no es válido.' }
  }
  if (experience && !EXPERIENCIAS.has(experience)) return { ok: false, error: 'Experiencia inválida.' }
  if (availability && !DISPONIBILIDADES.has(availability)) return { ok: false, error: 'Disponibilidad inválida.' }
  if (!skills) return { ok: false, error: 'Contanos qué sabés tejer.' }
  if (!portfolio && !message) {
    return { ok: false, error: 'Dejanos links o una descripción de tus trabajos — es lo primero que miramos.' }
  }

  const h = await headers()
  const ip = getClientIp(h)
  if (!checkRateLimit(`${ip}|${email || whatsapp || 'anon'}`)) {
    return { ok: false, error: 'Demasiados envíos seguidos. Esperá un minuto y volvé a intentar.' }
  }

  try {
    const supabase = await createClient()
    const { error } = await supabase.from('weaver_applications').insert({
      name,
      location: location || null,
      whatsapp: whatsapp || null,
      email: email || null,
      experience: experience || null,
      skills,
      availability: availability || null,
      has_materials: hasMaterials,
      portfolio: portfolio || null,
      message: message || null,
      status: 'new',
    })
    if (error) {
      console.error('tejedora insert error', error)
      await reportSystemError('tejedora insert', error)
      return { ok: false, error: 'No pudimos guardar tu postulación. Probá de nuevo o escribinos por WhatsApp.' }
    }
    // Owner notification is best-effort; the application is already saved.
    try {
      await notifyWeaverApplication({
        name,
        location: location || null,
        contact: whatsapp || email,
        experience: experience || null,
        skills,
        availability: availability || null,
        hasMaterials,
        portfolio: portfolio || null,
        message: message || null,
      })
    } catch (e) {
      console.error('tejedora notification failed (application saved OK)', e)
    }
    return { ok: true }
  } catch (e) {
    console.error('tejedora unexpected error', e)
    await reportSystemError('tejedora submit', e)
    return { ok: false, error: 'Error inesperado. Probá de nuevo en un momento.' }
  }
}
