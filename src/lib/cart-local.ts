// El carrito cuando la base no responde (13/11/2026).
//
// Por qué existe: el carrito vive en la tabla cart_items. Con el proyecto de
// Supabase restringido (402, tres veces en 2026) /api/cart devolvía 500, la
// ficha cambiaba "Agregar" por un link a WhatsApp y la tienda mostraba "El
// carrito está en mantenimiento". Pero armar el pedido no necesita la base: el
// mensaje de WhatsApp se arma en el navegador con lo que hay en el carrito.
//
// Qué hace: si la base falla, /api/cart guarda el carrito en una cookie
// (prenda, talle y cantidad) y completa cada línea con el catálogo de respaldo
// (lib/catalog.ts). La respuesta tiene la misma forma que la de siempre, así
// que el cajón, /carrito y el checkout no se enteran. Lo único que se pierde
// mientras dura la caída es el registro: ese carrito no aparece en el admin.
// Cuando la base vuelve, el próximo GET pasa las líneas a cart_items y borra
// la cookie.
//
// Acá va solo la lógica, sin red ni Next, para poder probarla con node:test.

import type { Product } from './types'
import { resolverTalle, TALLE_MAX } from './cart-summary'

export const CART_LOCAL_COOKIE = 'dahila_cart_local'
export const CART_LOCAL_MAX_LINEAS = 12
const MAX_QTY = 20
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Una línea del carrito local. `id` es propio de la línea (lo usan cambiar
 *  cantidad y borrar), igual que el id de la fila en cart_items. */
export interface LineaLocal {
  id: string
  productId: string
  size: string
  qty: number
}

/** Lee la cookie. Cualquier cosa rara se descarta: la escribe el navegador. */
export function leerCarritoLocal(raw: string | undefined | null): LineaLocal[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const out: LineaLocal[] = []
    for (const fila of parsed.slice(0, CART_LOCAL_MAX_LINEAS)) {
      if (!Array.isArray(fila)) continue
      const [id, productId, size, qty] = fila as unknown[]
      if (typeof id !== 'string' || !UUID.test(id)) continue
      if (typeof productId !== 'string' || !UUID.test(productId)) continue
      if (typeof size !== 'string' || !size || size.length > TALLE_MAX) continue
      const n = Math.floor(Number(qty))
      if (!Number.isFinite(n) || n < 1) continue
      out.push({ id, productId, size, qty: Math.min(MAX_QTY, n) })
    }
    return out
  } catch {
    return []
  }
}

/** Compacto a propósito: una cookie tiene 4 KB. */
export function escribirCarritoLocal(lineas: LineaLocal[]): string {
  return JSON.stringify(lineas.map((l) => [l.id, l.productId, l.size, l.qty]))
}

export type ResultadoLocal =
  | { ok: true; lineas: LineaLocal[] }
  | { ok: false; status: number; error: string }

/** Agregar, con las mismas reglas que el POST contra la base: la prenda tiene
 *  que estar activa y a la venta, y el talle existir y estar disponible. */
export function agregarLocal(
  lineas: LineaLocal[],
  products: Product[],
  input: { productId: string; size: string; qty: number; nuevoId: string },
): ResultadoLocal {
  const product = products.find((p) => p.id === input.productId)
  if (!product || product.status !== 'active' || product.is_custom_only) {
    return { ok: false, status: 409, error: 'El producto no está disponible.' }
  }
  const resolved = resolverTalle(product.sizes ?? [], input.size)
  if (!resolved.ok) return { ok: false, status: resolved.status, error: resolved.error }
  const talle = resolved.talle

  const existente = lineas.find((l) => l.productId === input.productId && l.size === talle)
  if (existente) {
    return {
      ok: true,
      lineas: lineas.map((l) => (l === existente ? { ...l, qty: Math.min(MAX_QTY, l.qty + input.qty) } : l)),
    }
  }
  if (lineas.length >= CART_LOCAL_MAX_LINEAS) {
    return { ok: false, status: 409, error: 'El carrito ya tiene muchas prendas. Mandanos el pedido por WhatsApp y seguimos por ahí.' }
  }
  return { ok: true, lineas: [...lineas, { id: input.nuevoId, productId: input.productId, size: talle, qty: input.qty }] }
}

/** Cambiar cantidad (0 = sacar). Una línea que no existe no es un error. */
export function cambiarLocal(lineas: LineaLocal[], itemId: string, qty: number): LineaLocal[] {
  if (qty <= 0) return lineas.filter((l) => l.id !== itemId)
  return lineas.map((l) => (l.id === itemId ? { ...l, qty: Math.min(MAX_QTY, qty) } : l))
}

/** Las líneas con la forma de una fila de cart_items con su prenda, que es lo
 *  que espera el cajón. Una prenda que ya no está en el catálogo se omite. */
export function armarItemsLocales(lineas: LineaLocal[], products: Product[], cartId: string) {
  const porId = new Map(products.map((p) => [p.id, p]))
  return lineas.flatMap((l, i) => {
    const product = porId.get(l.productId)
    if (!product) return []
    return [{
      id: l.id,
      cart_id: cartId,
      product_id: l.productId,
      size: l.size,
      qty: l.qty,
      // Orden estable sin guardar la hora en la cookie.
      added_at: new Date(Date.UTC(2026, 0, 1) + i * 1000).toISOString(),
      product,
    }]
  })
}
