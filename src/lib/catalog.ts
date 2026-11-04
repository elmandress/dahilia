// Capa de datos resiliente del catálogo.
//
// Centraliza el bloque de queries que estaba duplicado en la home, /tienda y la
// vista de categoría, y le agrega un fallback: si la DB falla (p. ej. el 402 de
// cuota de Supabase — ver db-health.ts) o devuelve error, sirve el último
// catálogo bueno de esta instancia o, sin él, el snapshot estático commiteado
// (catalog-snapshot.json). Así el sitio sigue mostrando el catálogo en modo
// lectura ("encargá por WhatsApp") en vez de quedar vacío.
//
// El snapshot se genera con `node --env-file=.env.local scripts/snapshot-catalog.mjs`
// cuando la DB está sana, y se commitea antes de cada deploy (quality-gate:
// `node scripts/snapshot-edad.mjs` falla con más de 14 días). Mientras esté
// vacío (DB caída, no se puede snapshotear), `snapshotIsEmpty` es true y
// `proxy.ts` muestra el cartel de mantenimiento full-screen en lugar del catálogo.

import { unstable_cache } from 'next/cache'
import { unstable_rethrow } from 'next/navigation'
import type { Product, Category, Color, Discount, Collection } from '@/lib/types'
import { sortSizes, dropVisibility } from '@/lib/types'
import { createClient } from '@/lib/supabase/public'
import { FOTOS_RESPALDO } from '@/lib/fotos-respaldo'
import { componerCatalogo, type CatalogCore, type CatalogExtra, type LastGood } from '@/lib/catalog-fallback'
import type { Testimonial } from '@/components/TestimonialsStrip'
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
  /** Los productos son en vivo, pero los descuentos y la Configuración (o el
   *  catálogo entero, si es el último bueno) salieron de un respaldo porque esa
   *  consulta falló. Ver lib/catalog-fallback.ts. */
  degraded?: boolean
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
// Mismo orden de talles que los datos en vivo (ver normalizeProducts).
const SNAPSHOT_PRODUCTS: Product[] = SNAPSHOT.products.map((p) => ({ ...p, sizes: sortSizes(p.sizes) }))

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
    products: SNAPSHOT_PRODUCTS,
    categories: SNAPSHOT.categories,
    discounts: SNAPSHOT.discounts,
    settings: SNAPSHOT.settings,
  }
}

/** Aplana el join product_colors → Color[] y ordena los talles (mismo criterio
 *  en todas las rutas). PostgREST no ordena los embebidos: sin el orden, los
 *  talles llegaban como caían (Granny's: M/L antes que S) y el talle por
 *  defecto, y con él el precio de la tarjeta, dependía del azar. */
function normalizeProducts(rows: unknown[]): Product[] {
  return rows.map((p) => {
    const row = p as Product & { colors?: Array<{ color: Color | null }> }
    const joined = (row.colors ?? []) as Array<{ color: Color | null }>
    return {
      ...row,
      colors: joined.map((c) => c.color).filter((c): c is Color => !!c),
      sizes: sortSizes(row.sizes),
    }
  }) as Product[]
}

// collection(*): solo para decidir la visibilidad por drop (ver dropVisibility);
// `*` y no columnas sueltas para tolerar una DB sin drops-2026-07.sql.
const PRODUCT_SELECT =
  '*, category:categories(*), collection:collections(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))'

function snapshotCatalog(): Catalog {
  // Con la base caída, las fotos de Supabase tampoco cargan y solo se ven las
  // prendas que tienen copia local (ver lib/fotos-respaldo). Ordenarlas
  // primero hace que las primeras pantallas de la tienda se vean completas en
  // vez de una grilla de marcadores. Es un orden estable: dentro de cada
  // grupo se respeta el orden del catálogo.
  const conFoto = SNAPSHOT_PRODUCTS.filter((p) => FOTOS_RESPALDO.has(p.slug))
  const sinFoto = SNAPSHOT_PRODUCTS.filter((p) => !FOTOS_RESPALDO.has(p.slug))
  return {
    products: [...conFoto, ...sinFoto],
    categories: SNAPSHOT.categories,
    colors: SNAPSHOT.colors,
    discounts: SNAPSHOT.discounts,
    settings: SNAPSHOT.settings,
    collections: [],
    source: 'snapshot',
  }
}

// Se arma una sola vez: es estático, y getCatalog lo pasa en cada llamada
// aunque casi nunca se use.
const SNAPSHOT_CATALOG = snapshotCatalog()

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

// El catálogo sale de DOS cachés con el mismo tag y la misma ventana: el
// núcleo de la tienda y los ajustes. Cada una lanza si falla cualquiera de sus
// consultas, a propósito: lo que lanza NO se cachea, así que un error
// transitorio no queda congelado durante toda la ventana, y el siguiente
// request vuelve a intentar contra la DB. Separadas, una falla en descuentos o
// Configuración ya no se lleva puestos los productos en vivo (QA-08,
// 04/11/2026): qué se muestra en cada caso lo decide lib/catalog-fallback.ts.
//
// Clientes propios: estos callbacks corren fuera del ciclo de un request (su
// resultado se comparte entre requests), así que no pueden depender de un
// cliente creado en el árbol de render. El cliente público no toca cookies ni
// sesión, con lo cual devuelve lo mismo siempre.

