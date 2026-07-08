import { SITE_URL } from '@/lib/env'
import { renderEmail, infoTable, callout, paragraph, steps, sectionLabel, escapeHtml } from './render'

// ─── Shared data shapes ──────────────────────────────────────────────────────

export interface EncargoEmailData {
  name: string
  /** Real email address — used to send the customer their copy. */
  email?: string | null
  /** Owner-facing contact string for display (email or WhatsApp). */
  contact?: string | null
  garmentType?: string | null
  size?: string | null
  message?: string | null
  trackingCode?: string | null
}

export interface OrderEmailData {
  name: string
  email?: string | null
  items: Array<{ name: string; size?: string | null; qty: number; unitPrice?: number | null }>
  total?: number | null
  reference?: string | null
}

export interface WeaverApplicationEmailData {
  name: string
  location?: string | null
  /** Owner-facing contact string (WhatsApp or email). */
  contact?: string | null
  experience?: string | null
  skills?: string | null
  availability?: string | null
  hasMaterials?: boolean
  portfolio?: string | null
  message?: string | null
}

/** Logical customer-facing states. The DB enum maps onto a subset of these; the
 *  rest ('shipped', 'delivered') are ready for when tracking/fulfilment is added. */
export type CustomerState =
  | 'received'
  | 'replied'
  | 'in_progress'
  | 'ready'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface RenderedEmail {
  subject: string
  html: string
}

const STATUS_URL = `${SITE_URL}/encargo/estado`
const SHOP_URL = `${SITE_URL}/tienda`
const firstName = (n: string) => (n || '').trim().split(/\s+/)[0] || 'Hola'
const money = (n?: number | null) => (typeof n === 'number' ? `UYU ${n.toLocaleString('es-UY')}` : '')

// Build a wa.me link from a contact string when it looks like a phone (not email).
function waFromContact(contact?: string | null): string | null {
  const raw = (contact || '').trim()
  if (!raw || raw.includes('@')) return null
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 6) return null
  if (raw.startsWith('+') || digits.length >= 11) return `https://wa.me/${digits}`
  if (digits.startsWith('0')) return `https://wa.me/598${digits.replace(/^0+/, '')}`
  return `https://wa.me/598${digits}`
}

function nowMontevideo(): string {
  return new Date().toLocaleString('es-UY', {
    timeZone: 'America/Montevideo',
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  })
}

// ─── OWNER templates ─────────────────────────────────────────────────────────

export function ownerNewEncargo(d: EncargoEmailData): RenderedEmail {
  const wa = waFromContact(d.contact || d.email)
  const rows: Array<[string, string]> = [
    ['Recibido', nowMontevideo()],
    ['Nombre', d.name],
    ['Contacto', d.contact || d.email || '—'],
    ['Prenda', d.garmentType || '—'],
    ['Talle', d.size || '—'],
    ['Código', d.trackingCode || '—'],
    ['Mensaje', d.message || '—'],
  ]
  return {
    subject: `🧶 Nuevo encargo de ${firstName(d.name)}`,
    html: renderEmail({
      preheader: `${d.garmentType || 'Encargo'} · ${d.name} · respondé pronto`,
      heading: 'Nuevo encargo a medida',
      intro: 'Entró un pedido personalizado. Cuanto antes le respondas, más chances de cerrar la venta.',
      bodyHtml: infoTable(rows),
      // Primary action: reply to the customer on WhatsApp in one tap when we
      // have a phone; otherwise open the panel.
      button: wa
        ? { label: 'Responder por WhatsApp', url: wa }
        : { label: 'Ver en el panel', url: `${SITE_URL}/admin/encargos` },
      footerNote: wa
        ? `Ver todos los encargos en el <a href="${SITE_URL}/admin/encargos" style="color:#8F3B53;text-decoration:none;">panel</a>.`
        : 'Aviso automático del sistema de Dahila Crochet.',
    }),
  }
}

