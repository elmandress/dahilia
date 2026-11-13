// src/lib/cart-local.ts: el carrito cuando la base no responde (13/11/2026).
// Con Supabase restringido, /api/cart sigue andando desde una cookie.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  leerCarritoLocal, escribirCarritoLocal, agregarLocal, cambiarLocal, armarItemsLocales, CART_LOCAL_MAX_LINEAS,
} from '@/lib/cart-local'

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const PONCHO = { id: id(1), slug: 'poncho-ete', name: 'Poncho Été', status: 'active', base_price_uyu: 1890, sizes: [{ size: 'XS/S', available: true }, { size: 'M/L', available: false }] }
const BOLSO = { id: id(2), slug: 'bolso-margot', name: 'Bolso Margot', status: 'active', base_price_uyu: 1600, sizes: [] }
const AGOTADA = { id: id(3), slug: 'top', name: 'Top', status: 'soldout', base_price_uyu: 900, sizes: [] }
const CATALOGO = [PONCHO, BOLSO, AGOTADA]

test('agregar: guarda la prenda con su talle, y sin talles queda "Único"', () => {
  const a = agregarLocal([], CATALOGO, { productId: PONCHO.id, size: 'XS/S', qty: 1, nuevoId: id(10) })
  assert.equal(a.ok, true)
  const b = agregarLocal(a.lineas, CATALOGO, { productId: BOLSO.id, size: 'Único', qty: 2, nuevoId: id(11) })
  assert.deepEqual(b.lineas, [
    { id: id(10), productId: PONCHO.id, size: 'XS/S', qty: 1 },
    { id: id(11), productId: BOLSO.id, size: 'Único', qty: 2 },
  ])
})

test('agregar la misma prenda y talle suma a la línea, con tope de 20', () => {
  const a = agregarLocal([], CATALOGO, { productId: BOLSO.id, size: 'Único', qty: 15, nuevoId: id(10) })
  const b = agregarLocal(a.lineas, CATALOGO, { productId: BOLSO.id, size: 'Único', qty: 15, nuevoId: id(11) })
  assert.deepEqual(b.lineas, [{ id: id(10), productId: BOLSO.id, size: 'Único', qty: 20 }])
})

test('mismas reglas que con la base: ni agotada, ni talle sin stock, ni prenda inexistente', () => {
  assert.equal(agregarLocal([], CATALOGO, { productId: AGOTADA.id, size: 'Único', qty: 1, nuevoId: id(10) }).status, 409)
  assert.equal(agregarLocal([], CATALOGO, { productId: PONCHO.id, size: 'M/L', qty: 1, nuevoId: id(10) }).status, 409)
  assert.equal(agregarLocal([], CATALOGO, { productId: id(99), size: 'Único', qty: 1, nuevoId: id(10) }).status, 409)
})

test('la cookie no crece sin tope', () => {
  const llenas = Array.from({ length: CART_LOCAL_MAX_LINEAS }, (_, i) => ({ id: id(100 + i), productId: id(200 + i), size: 'Único', qty: 1 }))
  const r = agregarLocal(llenas, CATALOGO, { productId: BOLSO.id, size: 'Único', qty: 1, nuevoId: id(10) })
  assert.equal(r.ok, false)
  assert.ok(escribirCarritoLocal(llenas).length < 1800)
})

test('cambiar cantidad y sacar', () => {
  const lineas = [{ id: id(10), productId: PONCHO.id, size: 'XS/S', qty: 1 }, { id: id(11), productId: BOLSO.id, size: 'Único', qty: 2 }]
  assert.equal(cambiarLocal(lineas, id(10), 3)[0].qty, 3)
  assert.deepEqual(cambiarLocal(lineas, id(10), 0).map((l) => l.id), [id(11)])
  assert.deepEqual(cambiarLocal(lineas, id(99), 0), lineas)
})

test('la cookie va y vuelve, y lo que no tiene forma de carrito se descarta', () => {
  const lineas = [{ id: id(10), productId: PONCHO.id, size: 'XS/S', qty: 2 }]
  assert.deepEqual(leerCarritoLocal(escribirCarritoLocal(lineas)), lineas)
  assert.deepEqual(leerCarritoLocal('no es json'), [])
  assert.deepEqual(leerCarritoLocal('{"a":1}'), [])
  assert.deepEqual(leerCarritoLocal(JSON.stringify([['x', PONCHO.id, 'S', 1], [id(10), PONCHO.id, 'S', -4], [id(11), PONCHO.id, 'S', 999]])), [
    { id: id(11), productId: PONCHO.id, size: 'S', qty: 20 },
  ])
})

test('las líneas salen con la forma de cart_items y su prenda; lo que ya no está en el catálogo se omite', () => {
  const lineas = [{ id: id(10), productId: PONCHO.id, size: 'XS/S', qty: 2 }, { id: id(11), productId: id(99), size: 'Único', qty: 1 }]
  const items = armarItemsLocales(lineas, CATALOGO, 'carrito-1')
  assert.equal(items.length, 1)
  assert.deepEqual({ ...items[0], added_at: undefined }, { id: id(10), cart_id: 'carrito-1', product_id: PONCHO.id, size: 'XS/S', qty: 2, added_at: undefined, product: PONCHO })
})
