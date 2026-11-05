// src/lib/seo-copy.ts: lo que promete una ficha en el title, la descripción,
// la tarjeta OG y Pinterest (SEO-03). Una pieza ya tejida no se hace "a tu
// medida" ni "en tus colores", y una de talle único no va "en tu talle".
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { promesaFicha, textoTarjetaOG } from '@/lib/seo-copy'

const P = (o) => ({
  id: 'p', slug: 'x', name: 'X', description: null, status: 'active', is_custom_only: false,
  discount_active: false, discount_percent: 0, category_id: null, collection_id: null,
  lead_time_weeks_min: 2, lead_time_weeks_max: 3, base_price_uyu: 1000, sizes: [], ...o,
})
const filas = (...labels) => labels.map((size, i) => ({ size, available: true, sort_order: i + 1, price_uyu: null }))
const cat = (slug, name) => ({ id: `cat-${slug}`, slug, name })

// Las 7 piezas en stock del drop: con talles, sin talles y con "Talle único".
const ponchoEnStock = P({ slug: 'poncho-ete', name: 'Poncho Eté', lead_time_weeks_min: 0, sizes: filas('XS/S', 'M/L'), category: cat('tops', 'Tops') })
const bolsoEnStock = P({ slug: 'bolso-margot-butter', name: 'Bolso Margot Butter', lead_time_weeks_min: 0, category: cat('accesorios', 'Accesorios') })
const manguitasEnStock = P({ slug: 'manguitas-tramonto', name: 'Manguitas Tramonto', lead_time_weeks_min: 0, sizes: filas('Talle único'), category: cat('tops', 'Tops') })
const pulserasEnStock = P({ slug: 'pulseras-terra', name: 'Pulseras Terra', lead_time_weeks_min: 0, sizes: filas('Lisas', 'Con lurex', 'Con caracolas'), category: cat('accesorios', 'Accesorios') })
// A pedido.
const spring = P({ slug: 'spring-cardigan', name: 'Spring cardigan', sizes: filas('S', 'M', 'L'), category: cat('cardigans', 'Cardigans') })
const sweaterNet = P({ slug: 'sweater-net', name: 'Sweater net', sizes: filas('Único'), category: cat('sweaters', 'Sweaters') })
const bolsoLola = P({ slug: 'bolso-lola', name: 'Bolso Lola', category: cat('accesorios', 'Accesorios') })
const pulserasAPedido = P({ ...pulserasEnStock, lead_time_weeks_min: 1 })

test('pieza en stock: sin "a tu medida" ni "en tus colores"; "En stock" solo en la descripción', () => {
  for (const p of [ponchoEnStock, bolsoEnStock, manguitasEnStock, pulserasEnStock]) {
    const { titulo, linea } = promesaFicha(p)
    assert.doesNotMatch(titulo, /a tu medida/i, p.slug)
    assert.doesNotMatch(linea, /en tus colores|en tu talle/i, p.slug)
    assert.doesNotMatch(titulo, /stock/i, `${p.slug}: el estado de stock no va en el title`)
    assert.equal(titulo, 'tejido a mano en Uruguay', p.slug)
    assert.equal(linea, 'Tejido a mano en Montevideo. En stock: sale sin espera. Envío a todo Uruguay.', p.slug)
  }
})

test('talle único: nunca "en tu talle" ni "a tu medida"', () => {
  for (const p of [sweaterNet, manguitasEnStock]) {
    assert.doesNotMatch(promesaFicha(p).linea, /en tu talle/i, p.slug)
    assert.doesNotMatch(promesaFicha(p).titulo, /a tu medida/i, p.slug)
  }
  // A pedido: se puede pedir en otros colores. Con la palabra uruguaya.
  assert.deepEqual(promesaFicha(sweaterNet), {
    titulo: 'buzo tejido a mano en Uruguay',
    linea: 'Tejido a mano en Montevideo, en tus colores. Envío a todo Uruguay.',
  })
})

test('a pedido con talles reales: "a tu medida" y "en tu talle y en tus colores"', () => {
  assert.deepEqual(promesaFicha(spring), {
    titulo: 'saco tejido a mano, a tu medida',
    linea: 'Tejido a mano en Montevideo, en tu talle y en tus colores. Envío a todo Uruguay.',
  })
  // Sin categoría con palabra uruguaya, sin término.
  assert.equal(promesaFicha(P({ sizes: filas('S', 'M') })).titulo, 'tejido a mano, a tu medida')
})

test('a pedido sin talles o con modelos: "en tus colores", sin "a tu medida"', () => {
  for (const p of [bolsoLola, pulserasAPedido]) {
    const { titulo, linea } = promesaFicha(p)
    assert.equal(titulo, 'tejido a mano en Uruguay', p.slug)
    assert.equal(linea, 'Tejido a mano en Montevideo, en tus colores. Envío a todo Uruguay.', p.slug)
  }
})

test('un encargo a medida (is_custom_only) con talles promete "a tu medida", aunque el plazo diga 0', () => {
  assert.equal(promesaFicha(P({ is_custom_only: true, lead_time_weeks_min: 0, sizes: filas('S', 'M') })).titulo, 'tejido a mano, a tu medida')
})

test('textoTarjetaOG: "A tu talle" solo en piezas a pedido con talles reales', () => {
  assert.equal(textoTarjetaOG(bolsoLola), 'Tejido a mano en Uruguay · En tus colores')
  assert.doesNotMatch(textoTarjetaOG(bolsoLola), /A tu talle/)
  assert.equal(textoTarjetaOG(sweaterNet), 'Tejido a mano en Uruguay · En tus colores')
  assert.equal(textoTarjetaOG(pulserasAPedido), 'Tejido a mano en Uruguay · En tus colores')
  assert.equal(textoTarjetaOG(spring), 'Tejido a mano en Uruguay · A tu talle y en tus colores')
  // En stock: solo lo que vale siempre (la imagen queda guardada en las vistas previas).
  for (const p of [ponchoEnStock, bolsoEnStock, manguitasEnStock]) assert.equal(textoTarjetaOG(p), 'Tejido a mano en Uruguay', p.slug)
})
