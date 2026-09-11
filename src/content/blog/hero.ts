import type { Article } from './types'

// Portadas editables desde el admin (/admin/blog). El texto de las notas vive
// en el repo, pero la foto de portada se puede cambiar sin deploy: se guarda
// en site_settings —la tabla de los textos del sitio, que ya viaja en el
// catálogo cacheado, así que no suma ninguna consulta— con estas dos claves.
export const blogHeroKey = (slug: string) => `blog_hero:${slug}`
export const blogHeroAltKey = (slug: string) => `blog_hero_alt:${slug}`

// Solo fotos del storage público de Supabase: es lo único que sube el admin y
// lo único habilitado en images.remotePatterns (next.config.ts). Una URL de
// otro host haría fallar a next/image y, con él, el render de la nota entera.
const STORAGE_URL = /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\//i

/** La nota con la portada que se eligió en el admin, si se eligió una. */
export function withHeroOverride(article: Article, settings: Record<string, string>): Article {
  const src = settings[blogHeroKey(article.slug)]?.trim()
  const alt = settings[blogHeroAltKey(article.slug)]?.trim()
  if (src && STORAGE_URL.test(src)) {
    return { ...article, hero: { src, alt: alt || article.hero?.alt || article.title } }
  }
  if (alt && article.hero) return { ...article, hero: { ...article.hero, alt } }
  return article
}
