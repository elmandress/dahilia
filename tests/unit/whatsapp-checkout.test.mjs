// src/lib/whatsapp-checkout.ts: el mensaje, la firma del carrito y los ítems
// del pedido (CRO-01, CRO-07, CRO-10). Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildWhatsAppMessage, cartSignature, orderItemsPayload } from '@/lib/whatsapp-checkout'
import { getFinalPrice } from '@/lib/types'

const SITE = 'https://dahila.uy'
const P = (o) => ({
  id: '00000000-0000-4000-8000-000000000000', status: 'active', is_custom_only: false,
  discount_active: false, discount_percent: 0, sizes: [], category_id: 'cat-otra',
  lead_time_weeks_min: 2, lead_time_weeks_max: 3, collection_id: null, ...o,
})
const DISCOUNTS = [
  // Regla de lote por categoría (sin fechas): 20 % a los accesorios.
  { id: 'd1', label: 'Accesorios', scope: 'category', category_id: 'cat-acc', percent: 20, active: true, starts_at: null, ends_at: null, created_at: '2026-01-01' },
]
const PONCHO = {
  id: 'i1', size: 'M/L', qty: 1,
  product: P({
    id: '11111111-1111-4111-8111-111111111111', slug: 'poncho-ete', name: 'Poncho Eté', base_price_uyu: 1890,
    discount_active: true, discount_percent: 15, lead_time_weeks_min: 0, lead_time_weeks_max: 0,
    sizes: [{ size: 'XS/S', available: true, price_uyu: null, sort_order: 1 }, { size: 'M/L', available: true, price_uyu: null, sort_order: 2 }],
  }),
}
const ITEMS = [
  PONCHO,
  { id: 'i2', size: 'Único', qty: 2, product: P({ id: '22222222-2222-4222-8222-222222222222', slug: 'mini-bufandas', name: 'Mini bufandas', base_price_uyu: 450, category_id: 'cat-acc', lead_time_weeks_min: 0, lead_time_weeks_max: 1 }) },
  {
    id: 'i3', size: 'M', qty: 1,
    product: P({
      id: '33333333-3333-4333-8333-333333333333', slug: 'spring-cardigan', name: 'Spring cardigan', base_price_uyu: 2940,
      sizes: [{ size: 'S', available: true, price_uyu: 2940, sort_order: 1 }, { size: 'M', available: true, price_uyu: 3150, sort_order: 2 }],
    }),
  },
]
const EN_STOCK = [
  PONCHO,
  { id: 'i4', size: 'Talle único', qty: 1, product: P({ id: '44444444-4444-4444-8444-444444444444', slug: 'manguitas-tramonto', name: 'Manguitas Tramonto', base_price_uyu: 990, lead_time_weeks_min: 0, sizes: [{ size: 'Talle único', available: true, price_uyu: null, sort_order: 1 }] }) },
]
const sum = (items) => items.reduce((s, i) => s + getFinalPrice(i.product, i.size, DISCOUNTS) * i.qty, 0)

// Salida de la función VIEJA (CarritoClient.tsx:80-148 en main @ de892e0),
// sacada con este mismo carrito ANTES de moverla. El texto no puede cambiar,
// salvo a propósito: con envío gratis la pregunta final ya no pide el costo
// de envío (NEG-7, revisión final 05/11/2026).
const VIEJO = {
  completo: [
    'Hola Anush! Quiero coordinar este pedido:', '',
    '1. Poncho Eté', '   • Talle: M/L', '   • Cantidad: 1', '   • En stock', '   • Precio unitario: UYU 1.607 (antes UYU 1.890)', '   • Subtotal: UYU 1.607', '   https://dahila.uy/tienda/poncho-ete', '',
    '2. Mini bufandas', '   • Cantidad: 2', '   • En stock', '   • Precio unitario: UYU 360 (antes UYU 450)', '   • Subtotal: UYU 720', '   https://dahila.uy/tienda/mini-bufandas', '',
    '3. Spring cardigan', '   • Talle: M', '   • Cantidad: 1', '   • Subtotal: UYU 3.150', '   https://dahila.uy/tienda/spring-cardigan', '',
    'Cupón GRACIAS15: −UYU 300', 'Envío gratis (pedido arriba de UYU 4.500)', 'Total: UYU 5.177', '',
    '🎁 Nota de regalo: "Feliz cumple, Lu"', '',
    '¿Me confirmás el plazo, cómo coordinamos el envío y cómo te pago? ¡Gracias!', '',
    'Código de pedido: PED-ABC234 (para seguirlo en dahila.uy/pedido)',
  ].join('\n'),
  enStockSinNada: [
    'Hola Anush! Quiero coordinar este pedido:', '',
    '1. Poncho Eté', '   • Talle: M/L', '   • Cantidad: 1', '   • En stock', '   • Precio unitario: UYU 1.607 (antes UYU 1.890)', '   • Subtotal: UYU 1.607', '   https://dahila.uy/tienda/poncho-ete', '',
    '2. Manguitas Tramonto', '   • Cantidad: 1', '   • En stock', '   • Subtotal: UYU 990', '   https://dahila.uy/tienda/manguitas-tramonto', '',
    'Total de las prendas: UYU 2.597 (+ envío según zona)', '',
    '¿Me pasás el costo de envío a mi zona y cómo te pago? ¡Gracias!', '',
    'Código de pedido: PED-XYZ789 (para seguirlo en dahila.uy/pedido)',
  ].join('\n'),
  cuponEnvio: [
    'Hola Anush! Quiero coordinar este pedido:', '',
    '1. Poncho Eté', '   • Talle: M/L', '   • Cantidad: 1', '   • En stock', '   • Precio unitario: UYU 1.607 (antes UYU 1.890)', '   • Subtotal: UYU 1.607', '   https://dahila.uy/tienda/poncho-ete', '',
    '2. Manguitas Tramonto', '   • Cantidad: 1', '   • En stock', '   • Subtotal: UYU 990', '   https://dahila.uy/tienda/manguitas-tramonto', '',
    'Cupón ENVIOGRATIS: envío gratis', 'Total: UYU 2.597', '',
    '¿Me decís cómo coordinamos el envío y cómo te pago? ¡Gracias!',
  ].join('\n'),
}

