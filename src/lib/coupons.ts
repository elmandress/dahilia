// Lógica compartida de cupones (cliente + servidor).
// La regla llega de la RPC get_coupon_public; acá se calcula el descuento
// sobre los precios FINALES del carrito (después de descuentos de producto),
// para que el número que ve la clienta siempre salga de getFinalPrice(...).

import { getFinalPrice, type CartItem, type Discount, type Product } from './types'

export type CouponKind = 'percent' | 'fixed' | 'free_shipping'

/** Campos públicos de un cupón, tal como los devuelve la RPC. */
export interface PublicCoupon {
  code: string
  label: string | null
  kind: CouponKind
  value: number | null
  min_subtotal_uyu: number | null
  product_ids: string[]
  category_ids: string[]
}

/** ¿El cupón alcanza a este producto? (arrays vacíos = todo el catálogo) */
export function couponCoversProduct(coupon: PublicCoupon, product: Product): boolean {
  const byProduct = coupon.product_ids.length > 0
  const byCategory = coupon.category_ids.length > 0
  if (!byProduct && !byCategory) return true
  if (byProduct && coupon.product_ids.includes(product.id)) return true
  if (byCategory && product.category_id && coupon.category_ids.includes(product.category_id)) return true
  return false
}

export interface CouponEffect {
  /** Monto a restar del total (0 para envío gratis). */
  discount: number
  freeShipping: boolean
  /** Subtotal de los ítems alcanzados por el cupón. */
  eligibleSubtotal: number
  /** Subtotal de todo el carrito (para el mínimo de compra). */
  cartSubtotal: number
  /** null = aplica; si no, el motivo para mostrarle a la clienta. */
  blocked: string | null
}

export function computeCouponEffect(
  coupon: PublicCoupon,
  items: Array<Pick<CartItem, 'size' | 'qty'> & { product?: Product }>,
  discounts: Discount[]
): CouponEffect {
  let cartSubtotal = 0
  let eligibleSubtotal = 0
  for (const item of items) {
    if (!item.product) continue
    const line = getFinalPrice(item.product, item.size, discounts) * item.qty
    cartSubtotal += line
    if (couponCoversProduct(coupon, item.product)) eligibleSubtotal += line
  }

  if (coupon.min_subtotal_uyu != null && cartSubtotal < coupon.min_subtotal_uyu) {
    return {
      discount: 0, freeShipping: false, eligibleSubtotal, cartSubtotal,
      blocked: `Este cupón pide una compra mínima de UYU ${coupon.min_subtotal_uyu.toLocaleString('es-UY')}.`,
    }
  }
  if (eligibleSubtotal <= 0) {
    return {
      discount: 0, freeShipping: false, eligibleSubtotal, cartSubtotal,
      blocked: 'Este cupón no aplica a los productos de tu carrito.',
    }
  }

  if (coupon.kind === 'free_shipping') {
    return { discount: 0, freeShipping: true, eligibleSubtotal, cartSubtotal, blocked: null }
  }
  if (coupon.kind === 'percent') {
    const pct = Math.min(90, Math.max(0, coupon.value ?? 0))
    return {
      discount: Math.round((eligibleSubtotal * pct) / 100),
      freeShipping: false, eligibleSubtotal, cartSubtotal, blocked: null,
    }
  }
  // fixed: nunca más que el subtotal alcanzado
  return {
    discount: Math.min(coupon.value ?? 0, eligibleSubtotal),
    freeShipping: false, eligibleSubtotal, cartSubtotal, blocked: null,
  }
}

/** Mensajes amables para los motivos de rechazo de la RPC. */
export const COUPON_REASON_TEXT: Record<string, string> = {
  not_found: 'No encontramos ese cupón. Fijate que esté bien escrito.',
  inactive: 'Ese cupón ya no está activo.',
  not_started: 'Ese cupón todavía no está vigente.',
  expired: 'Ese cupón ya venció.',
  maxed: 'Ese cupón ya alcanzó su tope de usos.',
  customer_maxed: 'Ya usaste este cupón.',
}
