// src/lib/search-intent.ts: buscar "en stock", "ya tejido" o "disponible" pide
// lo que ya está tejido (CRO-20); una búsqueda de prenda sigue siendo eso.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { esBusquedaDeStock } from '@/lib/search-intent'

test('las frases de "lo que está en stock" dan true', () => {
  for (const q of ['en stock', 'stock', 'ya tejido', 'ya tejidas', 'disponible', 'Disponibles', 'entrega inmediata', 'sin espera', 'para ya']) {
    assert.equal(esBusquedaDeStock(q), true, q)
  }
})

test('sin tildes, con signos o espacios de más también', () => {
  assert.equal(esBusquedaDeStock('  En   STOCK '), true)
  assert.equal(esBusquedaDeStock('¿en stock?'), true)
  assert.equal(esBusquedaDeStock('entrega inmediáta'), true)
})

test('una búsqueda de prenda no es de stock, aunque nombre la palabra', () => {
  for (const q of ['cardigan', 'cardigan disponible', 'stock de bolsos', 'ya', '', 'poncho']) {
    assert.equal(esBusquedaDeStock(q), false, q)
  }
})
