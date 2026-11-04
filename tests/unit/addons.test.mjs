// src/lib/addons.ts: qué se sugiere y cómo se agrega (QA-06, CRO-11, CRO-22).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addonAction, pickAddonSuggestions } from '@/lib/addons'

let n = 0
const P = (o) => ({
  id: `p${++n}`, status: 'active', is_custom_only: false, discount_active: false, discount_percent: 0,
  sizes: [], category_id: 'cat-acc', lead_time_weeks_min: 0, lead_time_weeks_max: 0, base_price_uyu: 300, ...o,
})

// Tipo Pulseras Terra: tres variantes disponibles con precios distintos.
const pulseras = P({
  slug: 'pulseras-terra', base_price_uyu: 280,
  sizes: [
    { size: 'Lisas', available: true, price_uyu: 280, sort_order: 1 },
    { size: 'Con lurex', available: true, price_uyu: 300, sort_order: 2 },
    { size: 'Con caracolas', available: true, price_uyu: 370, sort_order: 3 },
  ],
})

test("addonAction: 3 variantes → 'choose' desde 280", () => {
  assert.deepEqual(addonAction(pulseras, []), { kind: 'choose', desde: 280, from: true })
})

test("addonAction: sin filas → 'one-tap' Único; con 1 disponible → ese talle", () => {
  assert.deepEqual(addonAction(P({ slug: 'mini-bufandas' }), []), { kind: 'one-tap', size: 'Único' })
  const unaSola = P({ slug: 'manguitas', sizes: [{ size: 'Talle único', available: true, price_uyu: null, sort_order: 1 }] })
  assert.deepEqual(addonAction(unaSola, []), { kind: 'one-tap', size: 'Talle único' })
  const dosUnaAgotada = P({ slug: 'z', sizes: [{ size: 'S', available: false, sort_order: 1 }, { size: 'M', available: true, sort_order: 2 }] })
  assert.deepEqual(addonAction(dosUnaAgotada, []), { kind: 'one-tap', size: 'M' })
})

test('addonAction: el precio "desde" aplica los descuentos', () => {
  const lote = [{ id: 'd', label: 'x', scope: 'all', category_id: null, percent: 10, active: true, starts_at: null, ends_at: null, created_at: '' }]
  assert.deepEqual(addonAction(pulseras, lote), { kind: 'choose', desde: 252, from: true })
})

test('pickAddonSuggestions con soloEnStock nunca devuelve encargos', () => {
  const candidatos = [
    pulseras,
    P({ slug: 'bufanda-sophie', base_price_uyu: 700, lead_time_weeks_min: 2, lead_time_weeks_max: 3 }),
    P({ slug: 'bandana', base_price_uyu: 450, lead_time_weeks_min: 1, lead_time_weeks_max: 2, category_id: 'cat-otra' }),
    P({ slug: 'mini-bufandas', base_price_uyu: 400 }),
  ]
  const enCarrito = [{ product_id: 'otro', product: P({ category_id: 'cat-tops', base_price_uyu: 2000 }) }]
  const todas = pickAddonSuggestions(candidatos, enCarrito, [], { max: 10 })
  assert.ok(todas.some((p) => p.lead_time_weeks_min > 0))
  const enStock = pickAddonSuggestions(candidatos, enCarrito, [], { max: 10, soloEnStock: true })
  assert.ok(enStock.length > 0)
  for (const p of enStock) assert.equal(p.lead_time_weeks_min, 0, p.slug)
  // Por defecto sigue siendo 3.
  assert.equal(pickAddonSuggestions(candidatos, enCarrito, []).length, 3)
})

test('pickAddonSuggestions: no sugiere lo que ya está, ni a medida, ni sin ningún talle disponible', () => {
  const agotadaPorTalle = P({ slug: 'sin-stock', sizes: [{ size: 'S', available: false, sort_order: 1 }] })
  const aMedida = P({ slug: 'a-medida', is_custom_only: true })
  const cara = P({ slug: 'cara', base_price_uyu: 2500 })
  const enCarrito = [{ product_id: pulseras.id, product: pulseras }]
  const out = pickAddonSuggestions([pulseras, agotadaPorTalle, aMedida, cara], enCarrito, [], { max: 10 })
  assert.deepEqual(out, [])
})
