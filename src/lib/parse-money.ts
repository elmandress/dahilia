// Un solo parser para todo número que tipea una persona en Uruguay (QA-03,
// 04/11/2026). Antes cada campo tenía el suyo: parseInt('2.000') daba 2, y en
// /regalo una tarjeta de UYU 2.000 le llegaba a Anush como "Monto: UYU 2".
//
// Reglas:
//  - Se ignoran "$", "$U", "UYU", "pesos" y los espacios (también el duro y el fino).
//  - Dólares ("U$S", "USD", "dólares") → null: otra moneda, no se adivina.
//  - Con "." y "," a la vez: el ÚLTIMO es el decimal ("1.600,50" → 1600,5; "1,600.50" → 1600.5).
//  - Con un solo tipo de separador:
//      · repetido → miles ("1.600.000" → 1600000)
//      · una vez y seguido de EXACTAMENTE 3 dígitos → miles ("1.600" → 1600; "1,600" → 1600)
//      · si no → decimal ("1600,5" → 1600.5; "12.5" → 12.5; "0.600" → 0.6)
//  - Cualquier otra cosa (letras, "2 de 4", "1e3", vacío) → null, nunca un número inventado.
//
// Puro a propósito (sin JSX ni next/*): lo prueban las unitarias con node:test.

import { formatPrice } from './types'

const DOLLARS = /u\$s|us\$|usd|d[oó]lar/i
const NOISE = /(?:uyu|\$u|\$|pesos?)/gi
// \s ya incluye el espacio duro (U+00A0) y el fino (U+202F); van explícitos
// porque son los que mete el teclado o el copiar y pegar de un precio.
const SPACES = /[\s   ]+/g
// Parte entera con separador de miles: grupos de 3, nada más.
const GROUPED: Record<'.' | ',', RegExp> = {
  '.': /^\d{1,3}(\.\d{3})*$/,
  ',': /^\d{1,3}(,\d{3})*$/,
}

/** Número con decimales tal como lo escribe una persona (horas, margen). null si no se entiende. */
export function parseDecimal(input: unknown): number | null {
  if (typeof input === 'number') return Number.isFinite(input) ? input : null
  if (typeof input !== 'string') return null
  if (DOLLARS.test(input)) return null // otra moneda: no adivinar
  let s = input.replace(NOISE, '').replace(SPACES, '')
  if (s === '' || !/^-?[\d.,]+$/.test(s)) return null
  const neg = s.startsWith('-')
  if (neg) s = s.slice(1)
  const lastDot = s.lastIndexOf('.')
  const lastComma = s.lastIndexOf(',')
  let normalized: string
  if (lastDot !== -1 && lastComma !== -1) {
    const dec = lastDot > lastComma ? '.' : ','
    const group = dec === '.' ? ',' : '.'
    const parts = s.split(dec)
    if (parts.length !== 2) return null // dos decimales: basura
    const [int, frac] = parts
    if (!GROUPED[group].test(int) || frac === '' || !/^\d+$/.test(frac)) return null
    normalized = int.split(group).join('') + '.' + frac
  } else if (lastDot !== -1 || lastComma !== -1) {
    const sep = lastDot !== -1 ? '.' : ','
    const parts = s.split(sep)
    if (parts.length > 2) {
      if (!/^\d{1,3}$/.test(parts[0]) || !parts.slice(1).every((p) => /^\d{3}$/.test(p))) return null
      normalized = parts.join('')
    } else if (/^\d{3}$/.test(parts[1]) && /^[1-9]\d{0,2}$/.test(parts[0])) {
      normalized = parts.join('') // "1.600" → 1600
    } else {
      if (parts[0] === '' || parts[1] === '') return null
      normalized = parts[0] + '.' + parts[1]
    }
  } else {
    normalized = s
  }
  const n = Number(normalized)
  if (!Number.isFinite(n)) return null
  return neg ? -n : n
}

