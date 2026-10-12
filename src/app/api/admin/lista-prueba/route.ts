import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/require-admin'
import { getCatalog } from '@/lib/catalog'
import { SITE_URL } from '@/lib/env'
import { parseDropDateUY, dropWhenText } from '@/lib/drop-date'
import { listaConfigured, sendToList, welcomeMail, dropEarlyAccessMail } from '@/lib/email/lista'

export const dynamic = 'force-dynamic'

/**
 * "Mandarme una prueba" (12/10/2026, /admin/suscriptores): manda a la casilla
 * del admin logueado los dos mails de la lista tal como le llegan a una
 * clienta (bienvenida + aviso del drop con lo cargado hoy en Configuración).
 * Sirve para ver cómo se ven y si caen en la bandeja principal o en spam.
 */
export async function POST() {
  const supabase = await createClient()
  const user = await getAdminUser(supabase)
  if (!user?.email) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!listaConfigured()) {
    return NextResponse.json({ error: 'Falta configurar el envío: RESEND_API_KEY, EMAIL_FROM y CRON_SECRET en Netlify.' }, { status: 500 })
  }
  const { settings } = await getCatalog()
  const name = (settings.drop_name ?? '').trim() || 'Nombre del drop'
  const launch = parseDropDateUY(settings.drop_date) ?? new Date(Date.now() + 86_400_000)
  const slug = (settings.drop_collection_slug ?? '').trim()
  const url = slug ? `${SITE_URL}/colecciones/${slug}` : `${SITE_URL}/tienda`
  const when = dropWhenText(launch)

  const mails = [
    (e: string) => welcomeMail(e, { name, whenText: when }),
    (e: string) => dropEarlyAccessMail(e, { name, teaser: (settings.drop_teaser ?? '').trim() || undefined, url, whenText: when }),
  ]
  let sent = 0
  let error: string | undefined
  for (const [i, build] of mails.entries()) {
    const r = await sendToList([user.email], (e) => {
      const m = build(e)
      return { ...m, subject: `[Prueba] ${m.subject}` }
    }, `prueba:${user.email}:${i}:${Date.now()}`)
    sent += r.sent
    error = error ?? r.error
  }
  return sent === 2
    ? NextResponse.json({ ok: true, to: user.email })
    : NextResponse.json({ error: error ?? 'No se pudo mandar' }, { status: 500 })
}
