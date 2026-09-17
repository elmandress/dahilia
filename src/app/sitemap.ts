import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/public'
import { getCatalog, getSnapshotData } from '@/lib/catalog'
import { SITE_URL } from '@/lib/env'
import { botImageUrl } from '@/lib/media'
import { getAllArticles } from '@/content/blog'
import { withHeroOverride } from '@/content/blog/hero'

export const revalidate = 3600

// Next serializa el sitemap con interpolación de string cruda (ver
// node_modules/next/dist/build/webpack/loaders/metadata/resolve-route-data.js
// → resolveSitemap: `<image:loc>${image}</image:loc>` sin escapar) — no es
// un helper que decida por nosotros, así que el `&` de las URLs de
// botImageUrl (?url=...&w=...&q=...) rompe el XML ("EntityRef: expecting
// ';'" en cualquier validador). Se escapa acá, en el único lugar del código
// donde una URL dinámica entra a XML crudo — el resto de los usos de
// botImageUrl van a JSON-LD/HTML, que ya escapan solos.
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Todas las fotos de cada página, no solo la principal (17/09/2026). Google
// Imágenes ya muestra las fotos del blog, pero el sitemap declaraba una sola
// por página: 37 de las 101 fotos del catálogo y ninguna de las que van dentro
// de las notas. La principal va primera. Tope de 10 por página, muy por
// debajo del límite de Google (1.000).
const MAX_IMAGES_PER_URL = 10

function productImages(media: { url: string; is_primary: boolean; type: string }[] = []): string[] {
  const photos = media.filter((m) => m.type === 'image')
  const ordered = [...photos.filter((m) => m.is_primary), ...photos.filter((m) => !m.is_primary)]
  return [...new Set(ordered.map((m) => m.url))]
    .slice(0, MAX_IMAGES_PER_URL)
    .map((url) => xmlEscape(botImageUrl(SITE_URL, url)))
}