/**
 * Pesos enteros, >= 0. "1.600" → 1600; "$ 1.600" → 1600; "1.600,00" → 1600.
 * Con centavos distintos de cero da null: en la tienda no hay centavos, así que
 * "1.600,50" o "1600,5" son casi siempre un tipeo, y es mejor preguntar que
 * redondear un monto que nadie escribió.
 */
export function parseMoneyUYU(input: unknown, { max = 10_000_000 }: { max?: number } = {}): number | null {
  const n = parseDecimal(input)
  if (n == null || n < 0 || n > max || !Number.isInteger(n)) return null
  return n
}

/** Porcentaje 0–90 (descuentos y cupones). "15%" → 15; "12,5" → 13. */
export function parsePercent(input: unknown): number | null {
  const n = parseDecimal(typeof input === 'string' ? input.replace('%', '') : input)
  if (n == null || n < 0 || n > 90) return null
  return Math.round(n)
}

/** Entero chico y limpio, de 0 a 9999 (cupos, usos). "4" → 4; "2 de 4" → null (no 24). */
export function parseCount(input: unknown): number | null {
  if (typeof input === 'number') return Number.isInteger(input) && input >= 0 && input <= 9999 ? input : null
  const s = String(input ?? '').trim()
  if (!/^\d{1,4}$/.test(s)) return null
  return Number(s)
}

// ── Precio que conviene confirmar (QA-02, 04/11/2026) ──────────────────────
// El parser ya no lee "1.600" como 1, pero un tipeo sigue pudiendo dejar un
// precio absurdo ("2" en vez de "2000", un cero de más). Hoy ninguna prenda
// vale menos de UYU 100 y un ajuste real nunca mueve el precio más de la mitad:
// cualquiera de las dos cosas se pregunta antes de publicarla.
const PISO_SOSPECHOSO = 100
const SALTO_SOSPECHOSO = 0.5

/**
 * Cómo cambia un precio que conviene confirmar ("pasa de UYU 1.890 a UYU 2"),
 * o null si el cambio es normal. Sin precio nuevo (talle que vuelve al precio
 * base, prenda sin precio) no hay nada que confirmar.
 */
export function saltoDePrecio(antes: number | null | undefined, despues: number | null | undefined): string | null {
  if (despues == null || despues === antes) return null
  const habia = antes != null && antes > 0
  const bajo = despues < PISO_SOSPECHOSO
  const salta = habia && Math.abs(despues - antes) / antes > SALTO_SOSPECHOSO
  if (!bajo && !salta) return null
  return habia ? `pasa de ${formatPrice(antes)} a ${formatPrice(despues)}` : `queda en ${formatPrice(despues)}`
}

/** "¿Seguro? Pasa de UYU 1.890 a UYU 2" para un window.confirm, o null si no hace falta preguntar. */
export function precioSospechoso(antes: number | null | undefined, despues: number | null | undefined): string | null {
  const salto = saltoDePrecio(antes, despues)
  return salto ? `¿Seguro? ${salto.charAt(0).toUpperCase()}${salto.slice(1)}` : null
}

export interface PrecioNuevo {
  /** "precio base", "talle M", "Top Race, talle M". */
  etiqueta: string
  antes: number | null | undefined
  despues: number | null | undefined
}

/**
 * Una sola pregunta para window.confirm con todos los precios que conviene
 * revisar, o null si no hay ninguno. Con uno, la pregunta corta de
 * precioSospechoso; con varios, uno por línea. Así "Poner en todos" con un
 * tipeo pregunta una vez y no una por talle.
 */
export function confirmacionDePrecios(cambios: PrecioNuevo[]): string | null {
  const dudas = cambios.flatMap((c) => {
    const salto = saltoDePrecio(c.antes, c.despues)
    return salto ? [{ ...c, salto }] : []
  })
  if (dudas.length === 0) return null
  if (dudas.length === 1) return `${precioSospechoso(dudas[0].antes, dudas[0].despues)} (${dudas[0].etiqueta}).`
  return `¿Seguro? Revisá estos precios:\n\n${dudas.map((d) => `• ${d.etiqueta}: ${d.salto}`).join('\n')}`
}
