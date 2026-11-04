// Una sola cuenta de lo que se puede pedir (QA-01, 04/11/2026). El globito del
// header, el cajón, /carrito, la línea de envío gratis y el mensaje de WhatsApp
// sumaban cada uno a su manera: el cajón contaba una prenda agotada y prometía
// envío gratis que /carrito negaba un toque después. Ahora todos salen de acá.
//
// Puro a propósito (sin JSX ni next/*): lo prueban las unitarias con node:test.
import type { CartItem, Discount, Product, ProductSize } from './types'
import { dropVisibility, getFinalPrice, isReadyToShip, isUnicoLabel, readyDateEstimate } from './types'

/** Por qué un ítem del carrito ya no se puede pedir. */
export type CartIssue =
  | 'sin-producto' // la base ya no devuelve la prenda
  | 'no-activa' // agotada o en borrador
  | 'a-medida' // pasó a hacerse solo a medida
  | 'drop-oculto' // su colección volvió a borrador o "Próximamente"
  | 'talle-inexistente' // el talle se renombró o se borró
  | 'talle-agotado' // el talle existe pero está sin stock

type Item = Pick<CartItem, 'size' | 'qty'> & { product?: Product | null }
type WithProduct<T> = T & { product: Product }

/** La fila de talle que corresponde al talle guardado: exacta, o 'Único' ↔ 'Talle único'. */
export function findSizeRow<T extends Pick<ProductSize, 'size'>>(rows: T[], talle: string): T | undefined {
  return rows.find((r) => r.size === talle) ?? (isUnicoLabel(talle) ? rows.find((r) => isUnicoLabel(r.size)) : undefined)
}

/**
 * null si el ítem se puede pedir; si no, el motivo. La ruta del carrito lee con
 * la clave de servicio, así que la RLS no esconde las prendas que cambiaron
 * después de agregarlas: hay que mirarlas acá.
 */
export function cartItemIssue(item: Item): CartIssue | null {
  const p = item.product
  if (!p) return 'sin-producto'
  if (p.status !== 'active') return 'no-activa'
  if (p.is_custom_only) return 'a-medida'
  // El drop solo se mira si el join de la colección vino (GET /api/cart lo trae
  // desde 04/11/2026). Sin join, dropVisibility da 'hidden' para toda prenda
  // con colección, y las copias viejas del carrito en localStorage marcarían
  // todo Sunset como no disponible.
  if (p.collection !== undefined) {
    const raw = p.collection as unknown
    const collection = (Array.isArray(raw) ? raw[0] : raw) as Product['collection'] | null
    if (dropVisibility({ collection_id: p.collection_id, collection }) === 'hidden') return 'drop-oculto'
  }
  const rows = p.sizes ?? []
  // Sin filas de talle es una pieza de talle único: vale.
  if (rows.length === 0) return null
  const row = findSizeRow(rows, item.size)
  if (!row) return 'talle-inexistente'
  if (row.available === false) return 'talle-agotado'
  return null
}

export interface CartSummary<T extends Item> {
  /** Lo que se pide: va al total, al globito y al mensaje. */
  buyable: WithProduct<T>[]
  /** Lo que se muestra en gris con su motivo (solo ítems con prenda: sin ella no hay qué mostrar). */
  unavailable: Array<{ item: WithProduct<T>; issue: CartIssue }>
  /** Unidades pedibles (el globito). */
  count: number
  /** Precio final (con descuentos de prenda y de lote) por cantidad, solo de lo pedible. */
  subtotal: number
}

export function summarizeCart<T extends Item>(items: T[], discounts: Discount[] = []): CartSummary<T> {
  const buyable: WithProduct<T>[] = []
  const unavailable: Array<{ item: WithProduct<T>; issue: CartIssue }> = []
  for (const item of items) {
    const issue = cartItemIssue(item)
    if (issue === null) buyable.push(item as WithProduct<T>)
    else if (item.product) unavailable.push({ item: item as WithProduct<T>, issue })
  }
  return {
    buyable,
    unavailable,
    count: buyable.reduce((n, i) => n + i.qty, 0),
    subtotal: buyable.reduce((s, i) => s + getFinalPrice(i.product, i.size, discounts) * i.qty, 0),
  }
}

/** Qué decir de un ítem que ya no se puede pedir (/carrito muestra el motivo). */
export function motivoNoDisponible(issue: CartIssue, product?: Pick<Product, 'status'> | null): string {
  switch (issue) {
    case 'no-activa':
      return product?.status === 'soldout' ? 'Se agotó' : 'Ya no está a la venta'
    case 'a-medida':
      return 'Ahora se teje solo a medida'
    case 'drop-oculto':
      return 'Todavía no está a la venta'
    case 'talle-agotado':
      return 'Se agotó ese talle'
    case 'talle-inexistente':
      return 'Ese talle cambió'
    default:
      return 'Ya no está disponible'
  }
}

export type ResolverTalle =
  | { ok: true; talle: string }
  | { ok: false; status: 400 | 409; error: string }

export const TALLE_MAX = 40

/**
 * El talle que se guarda en el carrito, validado contra TODAS las filas de la
 * prenda (QA-07). Antes solo se rechazaba una fila que existía sin stock: un
 * talle inexistente pasaba como si la prenda no tuviera talles, y el carrito lo
 * marcaba "no disponible" apenas se agregaba. Sin filas, la pieza es de talle
 * único y se guarda 'Único'. Con fila 'Talle único', un 'Único' la encuentra.
 */
export function resolverTalle(
  filas: Array<{ size: string; available?: boolean | null }> | null | undefined,
  talle: string
): ResolverTalle {
  if (talle.length > TALLE_MAX) return { ok: false, status: 400, error: 'Talle inválido.' }
  const rows = filas ?? []
  if (rows.length === 0) return { ok: true, talle: 'Único' }
  const row = findSizeRow(rows, talle)
  if (!row || row.available === false) return { ok: false, status: 409, error: 'Ese talle no está disponible.' }
  return { ok: true, talle: row.size }
}

/**
 * El renglón de plazo de cada prenda del carrito y del cajón. Pieza ya tejida:
 * no le aplica la cola ni el "se teje al encargar" (mismo criterio que la
 * ficha). Con aviso de cola activo no se promete fecha por prenda: el aviso
 * global manda. null si no hay nada cierto que decir.
 */
export function plazoLinea(product: Product, queueNote: string): { text: string; ready: boolean } | null {
  if (isReadyToShip(product)) return { text: 'En stock: sale sin la espera de los encargos', ready: true }
  if (queueNote.trim()) return null
  const estimate = readyDateEstimate(product.lead_time_weeks_min, product.lead_time_weeks_max)
  return estimate ? { text: `Se teje al encargar: lista ${estimate}`, ready: false } : null
}
