// src/lib/product-selection.ts: resolverSeleccion (VIS-01). Con dos o más
// talles disponibles nadie elige por la clienta; ?talle= y el talle recordado
// siguen contando como elegidos. Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { resolverSeleccion } from '@/lib/product-selection'

const PONCHO = [
  { size: 'XS/S', available: true, sort_order: 1 },
  { size: 'M/L', available: true, sort_order: 2 },
]
const sel = (sizes, o = {}) => resolverSeleccion({ sizes, chosen: null, urlSize: null, remembered: null, ...o })

test('2 disponibles sin elección: nada elegido y hay que elegir', () => {
  const r = sel(PONCHO)
  assert.equal(r.elegido, null)
  assert.equal(r.necesitaElegir, true)
  assert.equal(r.talleConfirmed, false)
  assert.equal(r.disponibles.length, 2)
  // El talle de trabajo sigue siendo el primero disponible (precio, stock).
  assert.equal(r.talle, 'XS/S')
})

test('con ?talle= o con el recordado, ese queda elegido', () => {
  const url = sel(PONCHO, { urlSize: 'M/L' })
  assert.equal(url.elegido, 'M/L')
  assert.equal(url.necesitaElegir, false)
  const recordado = sel(PONCHO, { remembered: 'M/L' })
  assert.equal(recordado.elegido, 'M/L')
  assert.equal(recordado.necesitaElegir, false)
  // La URL manda sobre el recordado; lo que toca la clienta, sobre los dos.
  assert.equal(sel(PONCHO, { urlSize: 'XS/S', remembered: 'M/L' }).elegido, 'XS/S')
  assert.equal(sel(PONCHO, { urlSize: 'XS/S', remembered: 'M/L', chosen: 'M/L' }).elegido, 'M/L')
})

test('un recordado que la prenda no tiene (o agotado) no cuenta; un ?talle= agotado sí', () => {
  assert.equal(sel(PONCHO, { remembered: 'M' }).elegido, null)
  const agotado = [{ size: 'S', available: false, sort_order: 1 }, ...PONCHO]
  assert.equal(sel(agotado, { remembered: 'S' }).elegido, null)
  // La ficha tiene que mostrar ESA variante (con su aviso de agotado).
  assert.equal(sel(agotado, { urlSize: 'S' }).elegido, 'S')
  assert.equal(sel(agotado, { urlSize: 'XL' }).elegido, null)
})

test('con una sola disponible, queda elegida sola', () => {
  const r = sel([
    { size: 'S', available: false, sort_order: 1 },
    { size: 'M', available: true, sort_order: 2 },
    { size: 'L', available: false, sort_order: 3 },
  ])
  assert.equal(r.elegido, 'M')
  assert.equal(r.necesitaElegir, false)
  assert.equal(sel([{ size: 'Talle único', available: true, sort_order: 1 }]).elegido, 'Talle único')
})

test('sin filas de talle: "Único", sin nada que elegir', () => {
  const r = sel([])
  assert.equal(r.talle, 'Único')
  assert.equal(r.necesitaElegir, false)
  assert.equal(r.elegido, null)
})

test('el orden lo pone sort_order, no el orden en que llegan las filas', () => {
  const r = sel([
    { size: 'L', available: true, sort_order: 3 },
    { size: 'S', available: true, sort_order: 1 },
    { size: 'M', available: true, sort_order: 2 },
  ])
  assert.equal(r.talle, 'S')
  assert.deepEqual(r.disponibles.map((s) => s.size), ['S', 'M', 'L'])
})
