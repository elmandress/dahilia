// src/app/admin/productos/lote.ts: qué manda "Guardar cambios" en precios en lote (QA-02, QA-10).
// Casos de QA/17-lote-precios.test.mjs, invertidos: ahora tienen que salir bien.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { armarCambiosLote, leerCelda, preciosNuevos } from '@/app/admin/productos/lote'
import { confirmacionDePrecios } from '@/lib/parse-money'

const CARGADA = { base_price_uyu: 1250, sizes: [{ size: 'S', price_uyu: 1200 }, { size: 'M', price_uyu: 1350 }, { size: 'L', price_uyu: null }] }

test('QA/17: tocar solo el talle M no manda base_price_uyu (no pisa el 1400 de la ficha)', () => {
  const c = armarCambiosLote(CARGADA, { sizes: { M: '1450' } })
  assert.equal(c.producto, undefined)
  assert.ok(!('producto' in c))
  assert.deepEqual(c.talles, [{ size: 'M', price_uyu: 1450, esperado: 1350 }])
  assert.deepEqual(c.invalidos, [])
})

test('QA/17: "1.600" en la celda del base se guarda como 1600, no como UYU 1', () => {
  const c = armarCambiosLote({ base_price_uyu: 1560, sizes: [] }, { base: '1.600' })
  assert.deepEqual(c.producto, { base_price_uyu: 1600 })
})

test('cada talle lleva su precio esperado; null si usaba el base', () => {
  const c = armarCambiosLote(CARGADA, { sizes: { S: '1.300', L: '1500' } })
  assert.deepEqual(c.talles, [
    { size: 'S', price_uyu: 1300, esperado: 1200 },
    { size: 'L', price_uyu: 1500, esperado: null },
  ])
})

test('lo que no se entiende frena la prenda en vez de inventar un precio', () => {
  const c = armarCambiosLote(CARGADA, { base: '1.600,50', sizes: { M: '2 de 4' } })
  assert.deepEqual(c.invalidos, ['precio base', 'talle M'])
  assert.equal(c.producto, undefined)
  assert.deepEqual(c.talles, [])
})

test('la misma plata escrita distinto no escribe nada', () => {
  const c = armarCambiosLote(CARGADA, { base: '1.250', sizes: { S: '$ 1.200' } })
  assert.deepEqual(c, { talles: [], invalidos: [] })
})

test('vacío o 0 = sin precio propio, como siempre en esta tabla', () => {
  assert.equal(leerCelda(''), null)
  assert.equal(leerCelda('0'), null)
  assert.equal(leerCelda('1.600'), 1600)
  assert.equal(leerCelda('1600,5'), undefined)
  const c = armarCambiosLote(CARGADA, { sizes: { S: '' } })
  assert.deepEqual(c.talles, [{ size: 'S', price_uyu: null, esperado: 1200 }])
})

test('borradores por nombre de talle: un talle que ya no existe no se manda', () => {
  const c = armarCambiosLote(CARGADA, { sizes: { XL: '3000' } })
  assert.deepEqual(c.talles, [])
})

test('un solo confirm con los precios raros, y el "antes" del talle sin precio es el base', () => {
  const c = armarCambiosLote(CARGADA, { base: '12', sizes: { L: '13', M: '1400' } })
  const nuevos = preciosNuevos(CARGADA, c)
  assert.deepEqual(nuevos, [
    { etiqueta: 'precio base', antes: 1250, despues: 12 },
    { etiqueta: 'talle M', antes: 1350, despues: 1400 },
    { etiqueta: 'talle L', antes: 1250, despues: 13 },
  ])
  assert.equal(
    confirmacionDePrecios(nuevos),
    '¿Seguro? Revisá estos precios:\n\n• precio base: pasa de UYU 1.250 a UYU 12\n• talle L: pasa de UYU 1.250 a UYU 13',
  )
})
