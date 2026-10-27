import 'server-only'
import { createHmac, timingSafeEqual, createHash } from 'node:crypto'
import { SITE_URL } from '@/lib/env'
import { renderEmail, paragraph, escapeHtml } from './render'
import { VERIFIED_FROM, isUnverifiedDomain } from './from'

// ─────────────────────────────────────────────────────────────
// Mails a la lista privada (12/10/2026): bienvenida al anotarse y aviso
// automático 24 h antes de cada drop.
//
// Para que no caigan en spam (reglas de Gmail/Yahoo/Microsoft vigentes):
//  - Dominio autenticado: sale de EMAIL_FROM_LISTA o, si no está, de EMAIL_FROM
//    (dahila.uy, verificado en Resend con SPF/DKIM). Lo ideal es un
//    subdominio solo para la lista (p. ej. lista@novedades.dahila.uy) para
//    que su reputación no toque la de los mails de encargos.
//  - Baja en un clic (RFC 8058): List-Unsubscribe con URL https +
//    List-Unsubscribe-Post. Gmail la muestra como "Anular suscripción" arriba
//    del mail; la baja se aplica en el momento.
//  - Un mail por persona (nunca CCO), con versión en texto plano.
//  - Reply-To a una persona real: "respondé y te sacamos" es verdad.
// ─────────────────────────────────────────────────────────────

const BATCH_ENDPOINT = 'https://api.resend.com/emails/batch'

function secret(): string | null {
  const s = process.env.CRON_SECRET
  return s ? `lista-baja:${s}` : null
}

/** Firma del email: el link de baja no se puede fabricar para otra persona. */
export function unsubscribeToken(email: string): string | null {
  const key = secret()
  if (!key) return null
  return createHmac('sha256', key).update(email.trim().toLowerCase()).digest('base64url').slice(0, 32)
}

export function verifyUnsubscribe(email: string, token: string): boolean {
  const expected = unsubscribeToken(email)
  if (!expected || !token) return false
  const a = Buffer.from(expected)
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function unsubscribeUrl(email: string): string | null {
  const t = unsubscribeToken(email)
  if (!t) return null
  return `${SITE_URL}/baja?e=${encodeURIComponent(email)}&t=${t}`
}

/** Endpoint de baja en un clic (POST sin confirmación, lo llama Gmail). */
function oneClickUrl(email: string): string | null {
  const t = unsubscribeToken(email)
  if (!t) return null
  return `${SITE_URL}/api/lista/baja?e=${encodeURIComponent(email)}&t=${t}`
}

export function listaConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && (process.env.EMAIL_FROM_LISTA || process.env.EMAIL_FROM) && process.env.CRON_SECRET)
}

export interface ListaMail { subject: string; html: string; text: string }

/**
 * Manda el mismo mail a varias personas, uno por persona, en lotes de 100
 * (límite del batch de Resend). `idempotencyBase` evita duplicados si el
 * cron se reintenta: el mismo lote con la misma clave no se manda dos veces.
 */