export function ownerNewOrder(d: OrderEmailData): RenderedEmail {
  const itemsHtml = d.items
    .map(
      (it) =>
        `${escapeHtml(it.name)} · talle ${escapeHtml(it.size || '—')} · x${it.qty}${it.unitPrice ? ` · ${money(it.unitPrice * it.qty)}` : ''}`
    )
    .join('<br>')
  return {
    subject: `🛍️ Nuevo pedido de ${firstName(d.name)}`,
    html: renderEmail({
      preheader: `Pedido de ${d.name}${d.total ? ` · ${money(d.total)}` : ''}`,
      heading: 'Nuevo pedido',
      intro: 'Un cliente confirmó un pedido desde la tienda.',
      bodyHtml:
        infoTable([
          ['Nombre', d.name],
          ['Contacto', d.email || '—'],
          ['Referencia', d.reference || '—'],
          ['Total', money(d.total) || '—'],
        ]) + `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1F1A1B;line-height:1.7;margin-top:6px;">${itemsHtml}</div>`,
      button: { label: 'Ver en el panel', url: `${SITE_URL}/admin` },
      footerNote: 'Aviso automático del sistema de Dahila Crochet.',
    }),
  }
}

export function ownerNewWeaverApplication(d: WeaverApplicationEmailData): RenderedEmail {
  const wa = waFromContact(d.contact)
  return {
    subject: `🧵 Nueva postulación de tejedora: ${firstName(d.name)}`,
    html: renderEmail({
      preheader: `${d.name} · ${d.location || 'Uruguay'} · ${d.experience || '—'} de experiencia`,
      heading: 'Nueva postulación de tejedora',
      intro: 'Alguien quiere tejer con Dahila. Revisá sus trabajos y, si pinta bien, coordiná la muestra pagada.',
      bodyHtml: infoTable([
        ['Recibida', nowMontevideo()],
        ['Nombre', d.name],
        ['Ubicación', d.location || '—'],
        ['Contacto', d.contact || '—'],
        ['Experiencia', d.experience || '—'],
        ['Sabe tejer', d.skills || '—'],
        ['Disponibilidad', d.availability || '—'],
        ['Materiales propios', d.hasMaterials ? 'Sí' : 'No'],
        ['Trabajos', d.portfolio || '—'],
        ['Mensaje', d.message || '—'],
      ]),
      button: wa
        ? { label: 'Responder por WhatsApp', url: wa }
        : { label: 'Ver en el panel', url: `${SITE_URL}/admin/tejedoras` },
      footerNote: `Gestioná las postulaciones en el <a href="${SITE_URL}/admin/tejedoras" style="color:#8F3B53;text-decoration:none;">panel</a>.`,
    }),
  }
}

export function ownerStatusChange(d: EncargoEmailData, newStatus: string): RenderedEmail {
  return {
    subject: `Encargo de ${firstName(d.name)} → ${newStatus}`,
    html: renderEmail({
      heading: 'Cambio de estado',
      intro: `El encargo de ${escapeHtml(d.name)} pasó a <strong>${escapeHtml(newStatus)}</strong>.`,
      bodyHtml: infoTable([
        ['Nombre', d.name],
        ['Prenda', d.garmentType || '—'],
        ['Código', d.trackingCode || '—'],
        ['Nuevo estado', newStatus],
      ]),
      button: { label: 'Ver en el panel', url: `${SITE_URL}/admin/encargos` },
      footerNote: 'Aviso automático del sistema de Dahila Crochet.',
    }),
  }
}

export function ownerSystemError(context: string, message: string): RenderedEmail {
  return {
    subject: `⚠️ Error del sistema: ${context}`,
    html: renderEmail({
      heading: 'Error del sistema',
      intro: `Se registró un error en <strong>${escapeHtml(context)}</strong>. Si se repite, avisá al desarrollador.`,
      bodyHtml: `<pre style="white-space:pre-wrap;word-break:break-word;background:#F4ECDD;border:1px solid #E7DED0;border-radius:10px;padding:14px;font-family:'Courier New',monospace;font-size:12px;color:#4A4143;margin:8px 0 0;">${escapeHtml(
        message.slice(0, 1000)
      )}</pre>`,
      footerNote: 'Aviso automático del sistema de Dahila Crochet.',
    }),
  }
}

export function ownerEmailFailure(context: string, to: string, error: string): RenderedEmail {
  return {
    subject: `⚠️ No se pudo enviar un email (${context})`,
    html: renderEmail({
      heading: 'Falló un envío de email',
      intro: `No se pudo entregar un email de tipo <strong>${escapeHtml(context)}</strong>.`,
      bodyHtml: infoTable([
        ['Destinatario', to],
        ['Motivo', error],
      ]),
      footerNote: 'Aviso automático del sistema de Dahila Crochet.',
    }),
  }
}

