import { NextRequest, NextResponse } from 'next/server'
import { getCatalog } from '@/lib/catalog'
import { getPrimaryPhoto, getListingPrice, getEffectivePrice, getListingSize, hasPriceRange, isReadyToShip, normalizeText as normalize } from '@/lib/types'
import type { Product } from '@/lib/types'
import { productSearchScore } from '@/lib/vocabulario'
import { esBusquedaDeStock } from '@/lib/search-intent'

export const revalidate = 0

// Strip diacritics + lowercase so "cardigan" matches "Cardigán" and vice versa.
// La implementación vive en lib/types (normalizeText) porque /tienda tiene que
// filtrar con EXACTAMENTE el mismo criterio: si acá normalizamos y allá no, la
// sugerencia lleva a una grilla vacía.

/**
 * Lightweight product search for the header's live suggestions. Returns a small,
 * shaped payload (no full product rows) so the dropdown stays fast.
 *
 * The catalogue is small and curated, so we fetch the active/soldout set and
 * match in JS with full accent/case normalisation. This avoids the `unaccent`
 * Postgres extension (no migration needed) and sidesteps interpolating raw user
 * input into a PostgREST filter string.
 *
 * EGRESS: los productos salen del catálogo cacheado (lib/catalog.ts), no de una
 * consulta propia. Antes esta ruta bajaba hasta 200 filas con sus joins DESDE
 * SUPABASE en cada pulsación de tecla (el header dispara una búsqueda cada
 * 220ms mientras se escribe) — una sola clienta tipeando "cardigan celeste"
 * podía generar media docena de descargas del catálogo casi entero. Ahora el
 * costo por tecla es CPU en memoria y cero transferencia de la base.
 */
export async function GET(req: NextRequest) {
  // Tope de largo (auditoría 19/09/2026): la búsqueda recorre el catálogo en
  // memoria comparando contra cada descripción, y un texto de miles de
  // caracteres no busca nada útil. 64 alcanza para cualquier búsqueda real.
  const raw = (req.nextUrl.searchParams.get('q') || '').trim().slice(0, 64)
  if (raw.length < 2) return NextResponse.json({ results: [] })
  const q = normalize(raw)

  try {
    const { products, discounts } = await getCatalog()

    let found: Product[]
    if (esBusquedaDeStock(q)) {
      // "en stock", "ya tejido", "disponible"… (CRO-20): lo que ya está tejido,
      // en el orden de la tienda, y no las prendas que nombran esas palabras en
      // la descripción (traía piezas que se tejen al encargar). Una prenda que
      // las tenga en el nombre igual aparece, primera.
      const porNombre = products.filter((p) => normalize(p.name).includes(q)).slice(0, 6)
      const enStock = products.filter((p) => isReadyToShip(p) && !porNombre.includes(p)).slice(0, 6)
      found = [...porNombre, ...enStock]
    } else {
      // Rank: name match beats description/category match; earlier beats later.
      // Mismo criterio que la grilla de /tienda (lib/vocabulario.ts), con los
      // sinónimos rioplatenses: "buzo" encuentra los sweaters, "saco" los
      // cardigans, "musculosa" los tops.
      found = products
        .map((p) => {
          const prod = p as unknown as Product
          return { prod, score: productSearchScore(prod, q) }
        })
        .filter((x) => x.score >= 0)
        .sort((a, b) => a.score - b.score)
        .slice(0, 6)
        .map(({ prod }) => prod)
    }

    const results = found.map((prod) => ({
      slug: prod.slug,
      name: prod.name,
      photo: getPrimaryPhoto(prod),
      // Mismo precio que la tarjeta (talle disponible más barato, con los
      // descuentos por lote, que antes se ignoraban acá).
      price: getListingPrice(prod, discounts),
      // Precio de lista del mismo talle: con descuento, la sugerencia lo
      // muestra tachado, como la tarjeta (VIS-15).
      list: getEffectivePrice(prod, getListingSize(prod)),
      from: hasPriceRange(prod),
      soldout: prod.status === 'soldout',
    }))

    return NextResponse.json({ results })
  } catch (e) {
    console.error('GET /api/search', e)
    return NextResponse.json({ results: [] }, { status: 200 })
  }
}
