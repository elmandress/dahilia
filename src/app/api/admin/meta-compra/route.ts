import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/require-admin'
import { META_CAPI_ENABLED, sendMetaEvents } from '@/lib/meta-capi'
import { SITE_URL } from '@/lib/env'
import { metaContentId } from '@/lib/meta-pixel'

// La compra, avisada a Meta cuando Anush marca el pedido "vendido" en
// /admin/pedidos. Es el único momento en que se sabe que hubo venta: el pago
// se arregla por WhatsApp, fuera del sitio. Con esto Meta aprende quién
// COMPRA (no quién toca botones) y la campaña puede optimizar por ventas.
//
// event_id = el id del pedido: si se marca vendido dos veces, Meta cuenta una.
// Meta solo acepta eventos web de hasta 7 días: un pedido más viejo no se
// manda (no se puede atribuir a un clic igual).
const MAX_AGE_S = 7 * 24 * 60 * 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!(await getAdminUser(supabase))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  if (!META_CAPI_ENABLED) return NextResponse.json({ sent: false, reason: 'sin token de Meta' })

  const body = await req.json().catch(() => null) as { id?: unknown } | null
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'Falta el pedido.' }, { status: 400 })

  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  if (error || !order) return NextResponse.json({ error: 'No se encontró el pedido.' }, { status: 404 })
  if (order.status !== 'vendido') return NextResponse.json({ sent: false, reason: 'no está vendido' })

  const createdAt = Math.floor(new Date(order.created_at).getTime() / 1000)
  const now = Math.floor(Date.now() / 1000)
  if (now - createdAt > MAX_AGE_S) return NextResponse.json({ sent: false, reason: 'pedido de más de 7 días' })

  const items = (Array.isArray(order.items) ? order.items : []) as Array<{ slug: string; size?: string; qty: number; unit_price_uyu: number; name?: string }>
  const ids = items.map((i) => metaContentId(i.slug, i.size))
  const sent = await sendMetaEvents([{
    event_name: 'Purchase',
    event_id: `pedido-${order.id}`,
    event_time: now,
    event_source_url: `${SITE_URL}/carrito`,
    user_data: {
      client_ip_address: order.client_ip,
      client_user_agent: order.client_user_agent,
      fbp: order.meta_fbp,
      fbc: order.meta_fbc,
    },
    custom_data: {
      currency: 'UYU',
      value: Number(order.total_uyu) || 0,
      content_type: 'product',
      content_ids: ids,
      contents: items.map((i, k) => ({ id: ids[k], quantity: i.qty, item_price: i.unit_price_uyu })),
      num_items: items.reduce((s, i) => s + (i.qty || 1), 0),
      order_id: order.tracking_code ?? order.id,
    },
  }])
  return NextResponse.json({ sent })
}
