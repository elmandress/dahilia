// El carrito cuando ni siquiera /api/cart responde (13/11/2026).
//
// lib/cart-local.ts cubre la base caída: la ruta sigue contestando desde una
// cookie. Esto cubre el escalón de abajo: la ruta misma no contesta (sin
// señal, la función de Netlify con error, un 5xx). El navegador ya tiene la
// prenda entera en memoria cuando alguien toca "Agregar", así que el cambio se
// aplica ahí, queda guardado en localStorage y se anota como pendiente. Cuando
// /api/cart vuelve a contestar, los pendientes se le mandan y el carrito queda
// igual en los dos lados. El pedido por WhatsApp se arma en el navegador: no
// necesita nada de esto para salir.
//
// Solo lógica, sin red ni React, para probarla con node:test.

import type { CartItem, Product } from './types'
import { resolverTalle } from './cart-summary'

type Item = CartItem & { product: Product }

const MAX_QTY = 20

/** La cantidad que tiene que quedar de una prenda y talle cuando vuelva el
 *  servidor (0 = sacarla). Absoluta, no "+1": repetir el envío no duplica. */
export interface Pendiente {
  productId: string
  size: string
  qty: number
}

export function anotarPendiente(pendientes: Pendiente[], p: Pendiente): Pendiente[] {
  return [...pendientes.filter((x) => !(x.productId === p.productId && x.size === p.size)), p]
}

export function leerPendientes(raw: string | null | undefined): Pendiente[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!Array.isArray(parsed)) return []
    return parsed.filter((p): p is Pendiente =>
      !!p && typeof p.productId === 'string' && typeof p.size === 'string' && Number.isFinite(p.qty) && p.qty >= 0,
    ).slice(0, 40)
  } catch {
    return []
  }
}

/** Agregar sin servidor. Mismas reglas que la ruta: prenda activa y a la
 *  venta, talle que existe y tiene stock. null = no se puede (y no es una
 *  caída: el aviso de siempre). */
export function agregarOffline(
  items: Item[], product: Product, size: string, qty: number, nuevoId: string, ahora: string,
): { items: Item[]; pendiente: Pendiente } | null {
  if (product.status !== 'active' || product.is_custom_only) return null
  const resolved = resolverTalle(product.sizes ?? [], size)
  if (!resolved.ok) return null
  const talle = resolved.talle
  const existente = items.find((i) => i.product_id === product.id && i.size === talle)
  const total = Math.min(MAX_QTY, (existente?.qty ?? 0) + Math.max(1, qty))
  const next = existente
    ? items.map((i) => (i === existente ? { ...i, qty: total } : i))
    : [...items, { id: nuevoId, cart_id: 'offline', product_id: product.id, size: talle, qty: total, added_at: ahora, product }]
  return { items: next, pendiente: { productId: product.id, size: talle, qty: total } }
}

/** Cambiar cantidad o sacar (qty 0) sin servidor. null si la línea no está. */
export function cambiarOffline(items: Item[], itemId: string, qty: number): { items: Item[]; pendiente: Pendiente } | null {
  const item = items.find((i) => i.id === itemId)
  if (!item) return null
  const q = Math.max(0, Math.min(MAX_QTY, qty))
  return {
    items: q === 0 ? items.filter((i) => i !== item) : items.map((i) => (i === item ? { ...i, qty: q } : i)),
    pendiente: { productId: item.product_id, size: item.size, qty: q },
  }
}

export type PasoSync =
  | { tipo: 'cantidad'; itemId: string; qty: number }
  | { tipo: 'agregar'; productId: string; size: string; qty: number }

/** Qué pedirle a /api/cart para que quede como el carrito del navegador. */
export function planDeSync(pendientes: Pendiente[], delServidor: Array<Pick<CartItem, 'id' | 'product_id' | 'size' | 'qty'>>): PasoSync[] {
  const pasos: PasoSync[] = []
  for (const p of pendientes) {
    const fila = delServidor.find((i) => i.product_id === p.productId && i.size === p.size)
    if (fila) {
      if (fila.qty !== p.qty) pasos.push({ tipo: 'cantidad', itemId: fila.id, qty: p.qty })
    } else if (p.qty > 0) {
      pasos.push({ tipo: 'agregar', productId: p.productId, size: p.size, qty: p.qty })
    }
  }
  return pasos
}
