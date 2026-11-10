// src/lib/envio.ts: la línea de envío se arma con los montos de Configuración,
// y sin montos vuelve el texto libre. Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lineaEnvio } from '@/lib/envio'

test('sin montos devuelve null (se usa la línea corta de siempre)', () => {
  assert.equal(lineaEnvio({}), null)
  assert.equal(lineaEnvio({ envio_montevideo: '', envio_interior: '  ' }), null)
  assert.equal(lineaEnvio({ envio_montevideo: '0' }), null)
  assert.equal(lineaEnvio({ envio_retiro: 'Pocitos' }), null)
})

test('con los dos montos, los muestra con el formato de precio de la tienda', () => {
  const l = lineaEnvio({ envio_montevideo: '200', envio_interior: '$ 1.300' })
  assert.match(l, /^Envío: Montevideo UYU 200 · interior UYU 1\.300$/)
})

test('con un solo monto, el otro queda a coordinar', () => {
  assert.match(lineaEnvio({ envio_montevideo: '200' }), /Montevideo UYU 200 · interior a coordinar/)
  assert.match(lineaEnvio({ envio_interior: '300' }), /interior UYU 300 · Montevideo a coordinar/)
})

test('el retiro se suma solo si hay algún monto', () => {
  assert.match(lineaEnvio({ envio_montevideo: '200', envio_interior: '300', envio_retiro: 'Pocitos' }), / · o retiro en Pocitos$/)
})