export async function sendToList(
  emails: string[],
  build: (email: string) => ListaMail,
  idempotencyBase: string,
): Promise<{ sent: number; failed: number; error?: string; usedFallbackFrom?: boolean }> {
  const apiKey = process.env.RESEND_API_KEY
  let from = process.env.EMAIL_FROM_LISTA || process.env.EMAIL_FROM
  if (!apiKey || !from || !secret()) return { sent: 0, failed: emails.length, error: 'Faltan RESEND_API_KEY, EMAIL_FROM o CRON_SECRET.' }
  const replyTo = process.env.OWNER_NOTIFICATION_EMAIL

  let sent = 0
  let failed = 0
  let lastError: string | undefined
  let usedFallbackFrom = false
  for (let i = 0; i < emails.length; i += 100) {
    const chunk = emails.slice(i, i + 100)
    const payload = () => chunk.map((to) => {
      const mail = build(to)
      const oneClick = oneClickUrl(to)!
      return {
        from,
        to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        ...(replyTo ? { reply_to: replyTo } : {}),
        headers: {
          'List-Unsubscribe': `<${oneClick}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      }
    })
    try {
      const post = (key: string) => fetch(BATCH_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': createHash('sha256').update(key).digest('hex').slice(0, 48),
        },
        body: JSON.stringify(payload()),
      })
      let res = await post(`${idempotencyBase}:${i}`)
      let detail = res.ok ? '' : await res.text().catch(() => '')
      // Remitente con dominio sin verificar en Resend → una vez más desde
      // dahila.uy (ver from.ts). Clave nueva: la anterior quedó usada por el 403.
      if (!res.ok && from !== VERIFIED_FROM && isUnverifiedDomain(res.status, detail)) {
        console.error('[lista] remitente sin verificar, uso el de respaldo:', from)
        from = VERIFIED_FROM
        usedFallbackFrom = true
        res = await post(`${idempotencyBase}:${i}:respaldo`)
        detail = res.ok ? '' : await res.text().catch(() => '')
      }
      if (res.ok) sent += chunk.length
      else {
        failed += chunk.length
        lastError = `HTTP ${res.status}: ${detail.slice(0, 200)}`
      }
    } catch (e) {
      failed += chunk.length
      lastError = e instanceof Error ? e.message : 'error de red'
    }
  }
  return { sent, failed, error: lastError, usedFallbackFrom }
}

function footer(email: string): string {
  const url = unsubscribeUrl(email)
  return `Recibís esto porque te anotaste en la lista privada de Dahila.${url ? ` <a href="${escapeHtml(url)}" style="color:#8F3B53;">Darte de baja</a>.` : ''}`
}

function textFooter(email: string): string {
  const url = unsubscribeUrl(email)
  return `\n\n—\nDahila Crochet · Hecho a mano en Montevideo\nRecibís esto porque te anotaste en la lista privada.${url ? `\nDarte de baja: ${url}` : ''}`
}

/** Bienvenida: confirma que entró y qué va a recibir (y nada más). */
export function welcomeMail(email: string, nextDrop?: { name: string; whenText?: string }): ListaMail {
  const subject = 'Estás en la lista privada de Dahila'
  const next = nextDrop?.name
    ? `La próxima tanda, «${nextDrop.name}»${nextDrop.whenText ? `, sale ${nextDrop.whenText}` : ''}. Te escribimos 24 horas antes de que llegue a la tienda.`
    : 'Cuando haya una tanda nueva, te escribimos 24 horas antes de que llegue a la tienda.'
  const html = renderEmail({
    preheader: 'Cada tanda nueva la ves 24 horas antes que nadie.',
    heading: 'Ya estás adentro',
    intro: escapeHtml('Gracias por anotarte. Cada tanda de Dahila es chica y se teje a mano, una pieza por vez.'),
    bodyHtml: paragraph(next) + paragraph('Solo te escribimos cuando hay algo nuevo. Si en algún momento no querés más, respondé este mail o usá el link de abajo.'),
    button: { label: 'Mirar lo que ya está', url: `${SITE_URL}/tienda?utm_source=lista&utm_medium=email&utm_campaign=bienvenida` },
    footerNote: footer(email),
  })
  const text = `Ya estás adentro.\n\nGracias por anotarte. Cada tanda de Dahila es chica y se teje a mano, una pieza por vez.\n\n${next}\n\nSolo te escribimos cuando hay algo nuevo.\n\nMirar lo que ya está: ${SITE_URL}/tienda${textFooter(email)}`
  return { subject, html, text }
}

/** Acceso anticipado: 24 h antes del drop. Asunto, título y cuerpo vienen ya
 *  armados del texto que Anush edita en /admin/suscriptores (lista-drop.ts). */
export function dropEarlyAccessMail(
  email: string,
  drop: { subject: string; heading: string; body: string; url: string; whenText: string },
): ListaMail {
  const link = `${drop.url}${drop.url.includes('?') ? '&' : '?'}utm_source=lista&utm_medium=email&utm_campaign=acceso-anticipado`
  // Línea en blanco = párrafo nuevo; salto simple = salto de línea. Todo escapado.
  const paragraphs = drop.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  const bodyHtml = paragraphs.map((p) => paragraph(p).replace(/\n/g, '<br>')).join('')
  const html = renderEmail({
    preheader: `Llega a la tienda ${drop.whenText}. Para la lista, ya está.`,
    heading: drop.heading,
    bodyHtml,
    button: { label: 'Ver la tanda', url: link },
    footerNote: footer(email),
  })
  const text = `${drop.heading}\n\n${paragraphs.join('\n\n')}\n\nVer la tanda: ${link}${textFooter(email)}`
  return { subject: drop.subject, html, text }
}
