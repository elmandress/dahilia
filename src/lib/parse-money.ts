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
