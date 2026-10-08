import type { Product } from './types'
import { normalizeText } from './types'

// ─────────────────────────────────────────────────────────────
// Vocabulario rioplatense (08/10/2026).
//
// En Uruguay a un sweater se le dice "buzo", a un cardigan "saco" y a un top
// sin mangas "musculosa". El catálogo usaba solo las palabras en inglés, y
// eso tenía dos costos medidos:
//   - el buscador del sitio devolvía 0 resultados para "buzo", "saco" y
//     "musculosa" (y "sweater" encontraba 2 de una categoría entera), porque
//     solo miraba nombre y descripción;
//   - en Google, "sweater"/"cardigan" a secas compiten contra fast fashion
//     global (Search Console: posición 20 a 48), mientras que "saco tejido" o
//     "buzo tejido a mano" casi no tienen tiendas uruguayas compitiendo.
// Un solo lugar para las equivalencias: buscador, títulos y feed de Shopping.
// ─────────────────────────────────────────────────────────────

/** Cómo se le dice en Uruguay a lo que hay en cada categoría (por slug). */
export const CATEGORY_LOCAL_TERM: Record<string, string> = {
  cardigans: 'saco',
  sweaters: 'buzo',
}

/** Palabras que alguien puede escribir → la palabra que usa el catálogo. */
const QUERY_SYNONYMS: Record<string, string[]> = {
  buzo: ['sweater'], buzos: ['sweater'], pullover: ['sweater'], sueter: ['sweater'], jersey: ['sweater'],
  saco: ['cardigan'], sacos: ['cardigan'], saquito: ['cardigan'],
  musculosa: ['top'], musculosas: ['top'], blusa: ['top'], remera: ['top'],
  cartera: ['bolso'], carteras: ['bolso'], mochila: ['bolso'], bolsa: ['bolso'],
  conjunto: ['set'], conjuntos: ['set'],
  panuelo: ['bandana'], panuelos: ['bandana'],
}

/** Texto en el que se busca: nombre, descripción, categoría y colores. */
function haystack(p: Product): { name: string; rest: string } {
  const colors = (p.colors ?? []).map((c) => c?.name ?? '').join(' ')
  const local = p.category?.slug ? CATEGORY_LOCAL_TERM[p.category.slug] ?? '' : ''
  return {
    name: normalizeText(p.name ?? ''),
    rest: normalizeText(`${p.description ?? ''} ${p.category?.name ?? ''} ${local} ${colors}`),
  }
}

/**
 * Puntaje de búsqueda: -1 = no coincide; más bajo = mejor. Cada palabra de la
 * búsqueda tiene que aparecer (o un sinónimo suyo): "saco celeste" encuentra
 * los cardigans celestes. Coincidir en el nombre pesa más que en el resto.
 */
export function productSearchScore(p: Product, query: string): number {
  const words = normalizeText(query).split(/\s+/).filter((w) => w.length > 0)
  if (words.length === 0) return 0
  const { name, rest } = haystack(p)
  let score = 0
  for (const w of words) {
    const options = [w, ...(QUERY_SYNONYMS[w] ?? [])]
    const nameIdx = Math.min(...options.map((o) => { const i = name.indexOf(o); return i < 0 ? Infinity : i }))
    if (nameIdx !== Infinity) { score += nameIdx === 0 ? 0 : 1 + nameIdx / 100; continue }
    const restIdx = Math.min(...options.map((o) => { const i = rest.indexOf(o); return i < 0 ? Infinity : i }))
    if (restIdx === Infinity) return -1
    score += 100 + restIdx / 1000
  }
  return score
}

/** "Spring cardigan" → "saco": la palabra local, si la prenda no la tiene ya en el nombre. */
export function localTermFor(p: Pick<Product, 'name' | 'category'>): string | null {
  const term = p.category?.slug ? CATEGORY_LOCAL_TERM[p.category.slug] : undefined
  if (!term) return null
  return normalizeText(p.name ?? '').includes(term) ? null : term
}