test('snapshot: el mensaje es idéntico al de la función vieja', () => {
  assert.equal(sum(ITEMS), 5477)
  assert.equal(
    buildWhatsAppMessage(ITEMS, DISCOUNTS, sum(ITEMS) - 300, {
      siteUrl: SITE, giftNote: 'Feliz cumple, Lu', coupon: { code: 'GRACIAS15', discount: 300, freeShipping: false }, freeShippingOver: 4500, trackingCode: 'PED-ABC234',
    }),
    VIEJO.completo
  )
  assert.equal(
    buildWhatsAppMessage(EN_STOCK, DISCOUNTS, sum(EN_STOCK), { siteUrl: SITE, giftNote: '', coupon: null, freeShippingOver: null, trackingCode: 'PED-XYZ789' }),
    VIEJO.enStockSinNada
  )
  assert.equal(
    buildWhatsAppMessage(EN_STOCK, DISCOUNTS, sum(EN_STOCK), { siteUrl: SITE, coupon: { code: 'ENVIOGRATIS', discount: 0, freeShipping: true } }),
    VIEJO.cuponEnvio
  )
})

test('una pieza agotada que quedó en el carrito no entra al mensaje ni suma la pregunta del plazo', () => {
  const agotada = { id: 'i9', size: 'M', qty: 1, product: { ...ITEMS[2].product, status: 'soldout' } }
  const msg = buildWhatsAppMessage([...EN_STOCK, agotada], DISCOUNTS, sum(EN_STOCK), { siteUrl: SITE, trackingCode: 'PED-XYZ789' })
  assert.equal(msg, VIEJO.enStockSinNada)
})

test('cartSignature: estable con el mismo contenido, cambia con qty, cupón o nota', () => {
  const base = cartSignature(ITEMS, null, '')
  assert.equal(cartSignature(ITEMS, null, ''), base)
  assert.equal(cartSignature([...ITEMS].reverse(), undefined, '  '), base) // el orden no cuenta
  assert.equal(cartSignature(ITEMS.map((i) => ({ ...i })), null, ''), base)
  assert.notEqual(cartSignature(ITEMS.map((i, k) => (k === 0 ? { ...i, qty: 2 } : i)), null, ''), base)
  assert.notEqual(cartSignature(ITEMS, 'GRACIAS15', ''), base)
  assert.notEqual(cartSignature(ITEMS, null, 'Para Lu'), base)
  assert.notEqual(cartSignature(ITEMS.map((i, k) => (k === 2 ? { ...i, size: 'S' } : i)), null, ''), base)
  assert.match(base, /^[0-9a-z]+$/)
})

test('orderItemsPayload: lleva product_id y el precio con descuentos', () => {
  assert.deepEqual(orderItemsPayload(ITEMS, DISCOUNTS), [
    { product_id: '11111111-1111-4111-8111-111111111111', name: 'Poncho Eté', slug: 'poncho-ete', size: 'M/L', qty: 1, unit_price_uyu: 1607 },
    { product_id: '22222222-2222-4222-8222-222222222222', name: 'Mini bufandas', slug: 'mini-bufandas', size: 'Único', qty: 2, unit_price_uyu: 360 },
    { product_id: '33333333-3333-4333-8333-333333333333', name: 'Spring cardigan', slug: 'spring-cardigan', size: 'M', qty: 1, unit_price_uyu: 3150 },
  ])
})
