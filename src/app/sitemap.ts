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
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,          lastModified: now, changeFrequency: 'weekly',  priority: 1    },
    { url: `${SITE_URL}/tienda`,    lastModified: now, changeFrequency: 'daily',   priority: 0.9  },
    { url: `${SITE_URL}/encargo`,   lastModified: now, changeFrequency: 'monthly', priority: 0.6  },
    { url: `${SITE_URL}/atelier`,   lastModified: now, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/info`,      lastModified: now, changeFrequency: 'monthly', priority: 0.5  },
    { url: `${SITE_URL}/contacto`,  lastModified: now, changeFrequency: 'monthly', priority: 0.6  },
    { url: `${SITE_URL}/terminos`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3  },
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
      supabase
        .from('collections')
        .select('slug, updated_at')
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
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
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
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly' as const,
        priority: p.status === 'active' ? 0.8 : 0.7,
        ...(photo ? { images: [photo] } : {}),
      }
    })

    // Collection / lookbook pages
    const collectionRoutes: MetadataRoute.Sitemap = (collectionsRes.data ?? []).map((c) => ({
      url: `${SITE_URL}/colecciones/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))

    // Hub pages that would otherwise be empty/thin — only advertise them to
    // Google when there is real content behind them.
    const hasOffers =
      (discountsRes.data ?? []).length > 0 ||
      productsData.some((p) => p.discount_active && (p.discount_percent ?? 0) > 0)
    const hasCollections = (collectionsRes.data ?? []).length > 0

    const conditionalHubs: MetadataRoute.Sitemap = [
      ...(hasOffers
        ? [{ url: `${SITE_URL}/ofertas`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.75 }]
        : []),
      ...(hasCollections
        ? [{ url: `${SITE_URL}/colecciones`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 }]
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