/**
 * Dynamic sitemap — auto-updates whenever products, categories, or collections
 * are added or modified. No manual maintenance needed.
 *
 * Hub pages that only make sense with data (/ofertas, /colecciones) are added
 * ONLY when there is something to show, so we never advertise empty/thin pages
 * to Google.
 *
 * Priority scale:
 *   1.0  Home
 *   0.9  /tienda (hub page)
 *   0.85 Category pages (/tienda/[cat]) — canonical URLs for SEO
 *   0.8  Active product pages
 *   0.75 Collections / lookbooks · /ofertas
 *   0.7  Soldout product pages · /colecciones hub
 *   0.6  Encargo, contacto
 *   0.5  Info, atelier, terminos
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Sin lastModified en las rutas estáticas A PROPÓSITO: poner "ahora" en cada
  // regeneración es el anti-patrón que Google documenta — solo usa lastmod si
  // es "consistently accurate", y detectar fechas infladas hace que lo ignore
  // para TODO el sitio, incluidos los productos (que sí llevan updated_at real).
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,          changeFrequency: 'weekly',  priority: 1    },
    { url: `${SITE_URL}/tienda`,    changeFrequency: 'daily',   priority: 0.9  },
    { url: `${SITE_URL}/blog`,      changeFrequency: 'weekly',  priority: 0.7  },
    // 0.8: /encargo es la página que más retiene (29s por usuario, el doble que
    // una ficha) y la que mejor rankea en las consultas de intención de compra
    // ("tejidos a medida", "dónde mandar hacer"). Estaba en 0.6, por debajo de
    // páginas institucionales que convierten mucho menos.
    { url: `${SITE_URL}/encargo`,   changeFrequency: 'monthly', priority: 0.8  },
    { url: `${SITE_URL}/atelier`,   changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/info`,      changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/contacto`,  changeFrequency: 'monthly', priority: 0.6  },
    { url: `${SITE_URL}/tejedoras`, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/terminos`,  changeFrequency: 'yearly',  priority: 0.3  },
  ]

  // Notas del blog. Viven en el repo (src/content/blog), así que a diferencia
  // del resto del sitemap no dependen de la base: si Supabase está caído, el
  // sitemap igual publica el blog completo. `lastModified` sale de la fecha
  // real de publicación/actualización de cada nota — nunca de "ahora", por el
  // mismo motivo documentado arriba para las rutas estáticas.
  // Portadas cambiadas desde /admin/blog (settings del catálogo cacheado). Si
  // la base no responde quedan las del repo: el blog del sitemap sigue sin
  // depender de Supabase.
  let blogSettings: Record<string, string> = {}
  try {
    blogSettings = (await getCatalog()).settings
  } catch {
    // Sin la base: portadas originales.
  }
  const blogRoutes: MetadataRoute.Sitemap = getAllArticles().map((raw) => withHeroOverride(raw, blogSettings)).map((a) => ({
    url: `${SITE_URL}/blog/${a.slug}`,
    lastModified: new Date(a.updatedAt ?? a.publishedAt),
    changeFrequency: 'monthly' as const,
    priority: a.role === 'pillar' ? 0.7 : 0.6,
    // La imagen de portada, igual que en los productos: sin esto las notas
    // quedaban fuera de Google Imágenes, que para contenido de moda/tejido es
    // una vía de descubrimiento real. Vía /_next/image por el mismo motivo que
    // los productos (que el crawler no baje el original pesado).
    // Más las fotos que van dentro de la nota (bloques `image`).
    ...(() => {
      const srcs = [a.hero?.src, ...a.body.flatMap((b) => (b.type === 'image' ? [b.src] : []))]
        .filter((s): s is string => Boolean(s))
      const images = [...new Set(srcs)].slice(0, MAX_IMAGES_PER_URL).map((s) => xmlEscape(botImageUrl(SITE_URL, s)))
      return images.length ? { images } : {}
    })(),
  }))

  try {
    const supabase = await createClient()

    const [productsRes, categoriesRes, collectionsRes, discountsRes] = await Promise.all([
      supabase
        .from('products')
        .select('slug, updated_at, status, discount_active, discount_percent, media:product_media(url, is_primary, type)')
        .in('status', ['active', 'soldout'])
        .order('sort_order', { ascending: true }),
      supabase
        .from('categories')
        .select('slug')
        .order('sort_order', { ascending: true }),
      // select('*') a propósito: filtrar `unlisted` acá exigiría que la columna
      // exista (drops-2026-07.sql); traer todo y filtrar en JS tolera una DB
      // sin migrar (undefined = false).
      supabase
        .from('collections')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true }),
      supabase.from('discounts').select('id').eq('active', true).limit(1),
    ])

    const productsData = (productsRes.data ?? []) as Array<{
      slug: string
      updated_at: string | null
      status: string
      discount_active?: boolean
      discount_percent?: number
      media?: { url: string; is_primary: boolean; type: string }[]
    }>

    // Category pages — /tienda/[cat] — high priority, these are the main
    // landing pages Google indexes for queries like "cardigans crochet uruguay".
    // Bug real que estuvo vaciando esto en cada build: la query pedía
    // `updated_at`, columna que `categories` nunca tuvo (ver database/schema.sql)
    // — Postgrest devolvía error, `categoriesRes.data` quedaba `null`, y como
    // nada chequeaba `categoriesRes.error`, el sitemap se armaba igual pero sin
    // categorías, en silencio. Sin `updated_at` en la tabla no hay lastmod real
    // que declarar acá (mismo criterio que las rutas estáticas arriba).
    const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data ?? []).map((c) => ({
      url: xmlEscape(`${SITE_URL}/tienda/${c.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))

    // Product pages — include primary image for Google image search.
    const productRoutes: MetadataRoute.Sitemap = productsData.map((p) => {
      const images = productImages(p.media)

      return {
        url: xmlEscape(`${SITE_URL}/tienda/${p.slug}`),
        ...(p.updated_at ? { lastModified: new Date(p.updated_at) } : {}),
        changeFrequency: 'weekly' as const,
        priority: p.status === 'active' ? 0.8 : 0.7,
        // Vía /_next/image: el image-sitemap mandaba a Googlebot-Image al
        // original de varios MB en supabase.co (egress). Ahora baja ~100 KB
        // desde dahila.uy, cacheado por Netlify.
        ...(images.length ? { images } : {}),
      }
    })

    // Collection / lookbook pages. Las "solo con link" (unlisted, acceso
    // anticipado VIP) no se publicitan a Google.
    const collectionsData = (collectionsRes.data ?? []) as Array<{
      slug: string
      updated_at: string | null
      unlisted?: boolean
    }>
    const collectionRoutes: MetadataRoute.Sitemap = collectionsData
      .filter((c) => !c.unlisted)
      .map((c) => ({
        url: xmlEscape(`${SITE_URL}/colecciones/${c.slug}`),
        ...(c.updated_at ? { lastModified: new Date(c.updated_at) } : {}),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      }))

    // Hub pages that would otherwise be empty/thin — only advertise them to
    // Google when there is real content behind them.
    const hasOffers =
      (discountsRes.data ?? []).length > 0 ||
      productsData.some((p) => p.discount_active && (p.discount_percent ?? 0) > 0)
    const hasCollections = collectionRoutes.length > 0

    const conditionalHubs: MetadataRoute.Sitemap = [
      ...(hasOffers
        ? [{ url: `${SITE_URL}/ofertas`, changeFrequency: 'daily' as const, priority: 0.75 }]
        : []),
      ...(hasCollections
        ? [{ url: `${SITE_URL}/colecciones`, changeFrequency: 'weekly' as const, priority: 0.7 }]
        : []),
    ]

    return [...staticRoutes, ...blogRoutes, ...conditionalHubs, ...categoryRoutes, ...productRoutes, ...collectionRoutes]
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (!message.includes('Dynamic server usage')) {
      console.error('sitemap fetch failed', e)
    }
    // Con la DB caída esto antes devolvía el sitio "adelgazado" (sin un solo
    // producto ni categoría) durante hasta 1h de caché — justo el tipo de
    // incidente que ya pasó (cuota de Supabase agotada, jul-2026). El resto
    // del sitio ya cae al snapshot estático en ese escenario; el sitemap no lo
    // hacía (auditoría 03/09/2026). No incluye colecciones: el snapshot no las
    // guarda, igual que antes de este fix.
    const snap = getSnapshotData()
    const categoryRoutes: MetadataRoute.Sitemap = snap.categories.map((c) => ({
      url: xmlEscape(`${SITE_URL}/tienda/${c.slug}`),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))
    const productRoutes: MetadataRoute.Sitemap = snap.products.map((p) => {
      const images = productImages(p.media ?? [])
      return {
        url: xmlEscape(`${SITE_URL}/tienda/${p.slug}`),
        ...(p.updated_at ? { lastModified: new Date(p.updated_at) } : {}),
        changeFrequency: 'weekly' as const,
        priority: p.status === 'active' ? 0.8 : 0.7,
        ...(images.length ? { images } : {}),
      }
    })
    return [...staticRoutes, ...blogRoutes, ...categoryRoutes, ...productRoutes]
  }
}
