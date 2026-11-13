// src/lib/cart-offline.ts: el carrito cuando /api/cart no contesta (13/11/2026).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { agregarOffline, cambiarOffline, anotarPendiente, leerPendientes, planDeSync } from '@/lib/cart-offline'

const PONCHO = { id: 'p1', slug: 'poncho-ete', name: 'Poncho Été', status: 'active', base_price_uyu: 1890, sizes: [{ size: 'XS/S', available: true }, { size: 'M/L', available: false }] }
const BOLSO = { id: 'p2', slug: 'bolso', name: 'Bolso', status: 'active', base_price_uyu: 1600, sizes: [] }
const AHORA = '2026-11-13T12:00:00.000Z'

test('agregar sin servidor: la prenda queda en el carrito y anotada con su cantidad final', () => {
  const a = agregarOffline([], BOLSO, 'Único', 1, 'l1', AHORA)
  assert.equal(a.items.length, 1)
  assert.equal(a.items[0].product, BOLSO)
  assert.deepEqual(a.pendiente, { productId: 'p2', size: 'Único', qty: 1 })
  const b = agregarOffline(a.items, BOLSO, 'Único', 2, 'l2', AHORA)
  assert.equal(b.items.length, 1)
  assert.deepEqual(b.pendiente, { productId: 'p2', size: 'Único', qty: 3 })
})

test('sin servidor tampoco se agrega un talle sin stock ni una prenda agotada', () => {
  assert.equal(agregarOffline([], PONCHO, 'M/L', 1, 'l1', AHORA), null)
  assert.equal(agregarOffline([], { ...BOLSO, status: 'soldout' }, 'Único', 1, 'l1', AHORA), null)
})

test('cambiar cantidad y sacar sin servidor', () => {
  const { items } = agregarOffline([], PONCHO, 'XS/S', 1, 'l1', AHORA)
  assert.deepEqual(cambiarOffline(items, 'l1', 4).pendiente, { productId: 'p1', size: 'XS/S', qty: 4 })
  const fuera = cambiarOffline(items, 'l1', 0)
  assert.deepEqual(fuera.items, [])
  assert.equal(fuera.pendiente.qty, 0)
  assert.equal(cambiarOffline(items, 'no-esta', 1), null)
})

test('los pendientes guardan la última cantidad de cada prenda y talle', () => {
  let p = anotarPendiente([], { productId: 'p1', size: 'XS/S', qty: 1 })
  p = anotarPendiente(p, { productId: 'p2', size: 'Único', qty: 2 })
  p = anotarPendiente(p, { productId: 'p1', size: 'XS/S', qty: 3 })
  assert.deepEqual(p, [{ productId: 'p2', size: 'Único', qty: 2 }, { productId: 'p1', size: 'XS/S', qty: 3 }])
  assert.deepEqual(leerPendientes(JSON.stringify(p)), p)
  assert.deepEqual(leerPendientes('roto'), [])
})

test('al volver el servidor: agrega lo que no tiene, corrige cantidades, saca lo sacado y no repite lo que ya está', () => {
  const servidor = [{ id: 's1', product_id: 'p1', size: 'XS/S', qty: 1 }, { id: 's2', product_id: 'p3', size: 'M', qty: 2 }, { id: 's3', product_id: 'p4', size: 'S', qty: 1 }]
  const pendientes = [
    { productId: 'p1', size: 'XS/S', qty: 3 },
    { productId: 'p2', size: 'Único', qty: 1 },
    { productId: 'p3', size: 'M', qty: 0 },
    { productId: 'p4', size: 'S', qty: 1 },
    { productId: 'p5', size: 'L', qty: 0 },
  ]
  assert.deepEqual(planDeSync(pendientes, servidor), [
    { tipo: 'cantidad', itemId: 's1', qty: 3 },
    { tipo: 'agregar', productId: 'p2', size: 'Único', qty: 1 },
    { tipo: 'cantidad', itemId: 's2', qty: 0 },
  ])
})
