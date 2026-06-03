import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,         lastModified: now, changeFrequency: 'weekly',  priority: 1   },
    { url: `${SITE_URL}/tienda`,   lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/encargo`,  lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/atelier`,  lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ]

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('products')
      .select('slug, updated_at, status, media:product_media(url, is_primary, type)')
      .in('status', ['active', 'soldout'])

    const productRoutes: MetadataRoute.Sitemap = (data ?? []).map((p) => {
      const media = (p.media ?? []) as { url: string; is_primary: boolean; type: string }[]
      const primary = media.find((m) => m.is_primary && m.type === 'image') || media.find((m) => m.type === 'image')
      const photo = primary?.url

      return {
        url: `${SITE_URL}/tienda/${p.slug}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
        ...(photo ? { images: [photo] } : {}),
      }
    })

    return [...staticRoutes, ...productRoutes]
  } catch (e) {
    console.error('sitemap supabase fetch failed', e)
    return staticRoutes
  }
}
