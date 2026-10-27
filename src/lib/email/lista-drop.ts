import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { SITE_URL } from '@/lib/env'
import { parseDropDateUY, dropDateHasTime, dropWhenText } from '@/lib/drop-date'
import { DROP_COPY_DEFAULTS, type DropCopyKey } from '@/lib/lista-copy'
import { listaConfigured, dropEarlyAccessMail, type ListaMail } from './lista'

// ─────────────────────────────────────────────────────────────
// El aviso del drop a la lista privada, en un solo lugar (27/10/2026). Lo usan
// el envío automático (api/cron/lista-privada), la prueba y la verificación
// del panel (api/admin/lista-prueba): los tres leen la base en el momento —
// nunca el catálogo cacheado, que podía mandar en la prueba un texto viejo
// recién editado — y arman el mail con la misma función.
// ─────────────────────────────────────────────────────────────

/** Casilla real de Dahila para las pruebas (la del login del admin es ficticia). */
export const TEST_RECIPIENT = 'floralcrochet12@gmail.com'


const KEYS = [
  'drop_enabled', 'drop_name', 'drop_date', 'drop_teaser', 'drop_collection_slug',
  'lista_email_enviado', 'lista_email_estado', 'lista_envio_auto', 'lista_cron_visto',
  ...Object.keys(DROP_COPY_DEFAULTS),
]

export interface DropPlan {
  name: string
  rawDate: string
  launch: Date | null
  hasTime: boolean
  sendAt: Date | null
  /** Link del botón del mail. */
  url: string
  slug: string
  /** Texto de expectativa de Configuración ({adelanto} en el mail). */
  teaser: string
  collection: { name: string; published: boolean; unlisted: boolean } | null
  sentKey: string
  alreadySent: boolean
  /** Envío automático activado desde el panel (sin activar, el cron no manda). */
  auto: boolean
  copy: Record<DropCopyKey, string>
  status: string
  cronSeen: string | null
  /** Lo que impide mandar el aviso a la lista hoy (vacío = listo). */
  problems: string[]
}

export async function loadDropPlan(db: SupabaseClient): Promise<DropPlan> {
  const { data: rows, error } = await db.from('site_settings').select('key, value').in('key', KEYS)
  if (error) throw new Error(`site_settings: ${error.message}`)
  const s = Object.fromEntries(((rows ?? []) as Array<{ key: string; value: string | null }>).map((r) => [r.key, r.value ?? '']))

  const enabled = s.drop_enabled !== 'false'
  const name = enabled ? (s.drop_name ?? '').trim() : ''
  const rawDate = (s.drop_date ?? '').trim()
  const launch = enabled ? parseDropDateUY(rawDate) : null
  const slug = (s.drop_collection_slug ?? '').trim()

  let collection: DropPlan['collection'] = null
  if (slug) {
    const { data: col } = await db.from('collections').select('*').eq('slug', slug).maybeSingle()
    if (col) collection = { name: col.name, published: !!col.published, unlisted: !!col.unlisted }
  }

  const problems: string[] = []
  if (!enabled) problems.push('El bloque del próximo drop está apagado en Configuración.')
  else if (!name) problems.push('Falta el nombre del drop (Configuración → Próximo drop).')
  if (enabled && !rawDate) problems.push('Falta la fecha del drop (Configuración → Próximo drop).')
  else if (enabled && !launch) problems.push(`La fecha "${rawDate}" no se entiende. Elegí de nuevo el día y la hora en Configuración → Próximo drop.`)
  if (slug && !collection) problems.push(`No hay ninguna colección con el slug "${slug}" (revisalo en Configuración → Próximo drop).`)
  else if (collection && !collection.published) {
    problems.push(`La colección «${collection.name}» todavía no está abierta: el link del mail daría error. Pasala a "Solo con link (acceso VIP)" en Colecciones.`)
  }
  if (!listaConfigured()) problems.push('Falta configurar el envío de mails en Netlify (RESEND_API_KEY, EMAIL_FROM y CRON_SECRET).')

  const sentKey = `${name}|${rawDate}`
  const copy = Object.fromEntries(
    (Object.keys(DROP_COPY_DEFAULTS) as DropCopyKey[]).map((k) => [k, (s[k] ?? '').trim() || DROP_COPY_DEFAULTS[k]]),
  ) as Record<DropCopyKey, string>

  return {
    name,
    rawDate,
    launch,
    hasTime: dropDateHasTime(rawDate),
    sendAt: launch ? new Date(launch.getTime() - 24 * 3_600_000) : null,
    url: slug && collection ? `${SITE_URL}/colecciones/${slug}` : `${SITE_URL}/tienda`,
    slug,
    teaser: (s.drop_teaser ?? '').trim(),
    collection,
    sentKey,
    alreadySent: !!name && s.lista_email_enviado === sentKey,
    auto: s.lista_envio_auto === 'true',
    copy,
    status: s.lista_email_estado ?? '',
    cronSeen: s.lista_cron_visto || null,
    problems,
  }
}

/** Reemplaza {nombre}, {cuando} y {adelanto}. Una línea que queda vacía (p. ej.
 *  {adelanto} sin texto de expectativa cargado) desaparece. */
export function fillCopy(template: string, plan: Pick<DropPlan, 'name' | 'launch' | 'teaser'>): string {
  return template
    .replace(/\{nombre\}/gi, plan.name || 'Nombre del drop')
    .replace(/\{cuando\}/gi, plan.launch ? dropWhenText(plan.launch) : 'pronto')
    .replace(/\{adelanto\}/gi, plan.teaser)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** El mail del drop para una persona, con el texto editado en el panel. */
export function buildDropMail(email: string, plan: DropPlan): ListaMail {
  return dropEarlyAccessMail(email, {
    subject: fillCopy(plan.copy.lista_drop_asunto, plan),
    heading: fillCopy(plan.copy.lista_drop_titulo, plan),
    body: fillCopy(plan.copy.lista_drop_texto, plan),
    url: plan.url,
    whenText: plan.launch ? dropWhenText(plan.launch) : 'pronto',
  })
}
