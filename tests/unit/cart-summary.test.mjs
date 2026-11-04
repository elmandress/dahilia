// src/lib/cart-summary.ts: una sola cuenta de lo pedible (QA-01, QA-07).
// Fixture de 5 ítems de la auditoría (QA/15-resumen-carrito.test.mjs).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { summarizeCart, cartItemIssue, resolverTalle, plazoLinea, motivoNoDisponible } from '@/lib/cart-summary'

const P = (o) => ({ status: 'active', is_custom_only: false, discount_active: false, discount_percent: 0, sizes: [], lead_time_weeks_min: 2, lead_time_weeks_max: 3, collection_id: null, ...o })
const cart = [
  { size: 'M/L', qty: 1, product: P({ slug: 'poncho-ete', base_price_uyu: 1890, discount_active: true, discount_percent: 15, sizes: [{ size: 'XS/S', available: true }, { size: 'M/L', available: true }] }) },
  { size: 'M', qty: 1, product: P({ slug: 'spring-cardigan', status: 'soldout', base_price_uyu: 2940, sizes: [{ size: 'S', available: true, price_uyu: 2940 }, { size: 'M', available: true, price_uyu: 3150 }] }) },
  { size: 'Único', qty: 1, product: P({ slug: 'bolso-margot-butter', base_price_uyu: 1600, discount_active: true, discount_percent: 15 }) },
  { size: 'XL', qty: 1, product: P({ slug: 'chaleco', base_price_uyu: 1250, sizes: [{ size: 'S', available: true }, { size: 'M', available: true }, { size: 'L', available: true }] }) },
  { size: 'M', qty: 2, product: P({ slug: 'top-race', base_price_uyu: 1040, sizes: [{ size: 'S', available: true }, { size: 'M', available: false }] }) },
]

test('una sola cuenta: 2 piezas pedibles por UYU 2.967', () => {
  const s = summarizeCart(cart, [])
  assert.equal(s.count, 2)
  assert.equal(s.subtotal, 1607 + 1360)
  assert.deepEqual(s.buyable.map((i) => i.product.slug), ['poncho-ete', 'bolso-margot-butter'])
})

test('cada no disponible con su motivo', () => {
  const s = summarizeCart(cart, [])
  assert.deepEqual(
    s.unavailable.map((u) => [u.item.product.slug, u.issue]),
    [['spring-cardigan', 'no-activa'], ['chaleco', 'talle-inexistente'], ['top-race', 'talle-agotado']]
  )
  assert.equal(motivoNoDisponible('no-activa', { status: 'soldout' }), 'Se agotó')
  assert.equal(motivoNoDisponible('no-activa', { status: 'draft' }), 'Ya no está a la venta')
})

test('los descuentos por lote entran en el subtotal', () => {
  const lote = [{ id: 'd', label: 'Todo', scope: 'all', category_id: null, percent: 20, active: true, starts_at: null, ends_at: null, created_at: '' }]
  // Poncho: el 15 % propio pierde contra el 20 % del lote (gana el mayor).
  assert.equal(summarizeCart(cart, lote).subtotal, 1512 + 1280)
})

test('sin prenda: no se cuenta ni se muestra', () => {
  const s = summarizeCart([{ size: 'M', qty: 3, product: null }, ...cart], [])
  assert.equal(s.count, 2)
  assert.equal(s.unavailable.length, 3)
  assert.equal(cartItemIssue({ size: 'M', qty: 1 }), 'sin-producto')
})

test('a medida no se puede pedir desde el carrito', () => {
  assert.equal(cartItemIssue({ size: 'Único', qty: 1, product: P({ is_custom_only: true }) }), 'a-medida')
})

