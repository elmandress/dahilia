// src/lib/meta-pixel.ts: los datos que recibe Meta (píxel y API de
// conversiones) tienen que usar los ids del feed (TRK-01). Una vista es
// product_group solo si la prenda va como grupo en el feed (meta_group).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { metaData, metaContentId } from '@/lib/meta-pixel'
import { feedItemId } from '@/lib/catalog-ids'

const item = (o) => ({ item_id: 'spring-cardigan', item_name: 'Spring cardigan', price: 2940, ...o })

test('ViewContent con meta_group false da product; con true, product_group con el slug', () => {
  const bandana = metaData('ViewContent', { items: [item({ item_id: 'bandana', item_name: 'Bandana', price: 720 })], currency: 'UYU', value: 720, meta_group: false })
  assert.equal(bandana.content_type, 'product')
  assert.deepEqual(bandana.content_ids, ['bandana'])
  assert.equal(bandana.value, 720)
  assert.equal(bandana.currency, 'UYU')

  const spring = metaData('ViewContent', { items: [item()], currency: 'UYU', value: 2940, meta_group: true })
  assert.equal(spring.content_type, 'product_group')
  assert.deepEqual(spring.content_ids, ['spring-cardigan'])
  assert.equal(spring.content_name, 'Spring cardigan')
})

test('sin meta_group (o con algo que no es true) va como product', () => {
  assert.equal(metaData('ViewContent', { items: [item()] }).content_type, 'product')
  assert.equal(metaData('ViewContent', { items: [item()], meta_group: 'true' }).content_type, 'product')
  assert.equal(metaData('ViewContent', { items: [item()], meta_group: 1 }).content_type, 'product')
})

test('AddToCart: los content_ids salen de feedItemId (talle, "Único" y "Talle único")', () => {
  const d = metaData('AddToCart', {
    items: [
      item({ item_variant: 'M', quantity: 2 }),
      item({ item_id: 'sweater-net', item_name: 'Sweater net', price: 1899, item_variant: 'Único' }),
      item({ item_id: 'manguitas-tramonto', item_name: 'Manguitas Tramonto', price: 1360, item_variant: 'Talle único' }),
      item({ item_id: 'poncho-ete', item_name: 'Poncho Eté', price: 2210, item_variant: 'XS/S' }),
    ],
    currency: 'UYU',
    value: 2940 * 2 + 1899 + 1360 + 2210,
  })
  assert.deepEqual(d.content_ids, [
    feedItemId('spring-cardigan', 'M'), feedItemId('sweater-net', 'Único'),
    feedItemId('manguitas-tramonto', 'Talle único'), feedItemId('poncho-ete', 'XS/S'),
  ])
  // Antes: 'manguitas-tramonto-Talle único' (y el feed publicaba 'sweater-net-Único').
  assert.deepEqual(d.content_ids, ['spring-cardigan-M', 'sweater-net', 'manguitas-tramonto', 'poncho-ete-XS/S'])
  assert.equal(d.content_type, 'product')
  assert.deepEqual(d.contents[0], { id: 'spring-cardigan-M', quantity: 2, item_price: 2940 })
  assert.equal(d.num_items, 5)
  assert.equal(d.content_name, undefined, 'con varios ítems no va content_name')
})

test('Contact sin talle elegido de una prenda con talles: product_group (meta_group true)', () => {
  const d = metaData('Contact', { items: [item()], meta_group: true })
  assert.equal(d.content_type, 'product_group')
  assert.deepEqual(d.content_ids, ['spring-cardigan'])
  const conTalle = metaData('Contact', { items: [item({ item_variant: 'L' })], meta_group: false })
  assert.equal(conTalle.content_type, 'product')
  assert.deepEqual(conTalle.content_ids, ['spring-cardigan-L'])
})

test('sin ítems no hay content_ids; la búsqueda pasa como search_string', () => {
  const d = metaData('Search', { search_term: 'saco celeste' })
  assert.equal(d.content_ids, undefined)
  assert.equal(d.search_string, 'saco celeste')
})

test('metaContentId es feedItemId: el Purchase de meta-compra usa la misma regla', () => {
  assert.equal(metaContentId, feedItemId)
})
