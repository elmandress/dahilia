import type { SupabaseClient } from '@supabase/supabase-js'
import { parseDecimal, parseMoneyUYU } from './parse-money'

/** Margen por defecto de una prenda nueva o sin margen guardado (el de siempre). */
export const DEFAULT_MARGIN_PCT = 15

/**
 * Horas o margen tal como se escriben: "12,5" → 12.5, "15%" → 15; vacío o
 * basura → null. Con las reglas de lib/parse-money.ts (QA-02): parseFloat leía
 * "1.600" como 1,6. El margen no pasa por parsePercent a propósito: acá va de
 * 0 a 300 y con un decimal, no de 0 a 90 como un descuento.
 */
export function parseNum(s: string): number | null {
  return parseDecimal(s.replace('%', ''))
}

/**
 * Guarda horas, materiales y margen de una prenda en product_costs (tabla
 * privada del admin). El margen vive en margin_pct, que existe recién después
 * de database/margen-por-prenda-2026-10.sql: si la columna falta, se guarda lo
 * demás y se devuelve un aviso — nunca se pierde el guardado del producto.
 * Devuelve null si salió todo bien, o el texto del aviso.
 */
export async function saveProductCosts(
  supabase: SupabaseClient,
  productId: string,
  input: { hours: string; materials: string; margin: string },
): Promise<string | null> {
  const h = parseNum(input.hours)
  // Materiales en pesos enteros, como cualquier monto del admin.
  const m = parseMoneyUYU(input.materials)
  const mg = parseNum(input.margin)
  // Un campo escrito que no se entiende no se guarda como vacío: el upsert
  // reescribe la fila entera y borraría lo que ya estaba cargado.
  const unreadable = [
    input.hours.trim() && h == null ? `las horas («${input.hours.trim()}»)` : '',
    input.materials.trim() && m == null ? `los materiales («${input.materials.trim()}»: van en pesos, sin centavos)` : '',
    input.margin.trim() && mg == null ? `el margen («${input.margin.trim()}»)` : '',
  ].filter(Boolean)
  if (unreadable.length > 0) {
    const list = unreadable.length === 1 ? unreadable[0] : `${unreadable.slice(0, -1).join(', ')} y ${unreadable[unreadable.length - 1]}`
    return `La calculadora no se guardó: no se ${unreadable.length === 1 ? 'entiende' : 'entienden'} ${list}. Corregilo y guardá de nuevo.`
  }
  const hours = h != null && h > 0 ? Math.round(h * 10) / 10 : null
  const materials = m != null && m >= 0 ? m : null
  const margin = mg != null && mg >= 0 ? Math.min(300, Math.round(mg * 10) / 10) : null
  if (hours == null && materials == null && margin == null) return null

  const row = { product_id: productId, labor_hours: hours, materials_cost_uyu: materials, updated_at: new Date().toISOString() }
  const { error } = await supabase.from('product_costs').upsert({ ...row, margin_pct: margin })
  if (!error) return null
  if (/margin_pct/.test(error.message)) {
    const retry = await supabase.from('product_costs').upsert(row)
    if (retry.error) return `No se guardaron las horas y materiales de la calculadora (${retry.error.message}).`
    return 'Horas y materiales guardados; el margen no, porque falta correr database/margen-por-prenda-2026-10.sql en Supabase.'
  }
  return `No se guardaron las horas y materiales de la calculadora (${error.message}).`
}
