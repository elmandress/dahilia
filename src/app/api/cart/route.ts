import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { CART_COOKIE } from '@/lib/cart-cookie'

/**
 * El carrito de un visitante anónimo NO se puede scopear con RLS: no hay
 * sesión, el dueño es una cookie. Por eso las policies de `cart_items` eran
 * `USING (true)` y cualquiera con la anon key podía leer los carritos de
 * todos. La solución es al revés: cerrar la tabla en la base y que esta ruta
 * —la única que conoce la cookie— entre como servicio.
 *
 * El `?? await createClient()` es a propósito: si la clave de servicio no
 * está configurada, sigue andando con el cliente anónimo de siempre. Así el
 * código funciona ANTES y DESPUÉS de correr el SQL que cierra las policies,
 * sin ventana rota entre un deploy y el otro.
 *
 * TODAS las consultas de abajo filtran por `cart_id`: con el cliente de
 * servicio ese filtro es la única barrera, así que no se puede omitir.
 */
async function getDb() {
  return createAdminClient() ?? (await createClient())
}

const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days
const MAX_QTY_PER_ITEM = 20

async function getOrCreateCartId(): Promise<{ cartId: string; setCookie: boolean }> {
  const store = await cookies()
  const existing = store.get(CART_COOKIE)?.value
  if (existing && /^[0-9a-fA-F-]{20,40}$/.test(existing)) {
    return { cartId: existing, setCookie: false }
  }
  return { cartId: randomUUID(), setCookie: true }
}

function applyCartCookie(res: NextResponse, cartId: string, setCookie: boolean) {
  if (!setCookie) return res
  res.cookies.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: CART_COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}

async function loadItems(cartId: string) {
  const supabase = await getDb()
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product:products(*, media:product_media(*), sizes:product_sizes(*))')
    .eq('cart_id', cartId)
    .order('added_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function GET() {
  try {
    const { cartId, setCookie } = await getOrCreateCartId()
    const items = await loadItems(cartId)
    return applyCartCookie(NextResponse.json({ cartId, items }), cartId, setCookie)
  } catch (e) {
    console.error('GET /api/cart', e)
    return NextResponse.json({ error: 'No se pudo cargar el carrito.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Sin cookie, cada POST genera un cart_id nuevo (randomUUID) → una fila
    // nueva en cart_items por request, sin tope. Auditoría 03/09/2026:
    // ningún otro endpoint público del sitio quedaba sin este límite.
    const h = await headers()
    const ip = getClientIp(h)
    if (!checkRateLimit(`cart:${ip}`, { windowMs: 60_000, max: 40 })) {
      return NextResponse.json({ error: 'Demasiados intentos. Esperá un minuto y volvé a intentar.' }, { status: 429 })
    }

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }
    const productId = String(body.productId || '')
    const size = String(body.size || '').slice(0, 16)
    const qty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, parseInt(String(body.qty)) || 1))
    if (!productId || !size) {
      return NextResponse.json({ error: 'Faltan campos.' }, { status: 400 })
    }

    const { cartId, setCookie } = await getOrCreateCartId()
    const supabase = await getDb()

    // Confirm product exists and is purchasable
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, status, is_custom_only')
      .eq('id', productId)
      .maybeSingle()
    if (prodErr) throw prodErr
    if (!product || product.status !== 'active' || product.is_custom_only) {
      return NextResponse.json({ error: 'El producto no está disponible.' }, { status: 409 })
    }

    // Reject explicitly-unavailable sizes. Single-size products have no size rows,
    // so a missing row means "no size constraint" and is allowed (unchanged behaviour).
    const { data: sizeRow } = await supabase
      .from('product_sizes')
      .select('available')
      .eq('product_id', productId)
      .eq('size', size)
      .maybeSingle()
    if (sizeRow && sizeRow.available === false) {
      return NextResponse.json({ error: 'Ese talle no está disponible.' }, { status: 409 })
    }

    // Upsert: increment qty if existing
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, qty')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .eq('size', size)
      .maybeSingle()

    if (existing) {
      const newQty = Math.min(MAX_QTY_PER_ITEM, existing.qty + qty)
      const { error } = await supabase
        .from('cart_items')
        .update({ qty: newQty })
        .eq('id', existing.id)
        // Redundante (existing salió de una búsqueda ya filtrada por cartId),
        // pero con el cliente de servicio no hay RLS abajo que ataje un error
        // futuro: toda escritura lleva su scope explícito.
        .eq('cart_id', cartId)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('cart_items')
        .insert({ cart_id: cartId, product_id: productId, size, qty })
      if (error) throw error
    }

    const items = await loadItems(cartId)
    return applyCartCookie(NextResponse.json({ cartId, items }), cartId, setCookie)
  } catch (e) {
    console.error('POST /api/cart', e)
    return NextResponse.json({ error: 'No se pudo agregar al carrito.' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }
    const itemId = String(body.itemId || '')
    const qty = Math.max(0, Math.min(MAX_QTY_PER_ITEM, parseInt(String(body.qty)) || 0))
    if (!itemId) {
      return NextResponse.json({ error: 'Faltan campos.' }, { status: 400 })
    }

    const { cartId, setCookie } = await getOrCreateCartId()
    const supabase = await getDb()

    if (qty === 0) {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('cart_id', cartId)
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('cart_items')
        .update({ qty })
        .eq('id', itemId)
        .eq('cart_id', cartId)
      if (error) throw error
    }

    const items = await loadItems(cartId)
    return applyCartCookie(NextResponse.json({ cartId, items }), cartId, setCookie)
  } catch (e) {
    console.error('PATCH /api/cart', e)
    return NextResponse.json({ error: 'No se pudo actualizar.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const itemId = url.searchParams.get('itemId')
    if (!itemId) {
      return NextResponse.json({ error: 'Falta itemId.' }, { status: 400 })
    }
    const { cartId, setCookie } = await getOrCreateCartId()
    const supabase = await getDb()

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('cart_id', cartId)
    if (error) throw error

    const items = await loadItems(cartId)
    return applyCartCookie(NextResponse.json({ cartId, items }), cartId, setCookie)
  } catch (e) {
    console.error('DELETE /api/cart', e)
    return NextResponse.json({ error: 'No se pudo eliminar.' }, { status: 500 })
  }
}
