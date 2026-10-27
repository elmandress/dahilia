import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/require-admin'
import { dropWhenText } from '@/lib/drop-date'
import { listaConfigured, sendToList, welcomeMail } from '@/lib/email/lista'
import { loadDropPlan, buildDropMail, TEST_RECIPIENT, type DropPlan } from '@/lib/email/lista-drop'

export const dynamic = 'force-dynamic'

/**
 * Panel de la lista VIP (/admin/suscriptores):
 *
 * GET — "¿Va a salir bien?": arma el aviso del drop para CADA persona de la
 * lista exactamente como lo haría el envío automático, pero sin mandar nada.
 * Devuelve el plan (fecha entendida, colección, a cuántas personas), lo que
 * falta resolver y una muestra del mail.
 *
 * POST — "Mandar una prueba": los dos mails de la lista (bienvenida + aviso del
 * drop con el texto guardado en el panel) a una sola casilla. Por defecto la
 * de Dahila: la del login del admin es ficticia y la prueba no le llegaba a
 * nadie (27/10/2026).
 *
 * Los dos leen la base en el momento (no el catálogo cacheado): un texto
 * recién guardado tiene que verse en la prueba siguiente.
 */

async function admin() {
  const supabase = await createClient()
  const user = await getAdminUser(supabase)
  return user ? supabase : null
}

function summary(plan: DropPlan) {
  return {
    name: plan.name,
    rawDate: plan.rawDate,
    launchText: plan.launch ? dropWhenText(plan.launch) : null,
    launchAt: plan.launch?.toISOString() ?? null,
    hasTime: plan.hasTime,
    sendAtText: plan.sendAt ? dropWhenText(plan.sendAt) : null,
    sendAt: plan.sendAt?.toISOString() ?? null,
    url: plan.url,
    slug: plan.slug,
    collection: plan.collection,
    alreadySent: plan.alreadySent,
    auto: plan.auto,
    copy: plan.copy,
    status: plan.status,
    cronSeen: plan.cronSeen,
    problems: plan.problems,
  }
}

export async function GET() {
  const supabase = await admin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  try {
    const plan = await loadDropPlan(supabase)
    const { data: subs, error } = await supabase.from('subscribers').select('email').is('unsubscribed_at', null)
    if (error) throw new Error(`subscribers: ${error.message}`)
    const emails = [...new Set(((subs ?? []) as Array<{ email: string }>).map((r) => r.email.trim().toLowerCase()).filter(Boolean))]

    // Ensayo completo: el mail de cada persona, con su link de baja propio.
    const invalid: string[] = []
    let built = 0
    for (const e of emails) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { invalid.push(e); continue }
      const m = buildDropMail(e, plan)
      if (m.subject && m.html && m.text) built++
    }
    const sample = buildDropMail(TEST_RECIPIENT, plan)
    return NextResponse.json({
      ok: true,
      plan: summary(plan),
      recipients: emails.length,
      built,
      invalid,
      sample: { subject: sample.subject, text: sample.text },
    })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'No se pudo revisar' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const supabase = await admin()
  if (!supabase) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!listaConfigured()) {
    return NextResponse.json({ error: 'Falta configurar el envío: RESEND_API_KEY, EMAIL_FROM y CRON_SECRET en Netlify.' }, { status: 500 })
  }
  const body = (await req.json().catch(() => null)) as { to?: unknown } | null
  const to = (typeof body?.to === 'string' && body.to.trim() ? body.to : TEST_RECIPIENT).trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to) || to.length > 200) {
    return NextResponse.json({ error: 'Ese mail no parece válido.' }, { status: 400 })
  }

  let plan: DropPlan
  try {
    plan = await loadDropPlan(supabase)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'No se pudo leer la configuración' }, { status: 500 })
  }
  const whenText = plan.launch ? dropWhenText(plan.launch) : undefined
  const mails = [
    (e: string) => welcomeMail(e, { name: plan.name || 'Nombre del drop', whenText }),
    (e: string) => buildDropMail(e, plan),
  ]
  let sent = 0
  let error: string | undefined
  let fallback = false
  for (const [i, build] of mails.entries()) {
    const r = await sendToList([to], (e) => {
      const m = build(e)
      return { ...m, subject: `[Prueba] ${m.subject}` }
    }, `prueba:${to}:${i}:${Date.now()}`)
    sent += r.sent
    error = error ?? r.error
    fallback = fallback || !!r.usedFallbackFrom
  }
  return sent === 2
    ? NextResponse.json({ ok: true, to, fallback })
    : NextResponse.json({ error: error ?? 'No se pudo mandar' }, { status: 500 })
}
