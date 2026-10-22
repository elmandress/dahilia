// Reels de Instagram en el sitio (21/10/2026).
//
// Por qué así:
// - La lista vive en site_settings (clave `reels`, un JSON) y no en una tabla
//   nueva: no hace falta correr SQL, y la tienda ya la recibe con el catálogo
//   cacheado (lib/catalog.ts), sin una consulta más por visita.
// - Nada de subir videos: un video pesa 100 veces lo que una foto y el egress
//   de Supabase ya se agotó una vez (incidente del 20/09). La tarjeta usa la
//   foto de la prenda, que ya está en caché, y el video lo sirve Instagram.
// - El reproductor de Instagram (un iframe) se carga recién cuando tocan
//   play: hasta ahí no hay scripts, cookies ni peso de terceros.

import { getListingPrice, getPrimaryPhoto, type Product } from './types'

export interface Reel {
  /** Link del reel tal como lo copia Anush desde Instagram. */
  url: string
  /** Slug de la prenda que aparece en el reel. */
  product: string
  /** Frase corta opcional que acompaña la tarjeta. */
  caption?: string
}

export const REELS_SETTING_KEY = 'reels'
export const REELS_MAX = 8

const IG_RE = /^https?:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(reels?|p|tv)\/([A-Za-z0-9_-]{5,})/i

/** Dirección del reproductor embebible de Instagram, o null si el link no es
 *  de un reel/publicación. Acepta /reel/, /reels/, /p/ y /tv/, con o sin
 *  ?igsh= y con o sin el usuario adelante. */
export function reelEmbedUrl(url: string): string | null {
  const m = url.trim().match(IG_RE)
  if (!m) return null
  const kind = m[1].toLowerCase() === 'p' ? 'p' : 'reel'
  return `https://www.instagram.com/${kind}/${m[2]}/embed/`
}

/** Lee la lista guardada. Tolera vacío, JSON roto o filas incompletas: la
 *  home nunca se cae por un dato mal cargado, solo saltea esa fila. */
export function parseReels(raw: string | null | undefined): Reel[] {
  if (!raw?.trim()) return []
  let data: unknown
  try { data = JSON.parse(raw) } catch { return [] }
  if (!Array.isArray(data)) return []
  const out: Reel[] = []
  for (const r of data) {
    if (!r || typeof r !== 'object') continue
    const { url, product, caption } = r as Record<string, unknown>
    if (typeof url !== 'string' || typeof product !== 'string' || !reelEmbedUrl(url) || !product.trim()) continue
    out.push({
      url: url.trim(),
      product: product.trim(),
      ...(typeof caption === 'string' && caption.trim() ? { caption: caption.trim().slice(0, 90) } : {}),
    })
  }
  return out.slice(0, REELS_MAX)
}

/** Lo que la tarjeta y el reproductor necesitan de la prenda. */
export interface ReelCard {
  embedUrl: string
  url: string
  caption?: string
  product: { slug: string; name: string; photo: string | null; price: number }
}

/** Arma las tarjetas: cada reel con su prenda activa (foto, nombre, precio de
 *  listado). Un reel de una prenda que ya no está activa no se muestra. */
export function resolveReels(
  raw: string | null | undefined,
  products: Product[],
): ReelCard[] {
  const bySlug = new Map(products.filter((p) => p.status === 'active').map((p) => [p.slug, p]))
  const out: ReelCard[] = []
  for (const r of parseReels(raw)) {
    const p = bySlug.get(r.product)
    const embedUrl = reelEmbedUrl(r.url)
    if (!p || !embedUrl) continue
    const photo = getPrimaryPhoto(p)
    out.push({
      embedUrl,
      url: r.url,
      ...(r.caption ? { caption: r.caption } : {}),
      product: { slug: p.slug, name: p.name, photo: photo && !photo.startsWith('/placeholder') ? photo : null, price: getListingPrice(p) },
    })
  }
  return out
}
