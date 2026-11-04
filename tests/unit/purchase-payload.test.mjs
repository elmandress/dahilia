// src/lib/purchase-payload.ts: el Purchase que recibe Meta al marcar "Vendido"
// (TRK-02). lib/purchase.ts importa 'server-only'; el armado vive acá y se
// prueba sin red.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { armarPurchase, purchaseEventId } from '@/lib/purchase-payload'
import { metaContentId } from '@/lib/meta-pixel'
import { SITE_URL } from '@/lib/env'

const T = 1_762_300_000

const PEDIDO = {
  id: '6f1c2a54-9d2b-4c6e-9a51-1f0e2d3c4b5a',
  tracking_code: 'PED-ABC234',
  items: [
    { slug: 'spring-cardigan', size: 'M', qty: 1, unit_price_uyu: 3230, name: 'Spring cardigan' },
    { slug: 'bandana-lila', size: 'Único', qty: 2, unit_price_uyu: 690, name: 'Bandana' },
  ],
  total_uyu: 4610,
  client_ip: '190.64.1.1',
  client_user_agent: 'Mozilla/5.0',
  meta_fbp: 'fb.1.1700000000000.123',
  meta_fbc: null,
}

test("event_id 'purchase-PED-ABC234': el mismo que van a usar el navegador y el pago online", () => {
  const e = armarPurchase(PEDIDO, 4610, T)
  assert.equal(e.event_id, 'purchase-PED-ABC234')
  assert.equal(e.event_name, 'Purchase')
  assert.equal(e.custom_data.order_id, 'PED-ABC234')
  assert.equal(purchaseEventId(PEDIDO), 'purchase-PED-ABC234')
})

test('con tracking_code null (pedido viejo) usa el id de la fila', () => {
  const e = armarPurchase({ ...PEDIDO, tracking_code: null }, 4610, T)
  assert.equal(e.event_id, `purchase-${PEDIDO.id}`)
  assert.equal(e.custom_data.order_id, PEDIDO.id)
  assert.equal(armarPurchase({ ...PEDIDO, tracking_code: '  ' }, 4610, T).event_id, `purchase-${PEDIDO.id}`)
})

test('value es el monto confirmado, no el total que mandó el navegador', () => {
  const e = armarPurchase(PEDIDO, 4200, T)
  assert.equal(e.custom_data.value, 4200)
  assert.equal(e.custom_data.currency, 'UYU')
  assert.equal(armarPurchase(PEDIDO, Number.NaN, T).custom_data.value, 0)
})

test('content_ids con metaContentId: slug-talle, y solo el slug en talle único', () => {
  const e = armarPurchase(PEDIDO, 4610, T)
  assert.deepEqual(e.custom_data.content_ids, [metaContentId('spring-cardigan', 'M'), metaContentId('bandana-lila', 'Único')])
  assert.deepEqual(e.custom_data.content_ids, ['spring-cardigan-M', 'bandana-lila'])
  assert.equal(e.custom_data.content_type, 'product')
  assert.deepEqual(e.custom_data.contents, [
    { id: 'spring-cardigan-M', quantity: 1, item_price: 3230 },
    { id: 'bandana-lila', quantity: 2, item_price: 690 },
  ])
  assert.equal(e.custom_data.num_items, 3)
})

test('hora de la venta, sitio y datos del navegador del pedido', () => {
  const e = armarPurchase(PEDIDO, 4610, T)
  assert.equal(e.event_time, T)
  assert.equal(e.action_source, 'website')
  assert.equal(e.event_source_url, `${SITE_URL}/carrito`)
  assert.deepEqual(e.user_data, { client_ip_address: '190.64.1.1', client_user_agent: 'Mozilla/5.0', fbp: 'fb.1.1700000000000.123', fbc: null })
})

test('items rotos (jsonb viejo) no tiran el evento', () => {
  const e = armarPurchase({ ...PEDIDO, items: [null, { qty: 1 }, { slug: 'top-race', size: 'S', qty: 'x' }] }, 1500, T)
  assert.deepEqual(e.custom_data.content_ids, ['top-race-S'])
  assert.equal(e.custom_data.num_items, 1)
  assert.deepEqual(armarPurchase({ ...PEDIDO, items: undefined }, 1500, T).custom_data.content_ids, [])
})
