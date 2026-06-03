import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'

const CART_COOKIE = 'dahila_cart_id'
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
  const supabase = await createClient()
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
    const supabase = await createClient()

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
    return NextResponse.json({ error: 'No se pudo añadir al carrito.' }, { status: 500 })
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
    const supabase = await createClient()

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
    const supabase = await createClient()

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
