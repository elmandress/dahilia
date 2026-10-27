import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendToList } from '@/lib/email/lista'
import { loadDropPlan, buildDropMail } from '@/lib/email/lista-drop'

export const dynamic = 'force-dynamic'

/**
 * Aviso automático a la lista privada (12/10/2026): 24 horas antes de la fecha
 * del drop (Configuración → Próximo drop), un mail a cada persona de la lista
 * con el link a la tanda. Es la promesa de la lista ("la ves 24 h antes").
 *
 * Lo llama .github/workflows/lista-privada.yml cada hora, con el mismo
 * CRON_SECRET que el resumen diario. Se manda UNA vez por drop (nombre +
 * fecha quedan anotados en site_settings.lista_email_enviado); cambiar la
 * fecha o el nombre arma un envío nuevo.
 *
 * No manda si:
 *  - el envío automático no está activado en /admin/suscriptores (27/10/2026:
 *    el texto ahora se edita ahí, y no puede salir antes de que Anush lo apruebe);
 *  - faltan datos del drop o ya pasó la fecha (un "24 h antes" tarde no sirve);
 *  - el drop apunta a una colección que todavía no está abierta (el link
 *    daría 404): espera, y lo deja escrito en lista_email_estado para el admin.
 *
 * Cada pasada anota lista_cron_visto: el panel muestra cuándo pasó el reloj por
 * última vez, que es la única forma de saber desde el sitio que la Action de
 * GitHub (y su CRON_SECRET) andan.
 */

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const a = Buffer.from(req.headers.get('authorization') || '')
  const b = Buffer.from(`Bearer ${secret}`)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const db = createAdminClient()
  if (!db) return NextResponse.json({ error: 'Falta SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 })

  const upsert = async (pairs: Record<string, string>) => {
    const now = new Date().toISOString()
    await db.from('site_settings').upsert(
      Object.entries(pairs).map(([key, value]) => ({ key, value, updated_at: now })),
      { onConflict: 'key' },
    )
  }
  const setStatus = (estado: string, enviado?: string) =>
    upsert({ lista_email_estado: estado, ...(enviado ? { lista_email_enviado: enviado } : {}) })

  await upsert({ lista_cron_visto: new Date().toISOString() })

  let plan
  try {
    plan = await loadDropPlan(db)
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'site_settings' }, { status: 500 })
  }
  if (!plan.name || !plan.launch || !plan.sendAt) return NextResponse.json({ ok: true, skipped: 'sin drop configurado' })

  const now = Date.now()
  if (now < plan.sendAt.getTime()) return NextResponse.json({ ok: true, skipped: 'todavía no', sendsAt: plan.sendAt.toISOString() })
  if (now >= plan.launch.getTime()) return NextResponse.json({ ok: true, skipped: 'el drop ya salió' })
  if (plan.alreadySent) return NextResponse.json({ ok: true, skipped: 'ya enviado' })

  if (!plan.auto) {
    await setStatus(`Ya es hora de mandar el aviso de «${plan.name}», pero el envío automático está en pausa. Revisá el texto y activalo en Lista VIP.`)
    return NextResponse.json({ ok: true, skipped: 'envío automático en pausa' })
  }
  if (plan.problems.length > 0) {
    await setStatus(`El aviso de «${plan.name}» está esperando: ${plan.problems.join(' ')} Apenas se resuelva, sale solo.`)
    return NextResponse.json({ ok: true, skipped: 'problemas', problems: plan.problems })
  }

  const { data: subs, error } = await db.from('subscribers').select('email').is('unsubscribed_at', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const emails = [...new Set(((subs ?? []) as Array<{ email: string }>).map((r) => r.email.trim().toLowerCase()).filter(Boolean))]
  if (emails.length === 0) {
    await setStatus('No hay nadie en la lista todavía: el aviso del drop no tuvo a quién ir.', plan.sentKey)
    return NextResponse.json({ ok: true, skipped: 'lista vacía' })
  }

  const result = await sendToList(emails, (email) => buildDropMail(email, plan), `drop:${plan.sentKey}`)
  const stamp = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })
  if (result.sent > 0) {
    await setStatus(`Aviso de «${plan.name}» enviado a ${result.sent} persona(s) el ${stamp}${result.failed ? ` (${result.failed} fallaron: ${result.error})` : ''}.${result.usedFallbackFrom ? ' Salió desde hola@dahila.uy porque el remitente de Netlify (EMAIL_FROM) no está verificado en Resend: conviene corregirlo.' : ''}`, plan.sentKey)
  } else {
    await setStatus(`No se pudo mandar el aviso de «${plan.name}»: ${result.error ?? 'error desconocido'}. Se reintenta en una hora.`)
  }
  return NextResponse.json({ ok: result.sent > 0, ...result })
}
