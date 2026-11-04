// Cómo se guardan los talles de una prenda desde el editor (QA-M1 y CRO-06,
// 04/11/2026).
//
// Antes: borrar TODOS los talles y volver a insertarlos. Si el insert fallaba
// (red del celular, sesión vencida, cuota de Supabase), la prenda quedaba
// activa y sin talles: pasaba a talle único con el precio base y perdía los
// precios por talle. Además los ids cambiaban en cada guardado.
//
// Ahora: upsert por (product_id, size), que ya es UNIQUE en la base, y recién
// después se borran los que se quitaron del formulario. En ningún momento la
// prenda queda con cero talles, y si algo falla el reintento converge. Los ids
// de los talles que siguen quedan estables (el lote de precios ya no pierde
// borradores).
//
// Puro a propósito: lo prueban las unitarias con node:test.

export interface TalleExistente {
  id: string
  size: string
}

export interface TalleFormulario {
  size: string
  /** Ya leído con parseMoneyUYU; null = usa el precio base. */
  price_uyu: number | null
  available: boolean
}

/** Fila para el upsert. Sin stock_qty a propósito: ese número no se edita en
 *  este formulario y el upsert no tiene que pisar las unidades contadas. */
export interface TalleUpsert {
  product_id: string
  size: string
  price_uyu: number | null
  available: boolean
  sort_order: number
}

export interface PlanTalles {
  upserts: TalleUpsert[]
  deleteIds: string[]
}

/**
 * Qué escribir y qué borrar. Los talles vacíos no cuentan; el orden es el del
 * formulario. Un talle renombrado es uno nuevo (upsert) más el viejo que se
 * borra. Nunca "borrar todo e insertar": solo se borran los ids cuyo nombre ya
 * no está en el formulario.
 */
export function planTalles(existentes: TalleExistente[], formulario: TalleFormulario[], productId: string): PlanTalles {
  const upserts: TalleUpsert[] = []
  const vistos = new Set<string>()
  for (const t of formulario) {
    const size = t.size.trim()
    // Dos filas con el mismo talle en un solo upsert hacen fallar a Postgres
    // ("cannot affect row a second time"): el editor ya lo frena antes, y acá
    // queda la primera por las dudas.
    if (!size || vistos.has(size)) continue
    vistos.add(size)
    upserts.push({ product_id: productId, size, price_uyu: t.price_uyu, available: t.available, sort_order: upserts.length })
  }
  const deleteIds = existentes.filter((e) => !vistos.has(e.size)).map((e) => e.id)
  return { upserts, deleteIds }
}
