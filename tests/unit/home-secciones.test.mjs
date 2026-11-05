// src/lib/home-sections.ts: secciones de la home sin prendas repetidas
// (VIS-06), destino de la portada (QA-15) y bloque del drop en el celular
// (VIS-02). Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { armarSeccionesHome, destinoPortada, mismaRuta, varianteDropArriba } from '@/lib/home-sections'

// Prenda mínima: lo que leen armarSeccionesHome e isReadyToShip.
const prenda = (slug, { fecha = '2026-01-01', stock = false, cat = 'tops', status = 'active', aMedida = false } = {}) => ({
  id: `id-${slug}`, slug, name: slug, status, created_at: `${fecha}T12:00:00Z`,
  lead_time_weeks_min: stock ? 0 : 2, lead_time_weeks_max: stock ? 0 : 4, is_custom_only: aMedida,
  category: cat ? { slug: cat } : undefined,
})

// Como el catálogo real al 04/11/2026, en orden de la tienda (sort_order): las
// 4 más nuevas están en stock, y hay otras 3 en stock más viejas.
const REAL = [
  prenda('bolso-margot-butter', { fecha: '2026-10-24', stock: true, cat: 'accesorios' }),
  prenda('bolso-margot-cherry', { fecha: '2026-10-24', stock: true, cat: 'accesorios' }),
  prenda('poncho-ete', { fecha: '2026-10-24', stock: true }),
  prenda('manguitas-tramonto', { fecha: '2026-10-23', stock: true }),
  prenda('pulseras-terra', { fecha: '2026-11-03', stock: true, cat: 'accesorios' }),
  prenda('top-margarita', { fecha: '2026-10-15' }),
  prenda('sweater-net', { fecha: '2026-10-21', cat: 'sweaters' }),
  prenda('mini-bufandas', { fecha: '2026-06-06', stock: true, cat: 'accesorios' }),
  prenda('bandana', { fecha: '2026-06-01', cat: 'accesorios' }),
  prenda('bolso-a-cuadros', { fecha: '2026-06-01', cat: 'accesorios' }),
  prenda('box-de-regalo', { fecha: '2026-06-06', stock: true, cat: null }),
  prenda('tote-bag-de-playa', { fecha: '2026-06-01', cat: 'accesorios' }),
  prenda('mini-tote-bag', { fecha: '2026-06-01', cat: 'accesorios' }),
  prenda('bolso-lola', { fecha: '2026-06-01', cat: 'accesorios' }),
]
const slugs = (lista) => lista.map((p) => p.slug)

test('ninguna prenda se repite entre secciones y cada una tiene como mucho 4', () => {
  const s = armarSeccionesHome(REAL)
  const todas = [...s.nuevo, ...s.enStock, ...s.accesorios].map((p) => p.id)
  assert.equal(new Set(todas).size, todas.length)
  for (const seccion of [s.nuevo, s.enStock, s.accesorios]) assert.ok(seccion.length <= 4)
})

test('con los datos reales: las 4 nuevas en stock van a "Nuevo" y "En stock" recibe las otras en stock', () => {
  const s = armarSeccionesHome(REAL)
  assert.deepEqual(slugs(s.nuevo), ['pulseras-terra', 'bolso-margot-butter', 'bolso-margot-cherry', 'poncho-ete'])
  // En el orden de la tienda, sin las que ya salieron arriba.
  assert.deepEqual(slugs(s.enStock), ['manguitas-tramonto', 'mini-bufandas', 'box-de-regalo'])
  assert.deepEqual(slugs(s.accesorios), ['bandana', 'bolso-a-cuadros', 'tote-bag-de-playa', 'mini-tote-bag'])
})

test('una sección que queda con 1 sola prenda sale vacía y esa prenda queda libre', () => {
  const s = armarSeccionesHome([
    prenda('a', { fecha: '2026-10-05' }),
    prenda('b', { fecha: '2026-10-04' }),
    prenda('c', { fecha: '2026-10-03' }),
    prenda('d', { fecha: '2026-10-02' }),
    // La única en stock que no entra en "Nuevo", y además es un accesorio.
    prenda('e', { fecha: '2026-10-01', stock: true, cat: 'accesorios' }),
    prenda('f', { fecha: '2026-09-01', cat: 'accesorios' }),
  ])
  assert.deepEqual(slugs(s.enStock), [])
  // Como "En stock" no la tomó, puede salir en "Accesorios".
  assert.deepEqual(slugs(s.accesorios), ['e', 'f'])
})

test('"Nuevo" se muestra aunque haya una sola prenda; nada que no esté activa', () => {
  assert.deepEqual(slugs(armarSeccionesHome([prenda('unica')]).nuevo), ['unica'])
  const s = armarSeccionesHome([
    prenda('agotada', { fecha: '2026-11-01', status: 'soldout', stock: true }),
    prenda('x', { fecha: '2026-10-01' }),
    prenda('y', { fecha: '2026-09-01' }),
  ])
  assert.deepEqual(slugs(s.nuevo), ['x', 'y'])
  assert.deepEqual(s.enStock, [])
})

test('destinoPortada: rutas del sitio, links completos del propio dominio y lo demás a /tienda', () => {
  assert.equal(destinoPortada('/colecciones/sunset-26'), '/colecciones/sunset-26')
  assert.equal(destinoPortada(' https://dahila.uy/colecciones/sunset-26 '), '/colecciones/sunset-26')
  assert.equal(destinoPortada('https://www.dahila.uy/tienda?ya=1'), '/tienda?ya=1')
  assert.equal(destinoPortada('https://preview--dahila.netlify.app/regalo', 'https://preview--dahila.netlify.app'), '/regalo')
  assert.equal(destinoPortada('https://instagram.com/dahila.crochet'), '/tienda')
  assert.equal(destinoPortada('//otro.com/x'), '/tienda')
  assert.equal(destinoPortada('colecciones/sunset-26'), '/tienda')
  assert.equal(destinoPortada(undefined), '/tienda')
})

test('el bloque del drop se oculta en el celular solo si ya abrió y la portada lleva a su colección', () => {
  const col = '/colecciones/sunset-26'
  assert.equal(varianteDropArriba({ dropLive: true, heroHref: col, dropCollectionHref: col }), 'ocultar-movil')
  assert.equal(varianteDropArriba({ dropLive: true, heroHref: `${col}/?utm_source=ig`, dropCollectionHref: col }), 'ocultar-movil')
  assert.equal(varianteDropArriba({ dropLive: false, heroHref: col, dropCollectionHref: col }), 'compacto-movil')
  assert.equal(varianteDropArriba({ dropLive: true, heroHref: '/tienda', dropCollectionHref: col }), 'compacto-movil')
  assert.equal(varianteDropArriba({ dropLive: true, heroHref: '/tienda', dropCollectionHref: null }), 'compacto-movil')
  assert.equal(mismaRuta('/', '/'), true)
  assert.equal(mismaRuta('/tienda', null), false)
})
