// src/lib/parse-money.ts: lo que tipea una persona en Uruguay (QA-03).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseMoneyUYU, parseDecimal, parsePercent, parseCount } from '@/lib/parse-money'

test('parseMoneyUYU: miles con punto o coma, con o sin moneda', () => {
  for (const s of ['1.600', '1,600', '$ 1.600', 'UYU 1.600', '1600', ' 1 600 ', '$U 1.600', '1600 pesos'])
    assert.equal(parseMoneyUYU(s), 1600, JSON.stringify(s))
  assert.equal(parseMoneyUYU('$U 2.000'), 2000)
  assert.equal(parseMoneyUYU('UYU 1.890'), 1890)
  assert.equal(parseMoneyUYU('1.600.000'), 1600000)
  assert.equal(parseMoneyUYU('16.000'), 16000)
  assert.equal(parseMoneyUYU('0'), 0)
})

test('parseMoneyUYU: centavos en cero se aceptan, distintos de cero no', () => {
  assert.equal(parseMoneyUYU('1.600,00'), 1600)
  assert.equal(parseMoneyUYU('1.600,50'), null)
  assert.equal(parseMoneyUYU('1600,5'), null)
  assert.equal(parseMoneyUYU('1600.5'), null)
})

test('parseMoneyUYU: rechaza en vez de inventar', () => {
  for (const s of ['', '   ', 'abc', '2 de 4', '1e3', '-1600', 'U$S 100', '100 USD', '50 dólares', '1.6.00', '1.600,5,0', ',', '.'])
    assert.equal(parseMoneyUYU(s), null, JSON.stringify(s))
  assert.equal(parseMoneyUYU(null), null)
  assert.equal(parseMoneyUYU(undefined), null)
})

test('parseMoneyUYU: acepta number y respeta el tope', () => {
  assert.equal(parseMoneyUYU(1600), 1600)
  assert.equal(parseMoneyUYU(1600.5), null)
  assert.equal(parseMoneyUYU('20.000.000'), null)
  assert.equal(parseMoneyUYU('20.000.000', { max: 1e9 }), 20000000)
})

test('parseDecimal: horas y margen con coma', () => {
  assert.equal(parseDecimal('12,5'), 12.5)
  assert.equal(parseDecimal('0.600'), 0.6) // "0.600" no son 600 horas
  assert.equal(parseDecimal('1,5'), 1.5)
  assert.equal(parseDecimal('1.600,50'), 1600.5)
  assert.equal(parseDecimal('1,600.50'), 1600.5)
  assert.equal(parseDecimal('1e3'), null)
})

test('parsePercent: 0 a 90', () => {
  assert.equal(parsePercent('15'), 15)
  assert.equal(parsePercent('15%'), 15)
  assert.equal(parsePercent('12,5'), 13)
  assert.equal(parsePercent('95'), null)
  assert.equal(parsePercent('-5'), null)
})

test('parseCount: entero limpio de 0 a 9999', () => {
  assert.equal(parseCount('4'), 4)
  assert.equal(parseCount(' 0 '), 0)
  assert.equal(parseCount('2 de 4'), null) // hoy se leía 24
  assert.equal(parseCount('3/4'), null)
  assert.equal(parseCount('1.000'), null)
  assert.equal(parseCount('10000'), null)
  assert.equal(parseCount(7), 7)
})
