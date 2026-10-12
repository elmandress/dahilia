import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyUnsubscribe } from '@/lib/email/lista'
import { SITE_URL } from '@/lib/env'

export const dynamic = 'force-dynamic'

/**
 * Baja de la lista privada (12/10/2026).
 *  - POST desde Gmail/Yahoo ("Anular suscripción", RFC 8058 one-click): se
 *    aplica en el momento, sin confirmación, y responde 200.
 *  - POST desde el botón de /baja (formulario): igual, y vuelve a /baja?listo=1.
 * Solo POST: un GET lo podría disparar un antivirus que "abre" los links del
 * mail para revisarlos, y daría de baja a alguien sin que lo pidiera.
 * El token es una firma del email (lib/email/lista.ts): nadie puede dar de
 * baja a otra persona fabricando el link.
 */
export async function POST(req: NextRequest) {
  const email = (req.nextUrl.searchParams.get('e') ?? '').trim().toLowerCase()
  const token = req.nextUrl.searchParams.get('t') ?? ''
  const fromForm = req.nextUrl.searchParams.get('desde') === 'web'

  if (!email || !verifyUnsubscribe(email, token)) {
    return fromForm
      ? NextResponse.redirect(`${SITE_URL}/baja?error=1`, 303)
      : NextResponse.json({ error: 'link inválido' }, { status: 400 })
  }

  const db = createAdminClient()
  if (!db) return NextResponse.json({ error: 'no disponible' }, { status: 503 })
  const { error } = await db
    .from('subscribers')
    .update({ unsubscribed_at: new Date().toISOString() })
    // ilike para no depender de mayúsculas, con % y _ escapados: en un
    // patrón son comodines, y "ana_p@" podría dar de baja a "anaxp@".
    .ilike('email', email.replace(/[\\%_]/g, (c) => `\\${c}`))
    .is('unsubscribed_at', null)
  if (error) {
    console.error('lista/baja', error)
    return fromForm
      ? NextResponse.redirect(`${SITE_URL}/baja?error=1`, 303)
      : NextResponse.json({ error: 'no se pudo' }, { status: 500 })
  }
  return fromForm
    ? NextResponse.redirect(`${SITE_URL}/baja?listo=1`, 303)
    : NextResponse.json({ ok: true })
}
