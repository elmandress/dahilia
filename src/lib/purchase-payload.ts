// El evento Purchase para la API de conversiones de Meta, armado a partir de un
// pedido (tabla orders). Puro: no manda nada ni lee la base, así se prueba con
// node:test. Lo manda lib/purchase.ts.
//
// event_id = "purchase-" + el código PED del pedido (TRK-02, 04/11/2026). Es
// el que conocen el admin, el navegador (/pedido?codigo=) y Mercado Pago
// (external_reference): cuando el navegador o un pago avisen la misma compra,
// Meta la cuenta una vez. Antes era "pedido-<uuid>", un id que nadie más
// conocía. Los pedidos viejos sin código usan el id de la fila.

import type { MetaServerEvent } from '@/lib/meta-capi'
import { SITE_URL } from '@/lib/env'
import { metaContentId } from '@/lib/meta-pixel'

/** Lo que el evento necesita de una fila de orders. */
export interface PurchaseOrder {
  id: string
  tracking_code?: string | null
  /** jsonb: [{ slug, size, qty, unit_price_uyu, name }]. */
  items?: unknown
  client_ip?: string | null
  client_user_agent?: string | null
  meta_fbp?: string | null
  meta_fbc?: string | null
}

interface PurchaseItem {
  slug: string
  size?: string | null
  qty?: unknown
  unit_price_uyu?: unknown
}

/** El código con el que se reconoce la compra: PED-XXXXXX, o el id si no tiene. */
export function purchaseOrderRef(order: Pick<PurchaseOrder, 'id' | 'tracking_code'>): string {
  return order.tracking_code?.trim() || order.id
}

export function purchaseEventId(order: Pick<PurchaseOrder, 'id' | 'tracking_code'>): string {
  return `purchase-${purchaseOrderRef(order)}`
}

/**
 * El Purchase de un pedido. `valueUyu` es lo que Anush confirma que cobró por
 * las prendas (sin envío), no el total que mandó el navegador; `eventTimeS`, en
 * segundos Unix: el momento de la venta, no el del pedido.
 */
export function armarPurchase(order: PurchaseOrder, valueUyu: number, eventTimeS: number): MetaServerEvent {
  // items es jsonb: una fila vieja o rota no tiene que tirar el aviso entero.
  const items = (Array.isArray(order.items) ? order.items : []).filter(
    (i): i is PurchaseItem => !!i && typeof i === 'object' && typeof (i as PurchaseItem).slug === 'string',
  )
  const ids = items.map((i) => metaContentId(i.slug, i.size))
  const qty = (i: PurchaseItem) => Math.max(1, Math.floor(Number(i.qty) || 1))
  const ref = purchaseOrderRef(order)

  return {
    event_name: 'Purchase',
    event_id: purchaseEventId(order),
    event_time: eventTimeS,
    event_source_url: `${SITE_URL}/carrito`,
    action_source: 'website',
    user_data: {
      client_ip_address: order.client_ip,
      client_user_agent: order.client_user_agent,
      fbp: order.meta_fbp,
      fbc: order.meta_fbc,
    },
    custom_data: {
      currency: 'UYU',
      value: Number.isFinite(valueUyu) ? Math.round(valueUyu) : 0,
      content_type: 'product',
      content_ids: ids,
      contents: items.map((i, k) => ({
        id: ids[k],
        quantity: qty(i),
        ...(Number.isFinite(Number(i.unit_price_uyu)) ? { item_price: Number(i.unit_price_uyu) } : {}),
      })),
      num_items: items.reduce((s, i) => s + qty(i), 0),
      order_id: ref,
    },
  }
}