export interface DailySummaryData {
  encargos_total?: number
  encargos_today?: number
  encargos_new?: number
  encargos_in_progress?: number
  encargos_done?: number
  encargos_cancelled?: number
  carts_distinct?: number
  cart_items?: number
  cart_value_uyu?: number
  top_products?: Array<{ name: string; qty: number }>
}

export function ownerDailySummary(d: DailySummaryData): RenderedEmail {
  const n = (v?: number) => String(v ?? 0)
  const top =
    (d.top_products ?? []).length > 0
      ? (d.top_products ?? [])
          .map((p, i) => `${i + 1}. ${escapeHtml(p.name)} — ${p.qty}`)
          .join('<br>')
      : '—'
  const today = new Date().toLocaleDateString('es-UY', { day: '2-digit', month: 'long', year: 'numeric' })
  return {
    subject: `📊 Resumen diario · Dahila (${today})`,
    html: renderEmail({
      preheader: `${n(d.encargos_new)} encargos sin responder · ${n(d.carts_distinct)} carritos activos`,
      heading: 'Tu resumen del día',
      intro: `Estado de la tienda al ${escapeHtml(today)}.`,
      bodyHtml:
        infoTable([
          ['Encargos hoy', n(d.encargos_today)],
          ['Sin responder', n(d.encargos_new)],
          ['En proceso', n(d.encargos_in_progress)],
          ['Completados', n(d.encargos_done)],
          ['Cancelados', n(d.encargos_cancelled)],
          ['Encargos (histórico)', n(d.encargos_total)],
          ['Carritos activos', n(d.carts_distinct)],
          ['Ítems en carritos', n(d.cart_items)],
          ['Valor en carritos (aprox.)', money(d.cart_value_uyu) || 'UYU 0'],
        ]) +
        `<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#8C8285;margin:18px 0 6px;">Más deseados (en carritos)</div>
         <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1F1A1B;line-height:1.7;">${top}</div>`,
      button: { label: 'Abrir el panel', url: `${SITE_URL}/admin` },
      footerNote: 'Resumen automático. El “valor en carritos” es una estimación sobre precios de lista, no ventas confirmadas.',
    }),
  }
}

// ─── CUSTOMER templates ──────────────────────────────────────────────────────

export function customerEncargoConfirmation(d: EncargoEmailData): RenderedEmail {
  return {
    subject: 'Recibimos tu encargo 🧶 · Dahila Crochet',
    html: renderEmail({
      preheader: 'Guardamos tu pedido a medida. Te escribimos por WhatsApp para coordinar los detalles.',
      heading: `¡Recibimos tu encargo, ${escapeHtml(firstName(d.name))}!`,
      intro:
        'Gracias por elegir algo hecho a mano. Ya tenemos tu pedido anotado — ahora empieza el proceso, paso a paso.',
      bodyHtml:
        infoTable([
          ['Prenda', d.garmentType || 'A definir'],
          ['Talle', d.size || 'A coordinar'],
        ]) +
        (d.trackingCode ? callout('Tu código de seguimiento', d.trackingCode) : '') +
        sectionLabel('Cómo sigue') +
        steps([
          'Te escribimos por WhatsApp o mail para confirmar el modelo, los colores y el precio final.',
          'Cuando confirmás, empezamos a tejer tu pieza (suele llevar de 2 a 6 semanas según el modelo).',
          'Te avisamos apenas está lista y coordinamos el envío a todo Uruguay o el retiro.',
        ]) +
        paragraph('Podés consultar el estado de tu encargo cuando quieras con tu código.'),
      button: d.trackingCode
        ? { label: 'Ver el estado de mi encargo', url: STATUS_URL }
        : { label: 'Conocer el atelier', url: `${SITE_URL}/atelier` },
      footerNote: '¿Alguna duda? Respondé este mail o escribinos por WhatsApp.',
    }),
  }
}

