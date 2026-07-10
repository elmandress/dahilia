import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

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
    { url: `${SITE_URL}/encargo`,   changeFrequency: 'monthly', priority: 0.6  },
    { url: `${SITE_URL}/atelier`,   changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/info`,      changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/contacto`,  changeFrequency: 'monthly', priority: 0.6  },
    { url: `${SITE_URL}/tejedoras`, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/terminos`,  changeFrequency: 'yearly',  priority: 0.3  },
  ]

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
        .select('slug, updated_at')
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
    const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes.data ?? []).map((c) => ({
      url: `${SITE_URL}/tienda/${c.slug}`,
      // lastmod solo cuando hay fecha real (mismo criterio que arriba).
      ...(c.updated_at ? { lastModified: new Date(c.updated_at) } : {}),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))

    // Product pages — include primary image for Google image search.
    const productRoutes: MetadataRoute.Sitemap = productsData.map((p) => {
      const media = p.media ?? []
      const primary =
        media.find((m) => m.is_primary && m.type === 'image') ||
        media.find((m) => m.type === 'image')
      const photo = primary?.url

      return {
        url: `${SITE_URL}/tienda/${p.slug}`,
        ...(p.updated_at ? { lastModified: new Date(p.updated_at) } : {}),
        changeFrequency: 'weekly' as const,
        priority: p.status === 'active' ? 0.8 : 0.7,
        ...(photo ? { images: [photo] } : {}),
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
        url: `${SITE_URL}/colecciones/${c.slug}`,
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

    return [...staticRoutes, ...conditionalHubs, ...categoryRoutes, ...productRoutes, ...collectionRoutes]
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    if (!message.includes('Dynamic server usage')) {
      console.error('sitemap fetch failed', e)
    }
    return staticRoutes
  }
}
