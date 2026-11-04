// src/lib/catalog-fallback.ts: qué catálogo se muestra cuando falla una parte
// de la base (QA-08). Antes, un error en descuentos o Configuración tiraba toda
// la tienda al snapshot de octubre.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { componerCatalogo, sinClavesConFecha, LAST_GOOD_MAX_MS } from '@/lib/catalog-fallback'

const AHORA = Date.parse('2026-11-04T15:00:00Z')
const HORA = 3_600_000

const prenda = (slug, base_price_uyu) => ({ id: slug, slug, name: slug, base_price_uyu, status: 'active', sizes: [] })

const CORE = {
  products: [prenda('poncho-ete', 2890), prenda('spring-cardigan', 3230)],
  categories: [{ id: 'c1', slug: 'cardigans', name: 'Cardigans' }],
  colors: [],
  collections: [{ id: 'k1', slug: 'sunset-26', name: 'Sunset ’26', published: true }],
}
const EXTRA = {
  discounts: [{ id: 'd1', label: 'Hoy', scope: 'all', percent: 10, active: true }],
  settings: { contact_whatsapp_url: 'https://wa.me/59899850073', queue_note_enabled: 'false' },
}
const SNAPSHOT = {
  products: [prenda('top-cherry', 1999)],
  categories: [{ id: 'c1', slug: 'cardigans', name: 'Cardigans' }],
  colors: [],
  discounts: [{ id: 'viejo', label: 'Octubre', scope: 'all', percent: 15, active: true }],
  settings: {
    contact_whatsapp_url: 'https://wa.me/59899850073',
    free_shipping_threshold: '4500',
    queue_note_text: 'Por demanda, los pedidos estarán listos a principios de octubre',
    drop_name: 'Sunset ‘26',
    drop_date: '2026-10-28 19:00',
    promo_bar_text: 'Sunset ‘26 en stock · 15% off esta semana',
    navidad_encargo_hasta: '2026-11-27',
  },
  collections: [],
  source: 'snapshot',
}
const vivo = (extraSettings = {}) => ({ ...CORE, ...EXTRA, settings: { ...EXTRA.settings, ...extraSettings }, source: 'live' })

test('todo en vivo: el catálogo en vivo, sin marca de respaldo', () => {
  const c = componerCatalogo({ core: CORE, extra: EXTRA, lastGood: null, snapshot: SNAPSHOT, now: AHORA })
  assert.equal(c.source, 'live')
  assert.equal(c.degraded, undefined)
  assert.deepEqual(c.products, CORE.products)
  assert.deepEqual(c.discounts, EXTRA.discounts)
  assert.deepEqual(c.settings, EXTRA.settings)
})

test('extra caído sin lastGood: productos en vivo y Configuración del snapshot sin claves con fecha', () => {
  const c = componerCatalogo({ core: CORE, extra: null, lastGood: null, snapshot: SNAPSHOT, now: AHORA })
  assert.equal(c.source, 'live')
  assert.equal(c.degraded, true)
  assert.deepEqual(c.products, CORE.products)
  assert.deepEqual(c.collections, CORE.collections)
  // Nada de "listos a principios de octubre", drop viejo, promo vencida ni Navidad.
  assert.deepEqual(
    Object.keys(c.settings).filter((key) => /^(queue_note_|drop_|promo_bar_|navidad_)/.test(key)),
    [],
  )
  assert.equal(c.settings.free_shipping_threshold, '4500')
  assert.equal(c.settings.contact_whatsapp_url, 'https://wa.me/59899850073')
  // Las reglas viejas del snapshot sobre precios de hoy darían un precio que nadie fijó.
  assert.deepEqual(c.discounts, [])
})

test('extra caído con lastGood de menos de 24 h: descuentos y Configuración del último bueno', () => {
  const lastGood = { catalog: vivo({ promo_bar_text: 'Envío gratis desde UYU 4.500' }), at: AHORA - 3 * HORA }
  const c = componerCatalogo({ core: CORE, extra: null, lastGood, snapshot: SNAPSHOT, now: AHORA })
  assert.equal(c.degraded, true)
  assert.deepEqual(c.products, CORE.products)
  assert.deepEqual(c.discounts, EXTRA.discounts)
  assert.equal(c.settings.promo_bar_text, 'Envío gratis desde UYU 4.500')
})

test('extra caído con lastGood viejo: vuelve al snapshot sin claves con fecha y sin descuentos', () => {
  const lastGood = { catalog: vivo(), at: AHORA - LAST_GOOD_MAX_MS - HORA }
  const c = componerCatalogo({ core: CORE, extra: null, lastGood, snapshot: SNAPSHOT, now: AHORA })
  assert.deepEqual(c.products, CORE.products)
  assert.deepEqual(c.discounts, [])
  assert.equal(c.settings.queue_note_text, undefined)
})

test('core caído con lastGood de menos de 24 h: devuelve lastGood', () => {
  const lastGood = { catalog: vivo(), at: AHORA - 23 * HORA }
  const c = componerCatalogo({ core: null, extra: EXTRA, lastGood, snapshot: SNAPSHOT, now: AHORA })
  assert.equal(c.source, 'live')
  assert.equal(c.degraded, true)
  assert.deepEqual(c.products, CORE.products)
  assert.deepEqual(c.discounts, EXTRA.discounts)
  assert.deepEqual(c.collections, CORE.collections)
})

test('core caído con lastGood viejo: devuelve el snapshot', () => {
  const lastGood = { catalog: vivo(), at: AHORA - 25 * HORA }
  const c = componerCatalogo({ core: null, extra: null, lastGood, snapshot: SNAPSHOT, now: AHORA })
  assert.equal(c.source, 'snapshot')
  assert.deepEqual(c.products, SNAPSHOT.products)
  assert.deepEqual(c.discounts, SNAPSHOT.discounts)
  // El snapshot puede llevar semanas desplegado: sus avisos con fecha tampoco salen.
  assert.equal(c.settings.queue_note_text, undefined)
  assert.equal(c.settings.promo_bar_text, undefined)
  assert.equal(c.settings.free_shipping_threshold, '4500')
})

test('core caído sin lastGood: el snapshot, aunque los ajustes respondan', () => {
  const c = componerCatalogo({ core: null, extra: EXTRA, lastGood: null, snapshot: SNAPSHOT, now: AHORA })
  assert.equal(c.source, 'snapshot')
  assert.deepEqual(c.products, SNAPSHOT.products)
})

test('sinClavesConFecha no toca el resto ni el original', () => {
  const settings = { queue_note_enabled: 'true', drop_name: 'X', hero_title: 'Hola', qr_discount_code: 'GRACIAS15' }
  assert.deepEqual(sinClavesConFecha(settings), { hero_title: 'Hola', qr_discount_code: 'GRACIAS15' })
  assert.equal(settings.drop_name, 'X')
})

test('un interruptor apagado se queda: la barra de promo apagada no vuelve con el texto por defecto', () => {
  const settings = { promo_bar_enabled: 'false', promo_bar_text: '15% off esta semana', navidad_enabled: 'false', drop_enabled: 'true' }
  assert.deepEqual(sinClavesConFecha(settings), { promo_bar_enabled: 'false', navidad_enabled: 'false' })
})
