import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { META_CAPI_ENABLED, sendMetaEvents } from '@/lib/meta-capi'
import { armarPurchase, purchaseEventId, type PurchaseOrder } from '@/lib/purchase-payload'

// La compra, avisada a Meta una sola vez (TRK-02, 04/11/2026). Hoy la llama
// /api/admin/meta-compra cuando Anush marca un pedido "Vendido" y confirma el
// monto; mañana, el pago online. Sin GA4: la decisión registrada es no
// insistir con GA4, y su Measurement Protocol solo fecha eventos hasta 72 h
// atrás.
//
// Una sola vez: orders.meta_purchase_sent_at se graba recién cuando Meta
// respondió bien (admin-pedidos-y-ajustes-2026-11.sql). Sin ese SQL la columna
// no existe y se manda igual, como antes; el event_id fijo (purchase-PED-…)
// le permite a Meta descartar el repetido dentro de sus 48 h.

export interface PurchaseOrderRow extends PurchaseOrder {
  /** undefined = falta la columna (SQL sin correr). */
  meta_purchase_sent_at?: string | null
}

export interface PurchaseReport {
  sent: boolean
  /** Por qué no salió: 'sin token de Meta', 'ya avisado' o 'Meta no respondió'. */
  motivo?: string
  eventId: string
}

export async function recordPurchase(
  db: SupabaseClient,
  order: PurchaseOrderRow,
  opts: {
    /** Lo cobrado por las prendas, sin envío. */
    valueUyu: number
    source: 'admin' | 'mercadopago'
    /** Segundos Unix de la venta; por defecto, ahora. */
    eventTime?: number
  },
): Promise<PurchaseReport> {
  const eventId = purchaseEventId(order)
  if (!META_CAPI_ENABLED) return { sent: false, motivo: 'sin token de Meta', eventId }
  if (order.meta_purchase_sent_at) return { sent: false, motivo: 'ya avisado', eventId }

  const eventTime = opts.eventTime ?? Math.floor(Date.now() / 1000)
  const ok = await sendMetaEvents([armarPurchase(order, opts.valueUyu, eventTime)])
  if (!ok) return { sent: false, motivo: 'Meta no respondió', eventId }

  const { error } = await db
    .from('orders')
    .update({ meta_purchase_sent_at: new Date().toISOString() })
    .eq('id', order.id)
  // Sin la columna (PGRST204 / 42703) no hay dónde anotarlo: ya salió, como antes.
  const sinColumna = error?.code === 'PGRST204' || error?.code === '42703' || /meta_purchase_sent_at/.test(error?.message ?? '')
  if (error && !sinColumna) console.error(`purchase (${opts.source}): no se anotó meta_purchase_sent_at`, error.message)
  return { sent: true, eventId }
}