test('drop oculto: solo si el join de la colección vino', () => {
  const conJoin = P({ slug: 'x', base_price_uyu: 1000, collection_id: 'c1', collection: { published: false, unlisted: false } })
  assert.equal(cartItemIssue({ size: 'Único', qty: 1, product: conJoin }), 'drop-oculto')
  // RLS: la colección en borrador vuelve vacía en el join → también oculta.
  assert.equal(cartItemIssue({ size: 'Único', qty: 1, product: { ...conJoin, collection: null } }), 'drop-oculto')
  // Publicada o "solo con link": se pide.
  assert.equal(cartItemIssue({ size: 'Único', qty: 1, product: { ...conJoin, collection: { published: true, unlisted: true } } }), null)
  // Sin join (copia vieja del carrito en localStorage): no se marca todo Sunset.
  const sinJoin = P({ slug: 'x', base_price_uyu: 1000, collection_id: 'c1' })
  assert.equal(cartItemIssue({ size: 'Único', qty: 1, product: sinJoin }), null)
  assert.equal(summarizeCart([{ size: 'Único', qty: 1, product: conJoin }], []).count, 0)
})

test("'Único' y 'Talle único' son el mismo talle", () => {
  const manguitas = P({ slug: 'manguitas-tramonto', base_price_uyu: 990, sizes: [{ size: 'Talle único', available: true }] })
  assert.equal(cartItemIssue({ size: 'Único', qty: 1, product: manguitas }), null)
  assert.equal(cartItemIssue({ size: 'Talle único', qty: 1, product: manguitas }), null)
  const soloUnico = P({ slug: 'y', base_price_uyu: 500, sizes: [{ size: 'Único', available: true }] })
  assert.equal(cartItemIssue({ size: 'Talle único', qty: 1, product: soloUnico }), null)
})

test('resolverTalle: valida contra todas las filas', () => {
  const filas = [{ size: 'S', available: true }, { size: 'M', available: false }]
  assert.deepEqual(resolverTalle(filas, 'S'), { ok: true, talle: 'S' })
  assert.deepEqual(resolverTalle(filas, 'M'), { ok: false, status: 409, error: 'Ese talle no está disponible.' })
  assert.deepEqual(resolverTalle(filas, 'XL'), { ok: false, status: 409, error: 'Ese talle no está disponible.' })
  // Con filas, 'Único' no es un talle de la prenda.
  assert.equal(resolverTalle(filas, 'Único').status, 409)
  // Sin filas: talle único.
  assert.deepEqual(resolverTalle([], 'Único'), { ok: true, talle: 'Único' })
  assert.deepEqual(resolverTalle(null, 'M'), { ok: true, talle: 'Único' })
  // Fila 'Talle único': un 'Único' la encuentra y se guarda el rótulo de la fila.
  assert.deepEqual(resolverTalle([{ size: 'Talle único', available: true }], 'Único'), { ok: true, talle: 'Talle único' })
  // Más de 40 caracteres: 400, sin cortarlo.
  const largo = 'M/L (hasta 100 cm de busto, con caracolas)'
  assert.ok(largo.length > 40)
  assert.deepEqual(resolverTalle(filas, largo), { ok: false, status: 400, error: 'Talle inválido.' })
  assert.deepEqual(resolverTalle([{ size: 'M/L (hasta 100 cm)', available: true }], 'M/L (hasta 100 cm)'), { ok: true, talle: 'M/L (hasta 100 cm)' })
})

test('plazoLinea: en stock, se teje al encargar o nada con cola', () => {
  assert.deepEqual(plazoLinea(P({ lead_time_weeks_min: 0 }), ''), { text: 'En stock: sale sin la espera de los encargos', ready: true })
  assert.deepEqual(plazoLinea(P({ lead_time_weeks_min: 0 }), 'Los encargos nuevos empiezan en agosto'), { text: 'En stock: sale sin la espera de los encargos', ready: true })
  const encargo = plazoLinea(P({ lead_time_weeks_min: 2, lead_time_weeks_max: 3 }), '')
  assert.equal(encargo.ready, false)
  assert.match(encargo.text, /^Se teje al encargar: lista entre el \d+ de \S+ y el \d+ de \S+$/)
  assert.equal(plazoLinea(P({ lead_time_weeks_min: 2, lead_time_weeks_max: 3 }), 'Cola hasta agosto'), null)
  assert.equal(plazoLinea(P({ lead_time_weeks_min: 0, lead_time_weeks_max: 0, is_custom_only: true }), ''), null)
})
