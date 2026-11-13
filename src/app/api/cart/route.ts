import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { randomUUID } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { CART_COOKIE } from '@/lib/cart-cookie'
import { isUuid } from '@/lib/uuid'
import { dropVisibility } from '@/lib/types'
import { resolverTalle, TALLE_MAX } from '@/lib/cart-summary'
import { getCatalog } from '@/lib/catalog'
import {
  CART_LOCAL_COOKIE, leerCarritoLocal, escribirCarritoLocal, agregarLocal, cambiarLocal, armarItemsLocales,
  type LineaLocal,
} from '@/lib/cart-local'

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

// La colección viaja con cada prenda (QA-01, 04/11/2026): sin ella el carrito
// no puede saber que un drop volvió a "Próximamente" y la seguía contando como
// pedible (ver cartItemIssue en lib/cart-summary.ts).
async function loadItems(cartId: string) {
  const supabase = await getDb()
  const { data, error } = await supabase
    .from('cart_items')
    .select('*, product:products(*, media:product_media(*), sizes:product_sizes(*), collection:collections(published, unlisted))')
    .eq('cart_id', cartId)
    .order('added_at', { ascending: true })

  if (error) throw error
  return data ?? []
}

// ── Carrito sin base (13/11/2026) ────────────────────────────────────
// Si la base falla, el carrito sigue andando desde una cookie: ver
// lib/cart-local.ts. Cada handler prueba primero la base y, si lanza, hace lo
// mismo sobre la cookie. Lo que NO es una caída (validaciones, prenda agotada,
// límite de pedidos) responde antes y no pasa por acá.

async function leerLocal(): Promise<LineaLocal[]> {
  return leerCarritoLocal((await cookies()).get(CART_LOCAL_COOKIE)?.value)
}

/** La respuesta de siempre ({ cartId, items }), armada con la cookie y el
 *  catálogo de respaldo. `local: true` es solo informativo. */
async function respuestaLocal(cartId: string, setCookie: boolean, lineas: LineaLocal[]) {
  const { products } = await getCatalog()
  const res = NextResponse.json({ cartId, items: armarItemsLocales(lineas, products, cartId), local: true })
  res.cookies.set(CART_LOCAL_COOKIE, escribirCarritoLocal(lineas), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: CART_COOKIE_MAX_AGE,
    path: '/',
  })
  return applyCartCookie(res, cartId, setCookie)
}

/** La base volvió: lo que se armó durante la caída pasa a cart_items. Se puede
 *  repetir sin duplicar (deja la cantidad mayor, no suma). Una prenda que ya
 *  no existe se saltea. */
async function pasarLocalALaBase(cartId: string, lineas: LineaLocal[]) {
  const supabase = await getDb()
  for (const l of lineas) {
    const { data: existing, error } = await supabase
      .from('cart_items')
      .select('id, qty')
      .eq('cart_id', cartId)
      .eq('product_id', l.productId)
      .eq('size', l.size)
      .maybeSingle()
    if (error) throw error
    if (existing) {
      if (existing.qty < l.qty) {
        await supabase.from('cart_items').update({ qty: l.qty }).eq('id', existing.id).eq('cart_id', cartId)
      }
    } else {
      await supabase.from('cart_items').insert({ cart_id: cartId, product_id: l.productId, size: l.size, qty: l.qty })
    }
  }
}

