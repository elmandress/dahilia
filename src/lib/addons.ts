import type { CartItem, Product, Discount } from './types'
import { getFinalPrice } from './types'

// "Sumale un detalle": cross-sell silencioso de piezas chicas (Baymard: los
// add-ons del carrito deben ser complementos baratos, nunca otra prenda que
// compita con la que ya está). Prioriza categorías que NO están en el carrito.
// Compartido entre /carrito (CarritoClient) y el mini-cart (CartDrawer) para
// que sugieran exactamente lo mismo con el mismo criterio.
const ADDON_MAX_UYU = 800

export function pickAddonSuggestions(
  candidates: Product[],
  cartItems: Pick<CartItem, 'product_id' | 'product'>[],
  discounts: Discount[],
  max = 3
): Product[] {
  const cartProductIds = new Set(cartItems.map((i) => i.product_id))
  const cartCategoryIds = new Set(cartItems.map((i) => i.product?.category_id).filter(Boolean))
  return candidates
    .filter((p) =>
      !cartProductIds.has(p.id) &&
      !p.is_custom_only &&
      (p.base_price_uyu ?? 0) > 0 &&
      getFinalPrice(p, undefined, discounts) <= ADDON_MAX_UYU
    )
    .sort((a, b) =>
      Number(cartCategoryIds.has(a.category_id ?? '')) - Number(cartCategoryIds.has(b.category_id ?? '')) ||
      getFinalPrice(a, undefined, discounts) - getFinalPrice(b, undefined, discounts)
    )
    .slice(0, max)
}
