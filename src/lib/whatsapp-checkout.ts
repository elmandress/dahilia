// El pedido por WhatsApp, en piezas puras que comparten /carrito y el cajón
// (CRO-01, 04/11/2026): el mismo mensaje, la misma firma del carrito y los
// mismos ítems para /api/orders, salga de donde salga. Lo que toca el
// navegador (abrir WhatsApp, la traba, el registro) vive en
// components/checkout/useWhatsAppCheckout.ts.
//
// Puro a propósito (sin JSX ni next/*): lo prueban las unitarias con node:test.
import type { CartItem, Discount, Product } from './types'
import { formatPrice, getEffectivePrice, getFinalPrice, isReadyToShip, isUnicoLabel } from './types'
import { cartItemIssue } from './cart-summary'

type BuyableItem = Pick<CartItem, 'size' | 'qty'> & { product: Product }

export interface WhatsAppMessageOptions {
  /** Dominio canónico (SITE_URL): los links de cada prenda y el de /pedido. */
  siteUrl: string
  giftNote?: string
  coupon?: { code: string; discount: number; freeShipping: boolean } | null
  /** Umbral de envío gratis alcanzado (monto en UYU); null si no aplica. */
  freeShippingOver?: number | null
  /** Código de seguimiento (PED-XXXXXX): la clienta lo usa en /pedido. */
  trackingCode?: string
}

/**
 * El mensaje de WhatsApp con el pedido. Movido tal cual desde CarritoClient
 * (el texto no cambia: lo cuida el snapshot de tests/unit). Solo entran las
 * piezas que se pueden pedir, y con ellas se decide si se pregunta el plazo:
 * una agotada que quedó en el carrito no puede sumar la pregunta.
 */
export function buildWhatsAppMessage(
  items: BuyableItem[],
  discounts: Discount[],
  total: number,
  { siteUrl, giftNote, coupon, freeShippingOver, trackingCode }: WhatsAppMessageOptions
): string {
  const pedibles = items.filter((i) => !!i.product && cartItemIssue(i) === null)
  const lines: string[] = []
  lines.push('Hola Anush! Quiero coordinar este pedido:')
  lines.push('')

  pedibles.forEach((item, idx) => {
    const list = getEffectivePrice(item.product, item.size)
    const unit = getFinalPrice(item.product, item.size, discounts)
    const subtotal = unit * item.qty
    const slug = item.product.slug
    const discounted = unit < list
    lines.push(`${idx + 1}. ${item.product.name}`)
    if (!isUnicoLabel(item.size)) lines.push(`   • Talle: ${item.size}`)
    lines.push(`   • Cantidad: ${item.qty}`)
    // Anush sabe de entrada que no hay que tejerla.
    if (isReadyToShip(item.product)) lines.push('   • En stock')
    if (discounted) {
      lines.push(`   • Precio unitario: ${formatPrice(unit)} (antes ${formatPrice(list)})`)
    }
    lines.push(`   • Subtotal: ${formatPrice(subtotal)}`)
    lines.push(`   ${siteUrl}/tienda/${slug}`)
    lines.push('')
  })

  if (coupon && coupon.discount > 0) {
    lines.push(`Cupón ${coupon.code}: −${formatPrice(coupon.discount)}`)
  }
  if (coupon?.freeShipping) {
    lines.push(`Cupón ${coupon.code}: envío gratis`)
  } else if (freeShippingOver) {
    lines.push(`Envío gratis (pedido arriba de ${formatPrice(freeShippingOver)})`)
  }
  // Sin envío gratis, el total es de las prendas: que el envío no aparezca
  // como sorpresa recién en el chat (recorridos 04/11/2026).
  const envioGratis = !!coupon?.freeShipping || !!freeShippingOver
  lines.push(envioGratis ? `Total: ${formatPrice(total)}` : `Total de las prendas: ${formatPrice(total)} (+ envío según zona)`)
  if (giftNote) {
    lines.push('')
    lines.push(`🎁 Nota de regalo: "${giftNote}"`)
  }
  lines.push('')
  // El envío va en la pregunta (auditoría 12/09/2026): es la duda que más
  // frena, y así la primera respuesta ya puede traer el costo.
  // Si todo está tejido, preguntar el plazo era una vuelta de chat de más.
  const todoEnStock = pedibles.every((i) => isReadyToShip(i.product))
  lines.push(todoEnStock
    ? '¿Me pasás el costo de envío a mi zona y cómo te pago? ¡Gracias!'
    : '¿Me confirmás el plazo, el costo de envío a mi zona y cómo te pago? ¡Gracias!')
  if (trackingCode) {
    // Al final, para no tapar el pedido. Le sirve a Anush para ubicarlo en
    // el admin y a la clienta para seguirlo (12/10/2026).
    lines.push('')
    lines.push(`Código de pedido: ${trackingCode} (para seguirlo en ${siteUrl.replace(/^https?:\/\//, '')}/pedido)`)
  }

  return lines.join('\n')
}

/** FNV-1a de 32 bits: corto, estable y sin dependencias (no es criptográfico). */
function fnv1a(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36)
}

/**
 * Huella del contenido del pedido: prendas, talles, cantidades, cupón y nota
 * (CRO-10, QA-11). Mientras no cambie, volver a tocar "Pedir por WhatsApp"
 * reabre el mismo pedido con el mismo código: no registra otro ni vuelve a
 * canjear el cupón. El orden de las prendas no cuenta.
 */
export function cartSignature(
  buyable: Array<Pick<CartItem, 'size' | 'qty'> & { product: Pick<Product, 'slug'> }>,
  couponCode: string | null | undefined,
  giftNote: string | null | undefined
): string {
  const piezas = buyable.map((i) => `${i.product.slug}|${i.size}|${i.qty}`).sort().join(';')
  return fnv1a(`${piezas}|${(couponCode ?? '').trim().toUpperCase()}|${(giftNote ?? '').trim()}`)
}

/**
 * Los ítems tal como se guardan en orders.items. Lleva el product_id (CRO-07):
 * el slug cambia si Anush edita el link, y descontar stock más adelante tiene
 * que ir por id. Va dentro del JSON, sin columna nueva.
 */
export function orderItemsPayload(buyable: BuyableItem[], discounts: Discount[]) {
  return buyable.map((i) => ({
    product_id: i.product.id,
    name: i.product.name,
    slug: i.product.slug,
    size: i.size,
    qty: i.qty,
    unit_price_uyu: getFinalPrice(i.product, i.size, discounts),
  }))
}
