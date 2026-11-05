// src/lib/seo-copy.ts → datosTarjetaOG: qué muestra la tarjeta OG de una ficha
// (SEO-13). Un drop sin lanzar da la tarjeta genérica de la marca, y el precio
// lleva los descuentos de lote. Se prueba la función: las rutas OG no se piden
// en las pruebas (bajan la foto de Supabase).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { datosTarjetaOG } from '@/lib/seo-copy'

const P = (o) => ({
  id: 'p', slug: 'top-x', name: 'Top X', description: null, status: 'active', is_custom_only: false,
  discount_active: false, discount_percent: 0, category_id: 'cat-tops', collection_id: null,
  lead_time_weeks_min: 2, lead_time_weeks_max: 3, base_price_uyu: 2000, sizes: [], ...o,
})
const regla = (o) => ({
  id: 'd1', label: 'Tops', scope: 'category', category_id: 'cat-tops', percent: 20,
  active: true, starts_at: null, ends_at: null, created_at: '2026-11-01T00:00:00Z', ...o,
})

test('una prenda con collection_id y la colección en null (drop sin lanzar, la RLS la esconde) da null', () => {
  assert.equal(datosTarjetaOG(P({ collection_id: 'col-1', collection: null })), null)
  assert.equal(datosTarjetaOG(P({ collection_id: 'col-1' })), null)
  assert.equal(datosTarjetaOG(P({ collection_id: 'col-1', collection: { published: false, unlisted: false } })), null)
})

test('sin prenda o en borrador: tarjeta genérica', () => {
  assert.equal(datosTarjetaOG(null), null)
  assert.equal(datosTarjetaOG(undefined), null)
  assert.equal(datosTarjetaOG(P({ status: 'draft' })), null)
})

test('pública, agotada o "Solo con link" (la lista VIP): nombre y precio', () => {
  for (const p of [
    P(),
    P({ status: 'soldout' }),
    P({ collection_id: 'col-1', collection: { published: true, unlisted: false } }),
    P({ collection_id: 'col-1', collection: { published: true, unlisted: true } }),
  ]) {
    const d = datosTarjetaOG(p)
    assert.ok(d)
    assert.equal(d.nombre, 'Top X')
    assert.equal(d.final, 2000)
  }
})

test('una regla de descuento por categoría cambia el precio final (antes iba el precio lleno)', () => {
  const sin = datosTarjetaOG(P(), [])
  assert.equal(sin.final, 2000)
  assert.equal(sin.lista, 2000)
  const con = datosTarjetaOG(P(), [regla()])
  assert.equal(con.final, 1600)
  assert.equal(con.lista, 2000, 'el de lista se muestra tachado')
  // Una regla de otra categoría, o vencida, no la toca.
  assert.equal(datosTarjetaOG(P(), [regla({ category_id: 'cat-sets' })]).final, 2000)
  assert.equal(datosTarjetaOG(P(), [regla({ ends_at: '2020-01-01T00:00:00Z' })]).final, 2000)
})

test('precio "desde": el talle disponible más barato, con el descuento de la prenda', () => {
  const p = P({
    discount_active: true, discount_percent: 15,
    sizes: [
      { size: 'S', price_uyu: 2940, available: false, sort_order: 1 },
      { size: 'M', price_uyu: 3150, available: true, sort_order: 2 },
      { size: 'L', price_uyu: 3470, available: true, sort_order: 3 },
    ],
  })
  const d = datosTarjetaOG(p)
  assert.equal(d.lista, 3150)
  assert.equal(d.final, Math.round(3150 * 0.85))
  assert.equal(d.desde, true)
})

test('el pie promete lo que la prenda cumple', () => {
  assert.equal(datosTarjetaOG(P({ lead_time_weeks_min: 0 })).pie, 'Tejido a mano en Uruguay')
  assert.equal(datosTarjetaOG(P({ category_id: 'cat-accesorios' })).pie, 'Tejido a mano en Uruguay · En tus colores')
  assert.equal(
    datosTarjetaOG(P({ sizes: [{ size: 'S', available: true, sort_order: 1 }, { size: 'M', available: true, sort_order: 2 }] })).pie,
    'Tejido a mano en Uruguay · A tu talle y en tus colores',
  )
})
