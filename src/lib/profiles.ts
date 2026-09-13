// Perfiles oficiales de la marca fuera del sitio (12/09/2026). Se cargan en
// Configuración → Contacto y se declaran en el JSON-LD (sameAs / hasMap):
// es lo que les dice a Google y a las IAs que "Dahila Crochet" en Instagram,
// Maps o YouTube es la misma marca que dahila.uy. Clave con un nombre que los
// buscadores corrigen a "dahlia".

export const DEFAULT_INSTAGRAM_URL = 'https://www.instagram.com/dahila.crochet/'

const OTHER_PROFILE_KEYS = ['google_business_url', 'youtube_url', 'tiktok_url', 'facebook_url', 'pinterest_url'] as const

function httpsUrl(value: string | undefined): string | undefined {
  const v = value?.trim()
  return v && /^https:\/\/\S+$/.test(v) ? v : undefined
}

/** URLs públicas de los perfiles de la marca, sin repetidos. */
export function brandProfileUrls(settings: Record<string, string>): string[] {
  const urls = [
    httpsUrl(settings.contact_instagram_url) ?? DEFAULT_INSTAGRAM_URL,
    ...OTHER_PROFILE_KEYS.map((k) => httpsUrl(settings[k])),
  ].filter((u): u is string => Boolean(u))
  return [...new Set(urls)]
}

/** Link del Perfil de Negocio en Google Maps, si está cargado. */
export function googleBusinessUrl(settings: Record<string, string>): string | undefined {
  return httpsUrl(settings.google_business_url)
}

/** Link para dejar una reseña en Google (lo usa /resena), si está cargado. */
export function googleReviewUrl(settings: Record<string, string>): string | undefined {
  return httpsUrl(settings.google_review_url)
}
