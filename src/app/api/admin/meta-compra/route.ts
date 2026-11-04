import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminUser } from '@/lib/supabase/require-admin'
import { recordPurchase } from '@/lib/purchase'

// La compra, avisada a Meta cuando Anush marca el pedido "Vendido" en
// /admin/pedidos y confirma el monto. Es el único momento en que se sabe que
// hubo venta: el pago se arregla por WhatsApp, fuera del sitio. Con esto Meta
// aprende quién COMPRA (no quién toca botones).
//
// - value: lo que Anush confirmó que cobró por las prendas
//   (purchase_value_uyu); sin ese dato o sin el SQL, el total del pedido, como
//   antes.
// - event_time: ahora, el momento de la venta. Ya no se descartan los pedidos
//   de más de 7 días: el límite de Meta es sobre event_time, y el corte por
//   fecha del pedido perdía las ventas de los encargos, que se cierran tarde.
// - event_id: purchase-PED-… (lib/purchase-payload.ts), una sola vez por
//   pedido (lib/purchase.ts).
//
// Responde { sent, motivo } para que el panel diga si salió.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!(await getAdminUser(supabase))) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const body = await req.json().catch(() => null) as { id?: unknown } | null
  const id = typeof body?.id === 'string' ? body.id : ''
  if (!id) return NextResponse.json({ error: 'Falta el pedido.' }, { status: 400 })

  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  if (error || !order) return NextResponse.json({ error: 'No se encontró el pedido.' }, { status: 404 })
  if (order.status !== 'vendido') return NextResponse.json({ sent: false, motivo: 'no está vendido' })

  const value = Number(order.purchase_value_uyu ?? order.total_uyu) || 0
  const { sent, motivo } = await recordPurchase(supabase, order, { valueUyu: value, source: 'admin' })
  return NextResponse.json({ sent, motivo })
}
