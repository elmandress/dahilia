import type { CartItem, Product, Discount } from './types'
import { getListingPrice, getListingSize, hasPriceRange, isReadyToShip } from './types'

// "Sumale un detalle": cross-sell silencioso de piezas chicas (Baymard: los
// add-ons del carrito deben ser complementos baratos, nunca otra prenda que
// compita con la que ya está). Prioriza categorías que NO están en el carrito.
// Compartido entre /carrito (CarritoClient) y el mini-cart (CartDrawer) para
// que sugieran exactamente lo mismo con el mismo criterio. Desde 04/11/2026
// los dos toman además el MISMO pool (addonCandidates del layout, vía el
// CartProvider): antes /carrito usaba las primeras 24 activas y salían otras.
export const ADDON_MAX_UYU = 800

export function pickAddonSuggestions(
  candidates: Product[],
  cartItems: Pick<CartItem, 'product_id' | 'product'>[],
  discounts: Discount[],
  opts: {
    max?: number
    /** Solo piezas ya tejidas. Lo prende quien llama cuando todo lo pedible
     *  está en stock (CRO-11): sugerir un encargo de 2–3 semanas convertía un
     *  pedido que sale ya en uno que espera (o en dos envíos). */
    soloEnStock?: boolean
  } = {}
): Product[] {
  const { max = 3, soloEnStock = false } = opts
  const cartProductIds = new Set(cartItems.map((i) => i.product_id))
  const cartCategoryIds = new Set(cartItems.map((i) => i.product?.category_id).filter(Boolean))
  return candidates
    .filter((p) =>
      !cartProductIds.has(p.id) &&
      !p.is_custom_only &&
      (p.base_price_uyu ?? 0) > 0 &&
      // Con filas de talle y ninguna disponible no hay nada que sumar: el
      // "+ Agregar" caería en un talle sin stock (QA-07).
      ((p.sizes ?? []).length === 0 || (p.sizes ?? []).some((s) => s.available !== false)) &&
      (!soloEnStock || isReadyToShip(p)) &&
      getListingPrice(p, discounts) <= ADDON_MAX_UYU
    )
    .sort((a, b) =>
      Number(cartCategoryIds.has(a.category_id ?? '')) - Number(cartCategoryIds.has(b.category_id ?? '')) ||
      getListingPrice(a, discounts) - getListingPrice(b, discounts)
    )
    .slice(0, max)
}

export type AddonAction =
  | { kind: 'one-tap'; size: string }
  | { kind: 'choose'; desde: number; from: boolean }

/**
 * Qué ofrece cada sugerencia (QA-06, CRO-22). Un toque solo si no hay nada que
 * elegir: 0 o 1 variante disponible. Con más (Pulseras Terra: Lisas, Con lurex,
 * Con caracolas), un link a la ficha: sin devoluciones, una variante que nadie
 * eligió es un pedido equivocado. Es la misma regla que "Completá el look".
 */
export function addonAction(p: Product, discounts: Discount[] = []): AddonAction {
  const disponibles = (p.sizes ?? []).filter((s) => s.available !== false)
  if (disponibles.length <= 1) return { kind: 'one-tap', size: getListingSize(p) ?? 'Único' }
  return { kind: 'choose', desde: getListingPrice(p, discounts), from: hasPriceRange(p) }
}
