// ¿La búsqueda pide "lo que ya está tejido"? (CRO-20, 04/11/2026). Buscar "en
// stock" devolvía cero resultados aunque el menú dice "En stock, sin espera
// (7)", y "ya tejido" —el texto del link de /ig— traía 6 prendas de las que 4
// se tejen al encargar: el buscador compara palabras contra nombres y
// descripciones y no sabe qué está en stock. Quien escribe eso quiere comprar
// ya. Solo la frase entera cuenta: "cardigan disponible" sigue siendo una
// búsqueda de cardigans.
//
// Puro: lo usan /api/search y el buscador del header, y lo prueban las
// unitarias (tests/unit/busqueda-stock.test.mjs).
import { normalizeText } from '@/lib/types'

const FRASES_DE_STOCK = new Set([
  'stock', 'en stock',
  'disponible', 'disponibles',
  'ya tejido', 'ya tejida', 'ya tejidos', 'ya tejidas',
  'sin espera',
  'entrega inmediata',
  'para ya',
])

/** true si lo buscado (normalizado o no) es una de las frases de "lo que está en stock". */
export function esBusquedaDeStock(q: string): boolean {
  // Sin signos ("¿en stock?") y con un solo espacio entre palabras.
  const limpia = normalizeText(q).replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
  return FRASES_DE_STOCK.has(limpia)
}
