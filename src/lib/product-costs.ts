import type { SupabaseClient } from '@supabase/supabase-js'

/** Margen por defecto de una prenda nueva o sin margen guardado (el de siempre). */
export const DEFAULT_MARGIN_PCT = 15

/** "12,5" → 12.5; vacío/basura → null. */
export function parseNum(s: string): number | null {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : null
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
  const m = parseNum(input.materials)
  const mg = parseNum(input.margin)
  const hours = h != null && h > 0 ? Math.round(h * 10) / 10 : null
  const materials = m != null && m >= 0 ? Math.round(m) : null
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
