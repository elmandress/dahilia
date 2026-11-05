// src/lib/ig-destacada.ts: la prenda grande de /ig (CRO-12). La fijada a mano
// manda; si no hay, la primera en stock del drop abierto con un rótulo
// verdadero; si tampoco, ninguna. "La del último reel" solo para la fijada.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { elegirDestacada } from '@/lib/ig-destacada'

const DROP = 'col-sunset'
const prenda = (slug, { orden = 0, stock = true, col = DROP, status = 'active' } = {}) => ({
  id: `id-${slug}`, slug, name: slug, status, sort_order: orden, collection_id: col,
  lead_time_weeks_min: stock ? 0 : 3, lead_time_weeks_max: stock ? 0 : 5, is_custom_only: false,
})
const ACTIVAS = [
  prenda('poncho-ete', { orden: 2 }),
  prenda('top-a-pedido', { orden: 0, stock: false }),
  prenda('bolso-margot-butter', { orden: 1 }),
  prenda('spring-cardigan', { orden: 0, col: null }),
]
const base = { active: ACTIVAS, dropCollectionId: DROP, dropName: 'Sunset ’26', dropLive: true }

test('la fijada a mano y activa manda, con "La del último reel"', () => {
  const d = elegirDestacada({ ...base, pinnedSlug: ' spring-cardigan ' })
  assert.equal(d?.producto.slug, 'spring-cardigan')
  assert.equal(d?.rotulo, 'La del último reel')
  assert.equal(d?.motivo, 'fijada')
})

test('sin fijada (o fijada que ya no está): la primera en stock del drop por sort_order, con su rótulo', () => {
  for (const pinnedSlug of ['', null, 'ya-no-existe']) {
    const d = elegirDestacada({ ...base, pinnedSlug })
    assert.equal(d?.producto.slug, 'bolso-margot-butter')
    assert.equal(d?.rotulo, 'Del drop Sunset ’26 · en stock')
    assert.equal(d?.motivo, 'drop')
  }
  // Una fijada agotada no cuenta.
  const conAgotada = elegirDestacada({ ...base, active: [...ACTIVAS, prenda('agotada', { status: 'soldout' })], pinnedSlug: 'agotada' })
  assert.equal(conAgotada?.motivo, 'drop')
})

test('sin fijada y sin drop abierto (o sin piezas en stock): ninguna', () => {
  assert.equal(elegirDestacada({ ...base, pinnedSlug: '', dropLive: false }), null)
  assert.equal(elegirDestacada({ ...base, pinnedSlug: '', dropCollectionId: null }), null)
  assert.equal(elegirDestacada({ ...base, pinnedSlug: '', dropName: '  ' }), null)
  assert.equal(elegirDestacada({ ...base, pinnedSlug: '', active: [prenda('top-a-pedido', { stock: false })] }), null)
})

test('"La del último reel" nunca sale para una elección automática', () => {
  for (const pinnedSlug of ['', 'ya-no-existe', 'spring-cardigan']) {
    const d = elegirDestacada({ ...base, pinnedSlug })
    if (d?.rotulo === 'La del último reel') assert.equal(d.motivo, 'fijada')
    if (d?.motivo === 'drop') assert.notEqual(d.rotulo, 'La del último reel')
  }
})
