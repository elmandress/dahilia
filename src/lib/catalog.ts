// Capa de datos resiliente del catálogo.
//
// Centraliza el bloque de queries que estaba duplicado en la home, /tienda y la
// vista de categoría, y le agrega un fallback: si la DB falla (p. ej. el 402 de
// cuota de Supabase — ver db-health.ts) o devuelve error, sirve el snapshot
// estático commiteado (catalog-snapshot.json). Así el sitio sigue mostrando el
// catálogo en modo lectura ("encargá por WhatsApp") en vez de quedar vacío.
//
// El snapshot se genera con `node scripts/snapshot-catalog.mjs` cuando la DB
// está sana, y se commitea. Mientras esté vacío (DB caída, no se puede
// snapshotear), `snapshotIsEmpty` es true y `proxy.ts` muestra el cartel de
// mantenimiento full-screen en lugar del catálogo.

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Product, Category, Color, Discount } from '@/lib/types'
import snapshot from '@/lib/catalog-snapshot.json'

export type CatalogSource = 'live' | 'snapshot'

export interface Catalog {
  products: Product[]
  categories: Category[]
  colors: Color[]
  discounts: Discount[]
  settings: Record<string, string>
  source: CatalogSource
}

interface Snapshot {
  generatedAt: string | null
  products: Product[]
  categories: Category[]
  colors: Color[]
  discounts: Discount[]
  settings: Record<string, string>
}

const SNAPSHOT = snapshot as unknown as Snapshot

/** El snapshot no tiene productos → no hay catálogo que servir en una caída, así
 *  que `proxy.ts` muestra el cartel de mantenimiento en vez del catálogo. */
export const snapshotIsEmpty = SNAPSHOT.products.length === 0

/** Datos crudos del snapshot — para la PDP y el resolvedor de slugs, que en modo
 *  lectura arman descuentos, settings, categorías y relacionados desde acá (sin
 *  volver a pegarle a la DB caída). */
export function getSnapshotData(): {
  products: Product[]
  categories: Category[]
  discounts: Discount[]
  settings: Record<string, string>
} {
  return {
    products: SNAPSHOT.products,
    categories: SNAPSHOT.categories,
    discounts: SNAPSHOT.discounts,
    settings: SNAPSHOT.settings,
  }
}

/** Aplana el join product_colors → Color[] (mismo criterio en todas las rutas). */
function normalizeProducts(rows: unknown[]): Product[] {
  return rows.map((p) => {
    const row = p as Product & { colors?: Array<{ color: Color | null }> }
    const joined = (row.colors ?? []) as Array<{ color: Color | null }>
    return { ...row, colors: joined.map((c) => c.color).filter((c): c is Color => !!c) }
  }) as Product[]
}

const PRODUCT_SELECT =
  '*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))'

function snapshotCatalog(): Catalog {
  return {
    products: SNAPSHOT.products,
    categories: SNAPSHOT.categories,
    colors: SNAPSHOT.colors,
    discounts: SNAPSHOT.discounts,
    settings: SNAPSHOT.settings,
    source: 'snapshot',
  }
}

/**
 * Catálogo completo (categorías, productos active+soldout con joins, colores,
 * descuentos activos y settings), con fallback al snapshot ante error de DB.
 * Si CUALQUIERA de las queries centrales devuelve error, se sirve el snapshot
 * entero — no un mix a medias que confundiría al visitante.
 */
export async function getCatalog(supabase: SupabaseClient): Promise<Catalog> {
  try {
    const [categoriesRes, productsRes, colorsRes, discountsRes, settingsRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .in('status', ['active', 'soldout'])
        .order('sort_order', { ascending: true }),
      supabase.from('colors').select('*').order('sort_order', { ascending: true }),
      supabase.from('discounts').select('*').eq('active', true),
      supabase.from('site_settings').select('key, value'),
    ])

    // Un error en la query de productos (la que sostiene la tienda) dispara el
    // fallback. Categorías/colores/descuentos vacíos por error también.
    if (productsRes.error || categoriesRes.error) return snapshotCatalog()

    const settings = ((settingsRes.data ?? []) as Array<{ key: string; value: string }>)
      .reduce<Record<string, string>>((acc, r) => ({ ...acc, [r.key]: String(r.value ?? '') }), {})

    return {
      products: normalizeProducts(productsRes.data ?? []),
      categories: (categoriesRes.data ?? []) as Category[],
      colors: (colorsRes.data ?? []) as Color[],
      discounts: (discountsRes.data ?? []) as Discount[],
      settings,
      source: 'live',
    }
  } catch {
    return snapshotCatalog()
  }
}

/** Un producto por slug, con fallback al snapshot. `source` indica de dónde vino
 *  para que la PDP muestre (o no) el banner de "modo lectura". */
export async function getProductBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<{ product: Product | null; source: CatalogSource }> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, category:categories(*), collection:collections(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(*, color:colors(*))'
      )
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      const fromSnap = SNAPSHOT.products.find((p) => p.slug === slug) ?? null
      return { product: fromSnap, source: 'snapshot' }
    }
    if (!data) return { product: null, source: 'live' }
    return { product: normalizeProducts([data])[0], source: 'live' }
  } catch {
    const fromSnap = SNAPSHOT.products.find((p) => p.slug === slug) ?? null
    return { product: fromSnap, source: 'snapshot' }
  }
}