export async function GET() {
  const { cartId, setCookie } = await getOrCreateCartId()
  const locales = await leerLocal()
  try {
    let items = await loadItems(cartId)
    if (locales.length > 0) {
      await pasarLocalALaBase(cartId, locales)
      items = await loadItems(cartId)
    }
    const res = applyCartCookie(NextResponse.json({ cartId, items }), cartId, setCookie)
    if (locales.length > 0) res.cookies.delete(CART_LOCAL_COOKIE)
    return res
  } catch (e) {
    console.error('GET /api/cart: la base no respondió, sigue el carrito local', e)
    try {
      return await respuestaLocal(cartId, setCookie, locales)
    } catch (e2) {
      console.error('GET /api/cart', e2)
      return NextResponse.json({ error: 'No se pudo cargar el carrito.' }, { status: 500 })
    }
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
    // Sin cortar: antes se truncaba a 16 caracteres, y un talle descriptivo
    // ("M/L (hasta 100 cm)") se guardaba cortado y quedaba "no disponible"
    // apenas se agregaba (QA-07). Un talle de más de 40 es un error.
    const size = String(body.size || '')
    const qty = Math.max(1, Math.min(MAX_QTY_PER_ITEM, parseInt(String(body.qty)) || 1))
    if (!productId || !size) {
      return NextResponse.json({ error: 'Faltan campos.' }, { status: 400 })
    }
    if (!isUuid(productId)) {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }
    if (size.length > TALLE_MAX) {
      return NextResponse.json({ error: 'Talle inválido.' }, { status: 400 })
    }

    const { cartId, setCookie } = await getOrCreateCartId()
    try {
    const supabase = await getDb()

    // Confirm product exists and is purchasable
    const { data: product, error: prodErr } = await supabase
      .from('products')
      .select('id, status, is_custom_only, collection_id, collection:collections(published, unlisted)')
      .eq('id', productId)
      .maybeSingle()
    if (prodErr) throw prodErr
    // Una prenda de un drop sin lanzar (colección en borrador) tampoco se
    // agrega, aunque esté activa: así la deja lista Anush de antemano.
    const collection = Array.isArray(product?.collection) ? product.collection[0] : product?.collection
    if (!product || product.status !== 'active' || product.is_custom_only || dropVisibility({ collection_id: product.collection_id, collection }) === 'hidden') {
      return NextResponse.json({ error: 'El producto no está disponible.' }, { status: 409 })
    }

    // El talle se valida contra TODAS las filas de la prenda (QA-07). Antes solo
    // se rechazaba una fila que existía sin stock: un talle inexistente pasaba
    // como si la prenda no tuviera talles. Sin filas es una pieza de talle
    // único y se guarda 'Único'; con fila 'Talle único', un 'Único' la encuentra.
    const { data: sizeRows, error: sizesErr } = await supabase
      .from('product_sizes')
      .select('size, available')
      .eq('product_id', productId)
    if (sizesErr) throw sizesErr
    const resolved = resolverTalle(sizeRows, size)
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: resolved.status })
    }
    const talle = resolved.talle

    // Upsert: increment qty if existing
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, qty')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .eq('size', talle)
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
        .insert({ cart_id: cartId, product_id: productId, size: talle, qty })
      if (error) throw error
    }

    const items = await loadItems(cartId)
    return applyCartCookie(NextResponse.json({ cartId, items }), cartId, setCookie)
    } catch (e) {
      // La base no respondió: la prenda se guarda en el carrito local, con las
      // mismas reglas, contra el catálogo de respaldo.
      console.error('POST /api/cart: la base no respondió, sigue el carrito local', e)
      const { products } = await getCatalog()
      const r = agregarLocal(await leerLocal(), products, { productId, size, qty, nuevoId: randomUUID() })
      if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status })
      return await respuestaLocal(cartId, setCookie, r.lineas)
    }
  } catch (e) {
    console.error('POST /api/cart', e)
    return NextResponse.json({ error: 'No se pudo agregar al carrito.' }, { status: 500 })
  }
}

// Modificar y borrar también escriben en la base y vuelven a leer el carrito
// entero con sus joins: sin límite, un script podía martillarlos en loop
// (auditoría de seguridad 19/09/2026). Mismo balde que el POST: ninguna
// clienta real hace 40 cambios de carrito por minuto.
async function overLimit(): Promise<boolean> {
  const ip = getClientIp(await headers())
  return !checkRateLimit(`cart:${ip}`, { windowMs: 60_000, max: 40 })
}
const TOO_MANY = { error: 'Demasiados intentos. Esperá un minuto y volvé a intentar.' }

export async function PATCH(req: NextRequest) {
  try {
    if (await overLimit()) return NextResponse.json(TOO_MANY, { status: 429 })
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }
    const itemId = String(body.itemId || '')
    const qty = Math.max(0, Math.min(MAX_QTY_PER_ITEM, parseInt(String(body.qty)) || 0))
    if (!itemId) {
      return NextResponse.json({ error: 'Faltan campos.' }, { status: 400 })
    }
    if (!isUuid(itemId)) {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }

    const { cartId, setCookie } = await getOrCreateCartId()
    try {
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
      console.error('PATCH /api/cart: la base no respondió, sigue el carrito local', e)
      return await respuestaLocal(cartId, setCookie, cambiarLocal(await leerLocal(), itemId, qty))
    }
  } catch (e) {
    console.error('PATCH /api/cart', e)
    return NextResponse.json({ error: 'No se pudo actualizar.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (await overLimit()) return NextResponse.json(TOO_MANY, { status: 429 })
    const url = new URL(req.url)
    const itemId = url.searchParams.get('itemId')
    if (!itemId) {
      return NextResponse.json({ error: 'Falta itemId.' }, { status: 400 })
    }
    if (!isUuid(itemId)) {
      return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 })
    }
    const { cartId, setCookie } = await getOrCreateCartId()
    try {
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
      console.error('DELETE /api/cart: la base no respondió, sigue el carrito local', e)
      return await respuestaLocal(cartId, setCookie, cambiarLocal(await leerLocal(), itemId, 0))
    }
  } catch (e) {
    console.error('DELETE /api/cart', e)
    return NextResponse.json({ error: 'No se pudo eliminar.' }, { status: 500 })
  }
}
