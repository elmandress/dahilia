import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'

// Cookie-scoped wishlist, modelled on /api/cart. The fav_id cookie is HttpOnly
// so the list survives across visits without a login, and every query is scoped
// by it server-side.
const FAV_COOKIE = 'dahila_fav_id'
const FAV_COOKIE_MAX_AGE = 60 * 60 * 24 * 180 // 180 days — wishlists are long-lived

async function getOrCreateFavId(): Promise<{ favId: string; setCookie: boolean }> {
  const store = await cookies()
  const existing = store.get(FAV_COOKIE)?.value
  if (existing && /^[0-9a-fA-F-]{20,40}$/.test(existing)) {
    return { favId: existing, setCookie: false }
  }
  return { favId: randomUUID(), setCookie: true }
}

function applyFavCookie(res: NextResponse, favId: string, setCookie: boolean) {
  if (!setCookie) return res
  res.cookies.set(FAV_COOKIE, favId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: FAV_COOKIE_MAX_AGE,
    path: '/',
  })
  return res
}

async function loadFavorites(favId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('favorites')
    .select('id, product_id, added_at, product:products(*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*)))')
    .eq('fav_id', favId)
    .order('added_at', { ascending: false })

  if (error) throw error

  // Flatten the joined product_colors → Color[] and drop favorites whose product
  // was deleted (defensive — the FK cascade should prevent this).
  return (data ?? [])
    .filter((row) => !!row.product)
    .map((row) => {
      const p = row.product as unknown as Record<string, unknown>
      const joined = (p.colors ?? []) as Array<{ color: unknown }>
      return {
        id: row.id,
        product_id: row.product_id,
        added_at: row.added_at,
        product: { ...p, colors: joined.map((c) => c.color).filter(Boolean) },
      }
    })
}

export async function GET() {
  try {
    const { favId, setCookie } = await getOrCreateFavId()
    const items = await loadFavorites(favId)
    return applyFavCookie(NextResponse.json({ favId, items }), favId, setCookie)
  } catch (e) {
    console.error('GET /api/favorites', e)
    return NextResponse.json({ error: 'No se pudieron cargar los favoritos.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }
    const productId = String(body.productId || '')
    if (!productId) {
      return NextResponse.json({ error: 'Falta productId.' }, { status: 400 })
    }

    const { favId, setCookie } = await getOrCreateFavId()
    const supabase = await createClient()

    // The product must exist (any status — you can favourite a sold-out piece).
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id')
      .eq('id', productId)
      .maybeSingle()
    if (prodErr) throw prodErr
    if (!product) {
      return NextResponse.json({ error: 'El producto no existe.' }, { status: 409 })
    }

    // Idempotent add: ignore the unique-violation if it's already saved.
    const { error } = await supabase
      .from('favorites')
      .insert({ fav_id: favId, product_id: productId })
    if (error && error.code !== '23505') throw error // 23505 = unique_violation

    const items = await loadFavorites(favId)
    return applyFavCookie(NextResponse.json({ favId, items }), favId, setCookie)
  } catch (e) {
    console.error('POST /api/favorites', e)
    return NextResponse.json({ error: 'No se pudo guardar el favorito.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const productId = url.searchParams.get('productId')
    if (!productId) {
      return NextResponse.json({ error: 'Falta productId.' }, { status: 400 })
    }
    const { favId, setCookie } = await getOrCreateFavId()
    const supabase = await createClient()

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('fav_id', favId)
      .eq('product_id', productId)
    if (error) throw error

    const items = await loadFavorites(favId)
    return applyFavCookie(NextResponse.json({ favId, items }), favId, setCookie)
  } catch (e) {
    console.error('DELETE /api/favorites', e)
    return NextResponse.json({ error: 'No se pudo quitar el favorito.' }, { status: 500 })
  }
}
