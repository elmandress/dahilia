import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_URL } from '@/lib/env'
import { parseDropDateUY, dropWhenText } from '@/lib/drop-date'
import { sendToList, dropEarlyAccessMail, listaConfigured } from '@/lib/email/lista'

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
 *  - faltan datos del drop o ya pasó la fecha (un "24 h antes" tarde no sirve);
 *  - el drop apunta a una colección que todavía no está publicada (el link
 *    daría 404): espera, y lo deja escrito en lista_email_estado para el admin.
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

  const { data: rows } = await db
    .from('site_settings')
    .select('key, value')
    .in('key', ['drop_enabled', 'drop_name', 'drop_date', 'drop_teaser', 'drop_collection_slug', 'lista_email_enviado'])
  const s = Object.fromEntries(((rows ?? []) as Array<{ key: string; value: string | null }>).map((r) => [r.key, r.value ?? '']))

  const setStatus = async (estado: string, enviado?: string) => {
    const now = new Date().toISOString()
    const upserts = [{ key: 'lista_email_estado', value: estado, updated_at: now }]
    if (enviado) upserts.push({ key: 'lista_email_enviado', value: enviado, updated_at: now })
    await db.from('site_settings').upsert(upserts, { onConflict: 'key' })
  }

  const name = (s.drop_name ?? '').trim()
  const launch = parseDropDateUY(s.drop_date)
  if (s.drop_enabled === 'false' || !name || !launch) return NextResponse.json({ ok: true, skipped: 'sin drop configurado' })

  const now = Date.now()
  const sendFrom = launch.getTime() - 24 * 3_600_000
  if (now < sendFrom) return NextResponse.json({ ok: true, skipped: 'todavía no', sendsAt: new Date(sendFrom).toISOString() })
  if (now >= launch.getTime()) return NextResponse.json({ ok: true, skipped: 'el drop ya salió' })

  const sentKey = `${name}|${s.drop_date}`
  if (s.lista_email_enviado === sentKey) return NextResponse.json({ ok: true, skipped: 'ya enviado' })
  if (!listaConfigured()) {
    await setStatus('No se pudo mandar el aviso del drop: falta configurar el envío de mails (RESEND_API_KEY / EMAIL_FROM).')
    return NextResponse.json({ error: 'mail no configurado' }, { status: 500 })
  }

  // Link: la colección (publicada, aunque sea "solo con link") o la tienda.
  let url = `${SITE_URL}/tienda`
  const slug = (s.drop_collection_slug ?? '').trim()
  if (slug) {
    const { data: col } = await db.from('collections').select('slug, published').eq('slug', slug).maybeSingle()
    if (!col?.published) {
      await setStatus(`El aviso a la lista está esperando: la colección "${slug}" todavía no está publicada (puede ser "solo con link"). Apenas la publiques, sale solo.`)
      return NextResponse.json({ ok: true, skipped: 'colección sin publicar' })
    }
    url = `${SITE_URL}/colecciones/${col.slug}`
  }

  const { data: subs, error } = await db.from('subscribers').select('email').is('unsubscribed_at', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const emails = [...new Set(((subs ?? []) as Array<{ email: string }>).map((r) => r.email.trim().toLowerCase()).filter(Boolean))]
  if (emails.length === 0) {
    await setStatus('No hay nadie en la lista todavía: el aviso del drop no tuvo a quién ir.', sentKey)
    return NextResponse.json({ ok: true, skipped: 'lista vacía' })
  }

  const whenText = dropWhenText(launch)
  const teaser = (s.drop_teaser ?? '').trim() || undefined
  const result = await sendToList(emails, (email) => dropEarlyAccessMail(email, { name, teaser, url, whenText }), `drop:${sentKey}`)
  const stamp = new Date().toLocaleString('es-UY', { timeZone: 'America/Montevideo' })
  if (result.sent > 0) {
    await setStatus(`Aviso de «${name}» enviado a ${result.sent} persona(s) el ${stamp}${result.failed ? ` (${result.failed} fallaron: ${result.error})` : ''}.`, sentKey)
  } else {
    await setStatus(`No se pudo mandar el aviso de «${name}»: ${result.error ?? 'error desconocido'}. Se reintenta en una hora.`)
  }
  return NextResponse.json({ ok: result.sent > 0, ...result })
}
