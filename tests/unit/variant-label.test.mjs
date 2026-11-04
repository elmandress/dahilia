// src/lib/types.ts: isSizeLike y variantLabel (VIS-M4, QA-18). Pulseras Terra
// tiene Lisas / Con lurex / Con caracolas: eso es un modelo, no un talle.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSizeLike, variantLabel } from '@/lib/types'
import { buildWhatsAppMessage } from '@/lib/whatsapp-checkout'

const filas = (...labels) => labels.map((size, i) => ({ size, available: true, sort_order: i + 1 }))

test('isSizeLike: talles con letras, con barra, números y "Único"', () => {
  for (const t of ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'xs/s', 'XS/S', 'M/L', 'S / M', 'L/XL', '38', '2', 'Único', 'Talle único', 'unico']) {
    assert.equal(isSizeLike(t), true, t)
  }
})

test('isSizeLike: lo que no es talle', () => {
  for (const t of ['Lisas', 'Con lurex', 'Con caracolas', 'Rojo', '100', 'XXXXL', 'M/', '', null, undefined]) {
    assert.equal(isSizeLike(t), false, String(t))
  }
})

test('variantLabel: "Modelo" para Pulseras Terra, "Talle" para S/M/L', () => {
  assert.equal(variantLabel(filas('Lisas', 'Con lurex', 'Con caracolas')), 'Modelo')
  assert.equal(variantLabel(filas('S', 'M', 'L')), 'Talle')
  assert.equal(variantLabel(filas('XS/S', 'M/L')), 'Talle')
  assert.equal(variantLabel(filas('Talle único')), 'Talle')
})

test('variantLabel: sin filas es "Talle"; con una sola que no es talle, "Modelo"', () => {
  assert.equal(variantLabel([]), 'Talle')
  assert.equal(variantLabel(undefined), 'Talle')
  assert.equal(variantLabel(filas('S', 'Con caracolas')), 'Modelo')
})

test('el mensaje de WhatsApp dice "Modelo: Lisas" en las pulseras y "Talle: M" en un top', () => {
  const P = (o) => ({
    id: 'p', status: 'active', is_custom_only: false, discount_active: false, discount_percent: 0,
    category_id: null, collection_id: null, lead_time_weeks_min: 0, lead_time_weeks_max: 0, ...o,
  })
  const pulseras = P({ slug: 'pulseras-terra', name: 'Pulseras Terra', base_price_uyu: 300, sizes: filas('Lisas', 'Con lurex', 'Con caracolas') })
  const top = P({ slug: 'top-julieta', name: 'Top Julieta', base_price_uyu: 2300, sizes: filas('S', 'M', 'L') })
  const msg = buildWhatsAppMessage(
    [{ size: 'Lisas', qty: 1, product: pulseras }, { size: 'M', qty: 1, product: top }],
    [], 2600, { siteUrl: 'https://dahila.uy' }
  )
  assert.match(msg, /• Modelo: Lisas/)
  assert.doesNotMatch(msg, /Talle: Lisas/)
  assert.match(msg, /• Talle: M\n/)
})
