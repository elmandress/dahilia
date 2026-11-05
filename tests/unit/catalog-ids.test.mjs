// src/lib/catalog-ids.ts: una sola regla de identidad para el feed, el JSON-LD,
// Meta y el Purchase (TRK-01, SEO-01, SEO-08).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { feedItemId, variantUrl, tieneVariantes } from '@/lib/catalog-ids'

test('feedItemId: el slug sin talle o con "Único"; slug-talle con un talle o modelo real', () => {
  assert.equal(feedItemId('sweater-net', 'Único'), 'sweater-net')
  assert.equal(feedItemId('manguitas-tramonto', 'Talle único'), 'manguitas-tramonto')
  assert.equal(feedItemId('bandana'), 'bandana')
  assert.equal(feedItemId('bandana', null), 'bandana')
  assert.equal(feedItemId('bandana', ''), 'bandana')
  assert.equal(feedItemId('poncho-ete', 'XS/S'), 'poncho-ete-XS/S')
  assert.equal(feedItemId('spring-cardigan', 'M'), 'spring-cardigan-M')
  // Espacios y tildes valen tal cual para Google y Meta: no se renombran.
  assert.equal(feedItemId('pulseras-terra', 'Con caracolas'), 'pulseras-terra-Con caracolas')
})

test('variantUrl: ?talle= codificado (la barra va como %2F) y la ficha a secas sin talle', () => {
  assert.equal(variantUrl('https://dahila.uy', 'poncho-ete', 'XS/S'), 'https://dahila.uy/tienda/poncho-ete?talle=XS%2FS')
  assert.equal(variantUrl('https://dahila.uy', 'pulseras-terra', 'Con lurex'), 'https://dahila.uy/tienda/pulseras-terra?talle=Con%20lurex')
  assert.equal(variantUrl('https://dahila.uy', 'sweater-net', 'Único'), 'https://dahila.uy/tienda/sweater-net')
  assert.equal(variantUrl('https://dahila.uy', 'bandana'), 'https://dahila.uy/tienda/bandana')
})

test('variantUrl: la ficha lee de vuelta el mismo talle (lib/product-selection.ts usa URLSearchParams)', () => {
  for (const talle of ['XS/S', 'M/L', 'Con caracolas', 'S']) {
    const url = new URL(variantUrl('https://dahila.uy', 'x', talle))
    assert.equal(url.searchParams.get('talle'), talle)
  }
})

test('tieneVariantes: false sin filas o con una sola fila "Talle único"', () => {
  assert.equal(tieneVariantes({ sizes: [{ size: 'Talle único' }] }), false)
  assert.equal(tieneVariantes({ sizes: [{ size: 'Único' }] }), false)
  assert.equal(tieneVariantes({ sizes: [] }), false)
  assert.equal(tieneVariantes({ sizes: null }), false)
  assert.equal(tieneVariantes({}), false)
})

test('tieneVariantes: true con talles o modelos, aunque estén agotados', () => {
  assert.equal(tieneVariantes({ sizes: [{ size: 'S' }, { size: 'M' }, { size: 'L' }] }), true)
  assert.equal(tieneVariantes({ sizes: [{ size: 'XS/S' }, { size: 'M/L' }] }), true)
  assert.equal(tieneVariantes({ sizes: [{ size: 'Lisas' }, { size: 'Con lurex' }, { size: 'Con caracolas' }] }), true)
  assert.equal(tieneVariantes({ sizes: [{ size: 'S', available: false }, { size: 'M', available: false }] }), true)
  // Una sola fila real: el carrito la agrega como "M" (id slug-M), así que la
  // prenda va como grupo y la vista apunta al item_group_id.
  assert.equal(tieneVariantes({ sizes: [{ size: 'M' }] }), true)
})
