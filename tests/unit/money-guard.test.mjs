// src/lib/parse-money.ts: el precio que conviene confirmar antes de publicarlo (QA-02).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { precioSospechoso, saltoDePrecio, confirmacionDePrecios } from '@/lib/parse-money'

test('precioSospechoso: bajar de 1.890 a 2 pregunta, con los dos montos', () => {
  const texto = precioSospechoso(1890, 2)
  assert.equal(typeof texto, 'string')
  assert.equal(texto, '¿Seguro? Pasa de UYU 1.890 a UYU 2')
})

test('precioSospechoso: un ajuste normal no pregunta', () => {
  assert.equal(precioSospechoso(1890, 1990), null)
  assert.equal(precioSospechoso(1890, 1890), null) // sin cambio
  assert.equal(precioSospechoso(1890, 945), null) // la mitad justa: rebaja fuerte pero posible
  assert.equal(precioSospechoso(null, 2500), null) // prenda nueva con un precio normal
  assert.equal(precioSospechoso(1890, null), null) // talle que vuelve al precio base
})

test('precioSospechoso: sin precio anterior, menos de UYU 100 pregunta', () => {
  assert.equal(typeof precioSospechoso(null, 50), 'string')
  assert.equal(precioSospechoso(null, 50), '¿Seguro? Queda en UYU 50')
  assert.equal(precioSospechoso(0, 0), null) // "sin precio" que sigue igual
})

test('precioSospechoso: un cero de más o de menos también pregunta', () => {
  assert.equal(precioSospechoso(1890, 18900), '¿Seguro? Pasa de UYU 1.890 a UYU 18.900')
  assert.equal(precioSospechoso(1890, 189), '¿Seguro? Pasa de UYU 1.890 a UYU 189')
  assert.equal(saltoDePrecio(1890, 2), 'pasa de UYU 1.890 a UYU 2')
})

test('confirmacionDePrecios: una sola pregunta aunque haya varios talles raros', () => {
  assert.equal(confirmacionDePrecios([{ etiqueta: 'precio base', antes: 1890, despues: 1990 }]), null)
  assert.equal(
    confirmacionDePrecios([{ etiqueta: 'precio base', antes: 1890, despues: 2 }]),
    '¿Seguro? Pasa de UYU 1.890 a UYU 2 (precio base).',
  )
  const varias = confirmacionDePrecios([
    { etiqueta: 'talle S', antes: 1890, despues: 2 },
    { etiqueta: 'talle M', antes: 1890, despues: 1990 },
    { etiqueta: 'talle L', antes: 1890, despues: 2 },
  ])
  assert.equal(varias, '¿Seguro? Revisá estos precios:\n\n• talle S: pasa de UYU 1.890 a UYU 2\n• talle L: pasa de UYU 1.890 a UYU 2')
})
