// La identidad de una prenda fuera del sitio: el id del feed (merchant-feed.xml),
// el link de cada variante y si la prenda va como grupo de variantes. Una sola
// regla para el feed, el JSON-LD de la ficha, el píxel de Meta y el Purchase
// (TRK-01, 04/11/2026). Antes había dos: el feed armaba "<slug>-<talle>" para
// cualquier fila y Meta comparaba contra el literal 'Único', así que el
// AddToCart del Sweater net ('sweater-net') no existía en el feed
// ('sweater-net-Único'), y las vistas de las 15 prendas sin talles salían como
// grupo de un grupo que el feed no tiene. Hoy no hay catálogo en Meta: el
// momento de alinearlos es antes de crearlo.
//
// Puro (sin servidor ni navegador): lo usan el feed, la ficha, meta-pixel y
// las pruebas unitarias.
import { isUnicoLabel } from './types'

/** El id en el feed: el slug si no hay talle (o es "Único"); si no, slug-talle.
 *  Los ids con espacios o tildes ("pulseras-terra-Con caracolas") valen tal
 *  cual para Google y para Meta: no se renombran. */
export function feedItemId(slug: string, size?: string | null): string {
  return size && !isUnicoLabel(size) ? `${slug}-${size}` : slug
}

/** El link que abre la ficha con esa variante ya elegida (?talle=, lo lee
 *  lib/product-selection.ts). Sin talle, o con "Único", la ficha a secas. */
export function variantUrl(site: string, slug: string, size?: string | null): string {
  const base = `${site}/tienda/${slug}`
  return size && !isUnicoLabel(size) ? `${base}?talle=${encodeURIComponent(size)}` : base
}

/**
 * ¿La prenda va como grupo de variantes (item_group_id en el feed,
 * ProductGroup en el JSON-LD, product_group en la vista de Meta)? Sí cuando
 * tiene alguna fila de talle o de modelo que no sea "Único", aunque esté
 * agotada: un top S/M/L sin stock sigue siendo un grupo, con sus mismos ids.
 * Con una sola fila real (solo "M") también: el carrito la agrega como "M" y
 * su id es slug-M, así que la vista tiene que apuntar al grupo y no a un
 * ítem "slug" que el feed no publica.
 */
export function tieneVariantes(p: { sizes?: { size: string }[] | null }): boolean {
  return (p.sizes ?? []).some((s) => !isUnicoLabel(s.size))
}
