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

import { unstable_cache } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import type { Product, Category, Color, Discount, Collection } from '@/lib/types'
import { createClient } from '@/lib/supabase/public'
import snapshot from '@/lib/catalog-snapshot.json'

export type CatalogSource = 'live' | 'snapshot'

export interface Catalog {
  products: Product[]
  categories: Category[]
  colors: Color[]
  discounts: Discount[]
  settings: Record<string, string>
  /** Colecciones (pocas filas). Viven acá para que el layout raíz —que corre en
   *  TODAS las páginas— no tenga que hacer su propia consulta por visita: con
   *  el catálogo cacheado, la navegación se arma sin tocar la DB. En modo
   *  snapshot queda vacío (la nav esconde "Colecciones" durante una caída). */
  collections: Collection[]
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
    collections: [],
    source: 'snapshot',
  }
}

// ── Caché de datos (egress de Supabase) ──────────────────────────────
//
// El catálogo lo piden la home, /tienda, cada página de categoría y cada
// ficha. /tienda además es una ruta DINÁMICA (lee searchParams para los
// filtros), así que sin esta capa cada visita a la tienda disparaba las 5
// queries de abajo contra Supabase — el egress escalaba con el tráfico, no
// con los cambios del catálogo. Con unstable_cache el resultado se comparte
// entre TODAS las páginas y visitas durante la ventana de revalidación:
// pasamos de "N queries por visita" a "5 queries cada 5 minutos", sirviendo
// exactamente los mismos datos.
//
// Freshness: el admin ya avisa de cada cambio (lib/seo-notify.ts →
// /api/seo/reindex), y ese endpoint ahora también invalida este tag, así que
// guardar un producto/precio/categoría en el CMS se ve al instante. Los 5
// minutos son solo el techo para cambios hechos por fuera del admin (SQL
// directo en Supabase, por ejemplo).
export const CATALOG_TAG = 'catalog'
// 1 hora, igual que el `export const revalidate = 3600` que ya declaraban la
// home, /tienda/[slug] y compañía. El valor NO es arbitrario: Next toma el
// MÍNIMO de todos los revalidate del árbol, así que un TTL más corto acá
// arrastraría el ISR de todas las páginas del sitio a ese número (con 300s el
// build pasaba a mostrar "5m" en cada ruta). Manteniendo 3600 la política de
// frescura del sitio queda exactamente como estaba, y la inmediatez de los
// cambios del CMS la da la invalidación por tag, no el TTL.
const CATALOG_TTL_SECONDS = 3600

/**
 * Catálogo completo (categorías, productos active+soldout con joins, colores,
 * descuentos activos y settings). Lanza si la DB falla — a propósito: lo que
 * lanza NO se cachea, así que un error transitorio no queda congelado en el
 * caché durante toda la ventana (el fallback al snapshot lo resuelve
 * `getCatalog`, y el siguiente request vuelve a intentar contra la DB).
 */
const fetchCatalogCached = unstable_cache(
  async (): Promise<Catalog> => {
    // Cliente propio: este callback corre fuera del ciclo de un request (su
    // resultado se comparte entre requests), así que no puede depender de un
    // cliente creado en el árbol de render. El cliente público no toca
    // cookies ni sesión, con lo cual devuelve lo mismo siempre.
    const supabase = createClient()
    const [categoriesRes, productsRes, colorsRes, discountsRes, settingsRes, collectionsRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .in('status', ['active', 'soldout'])
        .order('sort_order', { ascending: true }),
      supabase.from('colors').select('*').order('sort_order', { ascending: true }),
      supabase.from('discounts').select('*').eq('active', true),
      supabase.from('site_settings').select('key, value'),
      // select('*') a propósito (mismo criterio que el sitemap): filtrar
      // unlisted/coming_soon en SQL exigiría que esas columnas existan
      // (drops-2026-07.sql); traer las pocas filas y filtrar en JS tolera
      // una DB sin esa migración.
      supabase.from('collections').select('*').limit(12),
    ])

    // Un error en la query de productos (la que sostiene la tienda) dispara el
    // fallback. Lanzar (en vez de devolver el snapshot acá adentro) es lo que
    // evita que una caída transitoria de la DB quede cacheada 5 minutos.
    if (productsRes.error || categoriesRes.error) {
      throw new Error('catalog: consulta principal con error')
    }

    const settings = ((settingsRes.data ?? []) as Array<{ key: string; value: string }>)
      .reduce<Record<string, string>>((acc, r) => ({ ...acc, [r.key]: String(r.value ?? '') }), {})

    return {
      products: normalizeProducts(productsRes.data ?? []),
      categories: (categoriesRes.data ?? []) as Category[],
      colors: (colorsRes.data ?? []) as Color[],
      discounts: (discountsRes.data ?? []) as Discount[],
      settings,
      collections: (collectionsRes.data ?? []) as Collection[],
      source: 'live',
    }
  },
  ['catalog'],
  { revalidate: CATALOG_TTL_SECONDS, tags: [CATALOG_TAG] }
)

/**
 * Catálogo completo, cacheado y con fallback al snapshot ante error de DB.
 * Si la consulta central falla se sirve el snapshot entero — no un mix a
 * medias que confundiría al visitante.
 */
export async function getCatalog(): Promise<Catalog> {
  try {
    return await fetchCatalogCached()
  } catch (e) {
    unstable_rethrow(e) // no tragar el bailout dinámico / notFound de Next
    return snapshotCatalog()
  }
}

/** Igual que arriba pero por slug: cacheado (el slug entra en la clave de
 *  caché automáticamente, ver docs de unstable_cache) y con la misma regla de
 *  "lo que falla no se cachea". */
const fetchProductBySlugCached = unstable_cache(
  async (slug: string): Promise<Product | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, category:categories(*), collection:collections(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(*, color:colors(*))'
      )
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw new Error('catalog: producto por slug con error')
    if (!data) return null
    return normalizeProducts([data])[0]
  },
  ['product-by-slug'],
  { revalidate: CATALOG_TTL_SECONDS, tags: [CATALOG_TAG] }
)

/** Un producto por slug, con fallback al snapshot. `source` indica de dónde vino
 *  para que la PDP muestre (o no) el banner de "modo lectura". */
export async function getProductBySlug(
  slug: string
): Promise<{ product: Product | null; source: CatalogSource }> {
  try {
    return { product: await fetchProductBySlugCached(slug), source: 'live' }
  } catch (e) {
    unstable_rethrow(e) // no tragar el bailout dinámico / notFound de Next
    const fromSnap = SNAPSHOT.products.find((p) => p.slug === slug) ?? null
    return { product: fromSnap, source: 'snapshot' }
  }
}