export function customerOrderConfirmation(d: OrderEmailData): RenderedEmail {
  const itemsHtml = d.items
    .map(
      (it) =>
        `<tr><td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1F1A1B;border-bottom:1px solid #EFE7DA;">${escapeHtml(
          it.name
        )} <span style="color:#8C8285;">· talle ${escapeHtml(it.size || '—')} · x${it.qty}</span></td>
        <td style="padding:6px 0;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1F1A1B;border-bottom:1px solid #EFE7DA;">${
          it.unitPrice ? money(it.unitPrice * it.qty) : ''
        }</td></tr>`
    )
    .join('')
  return {
    subject: 'Confirmamos tu pedido · Dahila Crochet',
    html: renderEmail({
      preheader: 'Recibimos tu pedido. Te escribimos por WhatsApp para coordinar pago y envío.',
      heading: `¡Gracias por tu compra, ${escapeHtml(firstName(d.name))}!`,
      intro: 'Anotamos tu pedido. Acá tenés el detalle — el pago y el envío los coordinamos con vos por WhatsApp.',
      bodyHtml:
        (d.reference ? infoTable([['Pedido', d.reference]]) : '') +
        `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">${itemsHtml}${
          d.total
            ? `<tr><td style="padding:12px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#1F1A1B;">Total</td><td style="padding:12px 0 0;text-align:right;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#1F1A1B;">${money(
                d.total
              )}</td></tr>`
            : ''
        }</table>` +
        sectionLabel('Cómo sigue') +
        steps([
          'Te escribimos por WhatsApp para coordinar el pago (transferencia o Mercado Pago).',
          'Preparamos tu pedido con cuidado.',
          'Coordinamos el envío a todo Uruguay o el retiro en Montevideo.',
        ]),
      button: { label: 'Seguir mirando la tienda', url: SHOP_URL },
      footerNote: '¿Alguna duda? Respondé este mail o escribinos por WhatsApp.',
    }),
  }
}

// Copy per customer state. Kept declarative so adding a state = adding an entry.
const STATE_COPY: Record<CustomerState, { subject: string; heading: string; intro: string; cta?: EmailButtonRef }> = {
  received: {
    subject: 'Recibimos tu encargo · Dahila Crochet',
    heading: '¡Recibimos tu encargo!',
    intro: 'Ya lo tenemos anotado. Te escribimos para coordinar los detalles.',
    cta: 'status',
  },
  replied: {
    subject: 'Te escribimos sobre tu encargo · Dahila Crochet',
    heading: 'Te respondimos',
    intro: 'Revisamos tu encargo y te escribimos para avanzar con los detalles. Chequeá tu WhatsApp o mail.',
    cta: 'status',
  },
  in_progress: {
    subject: 'Tu prenda está en el telar 🧶 · Dahila Crochet',
    heading: 'Manos a la obra',
    intro: 'Empezamos a tejer tu prenda. Es un proceso hecho a mano, sin apuro — te avisamos apenas esté lista.',
    cta: 'status',
  },
  ready: {
    subject: '¡Tu prenda está lista! · Dahila Crochet',
    heading: '¡Tu prenda está lista!',
    intro: 'Terminamos de tejer tu pieza. Coordinamos la entrega o el envío por WhatsApp.',
    cta: 'status',
  },
  shipped: {
    subject: 'Tu pedido va en camino 📦 · Dahila Crochet',
    heading: 'Tu pedido va en camino',
    intro: 'Despachamos tu prenda. En breve debería llegarte — cualquier cosa, escribinos.',
    cta: 'status',
  },
  delivered: {
    subject: '¡Que la disfrutes! · Dahila Crochet',
    heading: '¡Que la disfrutes!',
    intro: 'Tu prenda ya está con vos. Gracias por elegir algo hecho a mano — nos encantaría ver cómo te queda.',
    cta: 'shop',
  },
  cancelled: {
    subject: 'Sobre tu encargo · Dahila Crochet',
    heading: 'Tu encargo fue cancelado',
    intro: 'Cancelamos este encargo. Si fue un error o querés retomarlo, respondé este mail o escribinos por WhatsApp.',
    cta: 'shop',
  },
}

type EmailButtonRef = 'status' | 'shop'

export function customerStatusEmail(state: CustomerState, d: EncargoEmailData): RenderedEmail {
  const copy = STATE_COPY[state]
  const button =
    copy.cta === 'shop'
      ? { label: 'Ver la tienda', url: SHOP_URL }
      : { label: 'Ver el estado de mi encargo', url: STATUS_URL }
  return {
    subject: copy.subject,
    html: renderEmail({
      preheader: copy.intro,
      heading: `${copy.heading}`,
      intro: `${escapeHtml(firstName(d.name))}, ${copy.intro}`,
      bodyHtml:
        (d.garmentType ? infoTable([['Prenda', d.garmentType], ['Talle', d.size || '—']]) : '') +
        (d.trackingCode ? callout('Tu código', d.trackingCode) : ''),
      button,
      footerNote: 'Cualquier duda, respondé este mail y te contestamos.',
    }),
  }
}