/** Categorías, productos active+soldout con joins, colores y colecciones. */
const fetchCoreCached = unstable_cache(
  async (): Promise<CatalogCore> => {
    const supabase = createClient()
    const [categoriesRes, productsRes, colorsRes, collectionsRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order', { ascending: true }),
      supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .in('status', ['active', 'soldout'])
        .order('sort_order', { ascending: true }),
      supabase.from('colors').select('*').order('sort_order', { ascending: true }),
      // select('*') a propósito (mismo criterio que el sitemap): filtrar
      // unlisted/coming_soon en SQL exigiría que esas columnas existan
      // (drops-2026-07.sql); traer las pocas filas y filtrar en JS tolera
      // una DB sin esa migración.
      supabase.from('collections').select('*').limit(12),
    ])

    // Colores y colecciones también lanzan: devueltos vacíos quedaban
    // cacheados una hora, sin los filtros de color ni "Colecciones" en la nav.
    if (productsRes.error || categoriesRes.error || colorsRes.error || collectionsRes.error) {
      throw new Error('catalog: consulta del núcleo con error')
    }

    // Las prendas de un drop que todavía no se lanzó (colección en borrador,
    // "Próximamente" o "Solo con link") quedan fuera de todos los listados. El
    // join se descarta después: no hace falta que viaje en cada tarjeta.
    const products = normalizeProducts(productsRes.data ?? [])
      .filter((p) => dropVisibility(p) === 'public')
      // Del join queda solo el nombre: el buscador lo usa ("sunset").
      .map((p) => ({ ...p, collection: undefined, collection_name: p.collection?.name ?? undefined }))

    return {
      products,
      categories: (categoriesRes.data ?? []) as Category[],
      colors: (colorsRes.data ?? []) as Color[],
      collections: (collectionsRes.data ?? []) as Collection[],
    }
  },
  ['catalog-core'],
  { revalidate: CATALOG_TTL_SECONDS, tags: [CATALOG_TAG] }
)

/** Descuentos activos y Configuración (site_settings). */
const fetchSettingsCached = unstable_cache(
  async (): Promise<CatalogExtra> => {
    const supabase = createClient()
    const [discountsRes, settingsRes] = await Promise.all([
      supabase.from('discounts').select('*').eq('active', true),
      supabase.from('site_settings').select('key, value'),
    ])

    // Devolverlos vacíos dejaba cacheada una hora la tienda sin el −15% o con
    // la barra de promo y el WhatsApp apagados (auditoría 04/11/2026).
    if (discountsRes.error || settingsRes.error) {
      throw new Error('catalog: descuentos o configuración con error')
    }

    const settings = ((settingsRes.data ?? []) as Array<{ key: string; value: string }>)
      .reduce<Record<string, string>>((acc, r) => ({ ...acc, [r.key]: String(r.value ?? '') }), {})

    return { discounts: (discountsRes.data ?? []) as Discount[], settings }
  },
  ['catalog-settings'],
  { revalidate: CATALOG_TTL_SECONDS, tags: [CATALOG_TAG] }
)

// El último catálogo que salió entero en vivo, en la memoria de esta instancia.
// Cubre los tropiezos cortos de la base: sobre todo el render en frío que
// sigue a cada guardado del admin (que vacía el caché por tag), donde una
// falla justo ahí horneaba el snapshot en el ISR por una hora. Una instancia
// nueva arranca sin él y cae al snapshot, como antes.
let lastGood: LastGood | null = null

/**
 * Catálogo completo, cacheado y resiliente: si falla una parte de la base,
 * los productos siguen en vivo; si falla el núcleo, el último bueno (menos de
 * 24 h) o el snapshot. Ver lib/catalog-fallback.ts.
 */
export async function getCatalog(): Promise<Catalog> {
  const [core, extra] = await Promise.allSettled([fetchCoreCached(), fetchSettingsCached()])
  // No tragar el bailout dinámico / notFound de Next: eso no es la base caída.
  if (core.status === 'rejected') unstable_rethrow(core.reason)
  if (extra.status === 'rejected') unstable_rethrow(extra.reason)

  const now = Date.now()
  const catalog = componerCatalogo({
    core: core.status === 'fulfilled' ? core.value : null,
    extra: extra.status === 'fulfilled' ? extra.value : null,
    lastGood,
    snapshot: SNAPSHOT_CATALOG,
    now,
  })
  if (core.status === 'fulfilled' && extra.status === 'fulfilled') lastGood = { catalog, at: now }
  return catalog
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
    // Drop sin lanzar → como si no existiera. "Solo con link" sí abre: es el
    // acceso anticipado de la lista VIP (la ficha se marca noindex).
    if (!data || dropVisibility(data) === 'hidden') return null
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
    const fromSnap = SNAPSHOT_PRODUCTS.find((p) => p.slug === slug) ?? null
    return { product: fromSnap, source: 'snapshot' }
  }
}

/** Testimonios reales de la tienda, cacheados junto al catálogo. Los muestra la
 *  home y, desde el 19/09/2026, la ficha de producto: sin este caché era una
 *  consulta más por cada ficha renderizada. Si la DB falla, la lista vuelve
 *  vacía (el bloque simplemente no se muestra) y el error NO queda cacheado. */
const fetchTestimonialsCached = unstable_cache(
  async (): Promise<Testimonial[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('testimonials')
      // * y no una lista de columnas: photo_url/product_id existen recién
      // después de fotos-clientas-y-lanas-2026-10.sql, y pedir una columna
      // inexistente haría fallar la consulta entera (sin testimonios).
      .select('*')
      .order('sort_order', { ascending: true })
    if (error) throw new Error('catalog: testimonios con error')
    return (data ?? []) as Testimonial[]
  },
  ['testimonials'],
  { revalidate: CATALOG_TTL_SECONDS, tags: [CATALOG_TAG] }
)

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    return await fetchTestimonialsCached()
  } catch (e) {
    unstable_rethrow(e)
    return []
  }
}
