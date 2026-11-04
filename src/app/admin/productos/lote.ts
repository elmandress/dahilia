// Qué manda "Guardar cambios" en la edición de precios en lote (QA-02 y QA-10,
// 04/11/2026).
//
// Antes cada prenda tocada reescribía SIEMPRE el precio base con el valor que
// había al abrir la tabla: si Anush lo cambiaba en la ficha mientras tanto y
// acá solo se tocaba un talle, el base volvía atrás en silencio. Y una celda
// con "1.600" se guardaba como UYU 1 (parseInt). Ahora el base va solo si
// cambió contra lo cargado, cada talle lleva el precio que tenía al abrir la
// tabla (compare-and-set) y lo que no se entiende frena el guardado.
//
// Puro a propósito: lo prueban las unitarias con node:test.

import { parseMoneyUYU } from '@/lib/parse-money'
import type { PrecioNuevo } from '@/lib/parse-money'

/** Lo escrito en la tabla para una prenda. */
export interface BorradorPrecios {
  base?: string
  /** Por NOMBRE de talle, no por id: con un id, el borrador quedaba huérfano
   *  si la prenda se guardaba en su ficha y el talle cambiaba de id. */
  sizes?: Record<string, string>
}

/** Lo que la tabla cargó de la prenda (un Product sirve tal cual). */
export interface ProductoLote {
  base_price_uyu: number | null
  sizes?: Array<{ size: string; price_uyu: number | null }>
}

export interface CambiosLote {
  /** Solo si el precio base cambió contra lo cargado. */
  producto?: { base_price_uyu: number | null }
  /** Cada talle cambiado, con el precio que tenía al abrir la tabla. */
  talles: Array<{ size: string; price_uyu: number | null; esperado: number | null }>
  /** Celdas que no se entienden como monto ("precio base", "talle M"): con
   *  alguna, la prenda no se guarda. */
  invalidos: string[]
}

/** Cómo se muestra un precio guardado en la celda (sin precio → vacía). */
export const textoCelda = (n: number | null | undefined): string => (n ? String(n) : '')

/**
 * Celda → precio. Vacía o en 0 → null, que en esta tabla siempre quiso decir
 * "sin precio propio" (el talle usa el base). undefined → no se entiende.
 */
export function leerCelda(v: string): number | null | undefined {
  if (!v.trim()) return null
  const n = parseMoneyUYU(v)
  if (n == null) return undefined
  return n > 0 ? n : null
}

export function armarCambiosLote(producto: ProductoLote, borrador: BorradorPrecios | undefined): CambiosLote {
  const invalidos: string[] = []
  let cambio: CambiosLote['producto']
  const base = borrador?.base
  if (base !== undefined && base !== textoCelda(producto.base_price_uyu)) {
    const n = leerCelda(base)
    if (n === undefined) invalidos.push('precio base')
    // "1.600" donde había 1600 es la misma plata: no hay nada que escribir.
    else if (n !== (producto.base_price_uyu || null)) cambio = { base_price_uyu: n }
  }
  const talles: CambiosLote['talles'] = []
  for (const s of producto.sizes ?? []) {
    const v = borrador?.sizes?.[s.size]
    if (v === undefined || v === textoCelda(s.price_uyu)) continue
    const n = leerCelda(v)
    if (n === undefined) {
      invalidos.push(`talle ${s.size}`)
      continue
    }
    if (n === (s.price_uyu || null)) continue
    talles.push({ size: s.size, price_uyu: n, esperado: s.price_uyu ?? null })
  }
  return { ...(cambio ? { producto: cambio } : {}), talles, invalidos }
}

/**
 * Los precios que cambian, con su "antes", para el único confirm del guardado
 * (confirmacionDePrecios). Un talle sin precio propio cobraba el base: ese es
 * su "antes".
 */
export function preciosNuevos(producto: ProductoLote, cambios: CambiosLote): PrecioNuevo[] {
  return [
    ...(cambios.producto
      ? [{ etiqueta: 'precio base', antes: producto.base_price_uyu, despues: cambios.producto.base_price_uyu }]
      : []),
    ...cambios.talles.map((t) => ({ etiqueta: `talle ${t.size}`, antes: t.esperado || producto.base_price_uyu, despues: t.price_uyu })),
  ]
}
