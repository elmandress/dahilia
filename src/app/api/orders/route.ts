import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { CART_COOKIE } from '@/lib/cart-cookie'

interface OrderItemInput {
  name: string
  slug: string
  size: string
  qty: number
  unit_price_uyu: number
}

// Registro de lo que se mandó por WhatsApp — ver database/schema-orders.sql.
// Se llama en paralelo a abrir WhatsApp (fire-and-forget desde el cliente):
// si esto falla, la venta no se pierde, solo no queda registrada.
export async function POST(req: NextRequest) {
  try {
    // Auditoría 03/09/2026: era el único formulario público sin límite de
    // frecuencia (encargo/tejedoras/cupón ya lo tienen) y sin tope de ítems.
    const h = await headers()
    const ip = getClientIp(h)
    if (!checkRateLimit(`orders:${ip}`, { windowMs: 60_000, max: 10 })) {
      return NextResponse.json({ error: 'Demasiados intentos. Esperá un minuto y volvé a intentar.' }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }

    const rawItems = (Array.isArray(body.items) ? body.items : []).slice(0, 30)
    const items: OrderItemInput[] = rawItems
      .filter((i: unknown): i is Record<string, unknown> => !!i && typeof i === 'object')
      .map((i: Record<string, unknown>) => ({
        name: String(i.name ?? '').slice(0, 200),
        slug: String(i.slug ?? '').slice(0, 200),
        size: String(i.size ?? '').slice(0, 32),
        qty: Math.max(1, Math.min(20, parseInt(String(i.qty)) || 1)),
        unit_price_uyu: Math.max(0, Number(i.unit_price_uyu) || 0),
      }))

    if (items.length === 0) {
      return NextResponse.json({ error: 'Sin ítems.' }, { status: 400 })
    }

    // Atribución de canal — opcional, capturada en el navegador (ver
    // src/lib/attribution.ts). Vive en columnas agregadas por
    // schema-orders-attribution.sql.
    const attribution = body.attribution && typeof body.attribution === 'object'
      ? body.attribution as Record<string, unknown>
      : null
    const baseRow = {
      items,
      subtotal_uyu: Math.max(0, Number(body.subtotal_uyu) || 0),
      discount_uyu: Math.max(0, Number(body.discount_uyu) || 0),
      total_uyu: Math.max(0, Number(body.total_uyu) || 0),
      coupon_code: body.coupon_code ? String(body.coupon_code).slice(0, 64) : null,
      free_shipping: !!body.free_shipping,
      gift_note: body.gift_note ? String(body.gift_note).slice(0, 500) : null,
    }
    const attributionCols = {
      utm_source: attribution?.utm_source ? String(attribution.utm_source).slice(0, 100) : null,
      utm_medium: attribution?.utm_medium ? String(attribution.utm_medium).slice(0, 100) : null,
      utm_campaign: attribution?.utm_campaign ? String(attribution.utm_campaign).slice(0, 100) : null,
      referrer_host: attribution?.referrer_host ? String(attribution.referrer_host).slice(0, 200) : null,
    }

    // De qué carrito sale el pedido (embudo-pedidos-2026-09.sql): así
    // /admin/carritos sabe qué carritos terminaron en un pedido por WhatsApp
    // en vez de mostrarlos todos como "activos". La cookie la crea /api/cart;
    // se valida el formato igual que allá.
    const store = await cookies()
    const rawCartId = store.get(CART_COOKIE)?.value
    const cartId = rawCartId && /^[0-9a-fA-F-]{20,40}$/.test(rawCartId) ? rawCartId : null

    // De la fila más completa a la mínima: si una migración opcional no corrió
    // todavía, se reintenta sin esas columnas para no perder el registro del
    // pedido, que es lo esencial. PostgREST devuelve PGRST204 para una columna
    // inexistente (no el 42703 crudo de Postgres): por eso también se mira el
    // mensaje, mismo criterio que usan las páginas del admin.
    const supabase = await createClient()
    const attempts = [
      { ...baseRow, ...attributionCols, cart_id: cartId },
      { ...baseRow, ...attributionCols },
      baseRow,
    ]
    let error: { code?: string; message?: string } | null = null
    for (const row of attempts) {
      ;({ error } = await supabase.from('orders').insert(row))
      const missingColumn = error?.code === '42703' || error?.code === 'PGRST204'
        || /cart_id|utm_source|utm_medium|utm_campaign|referrer_host/.test(error?.message || '')
      if (!error || !missingColumn) break
    }
    // La tabla `orders` es opcional (migración no corrida todavía) — no
    // convertir eso en un error visible para la clienta, solo loguear.
    if (error) console.error('POST /api/orders (¿corriste schema-orders.sql / embudo-pedidos-2026-09.sql?)', error)

    return NextResponse.json({ ok: !error })
  } catch (e) {
    console.error('POST /api/orders', e)
    return NextResponse.json({ error: 'No se pudo registrar el pedido.' }, { status: 500 })
  }
}
