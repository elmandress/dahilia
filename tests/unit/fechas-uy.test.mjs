// src/lib/drop-date.ts: días enteros en hora de Montevideo para los cupones (QA-16).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { inicioDiaUY, finDiaUY } from '@/lib/drop-date'

test('el 7 de noviembre de Montevideo, en UTC', () => {
  assert.equal(inicioDiaUY('2026-11-07'), '2026-11-07T03:00:00.000Z')
  assert.equal(finDiaUY('2026-11-07'), '2026-11-08T02:59:59.000Z')
})

test('lo que no es una fecha del input da null, sin tirar error', () => {
  for (const s of ['', '07/11/2026', '2026-11-7', 'mañana', '2026-13-40']) {
    assert.equal(inicioDiaUY(s), null, JSON.stringify(s))
    assert.equal(finDiaUY(s), null, JSON.stringify(s))
  }
})

test('el resultado no depende de la zona horaria del proceso (la del navegador)', () => {
  const original = process.env.TZ
  const viejo = []
  try {
    for (const tz of ['America/Montevideo', 'UTC', 'Europe/Madrid', 'America/Los_Angeles', 'Asia/Tokyo']) {
      process.env.TZ = tz
      assert.equal(inicioDiaUY('2026-11-07'), '2026-11-07T03:00:00.000Z', tz)
      assert.equal(finDiaUY('2026-11-07'), '2026-11-08T02:59:59.000Z', tz)
      // Control: así se guardaba antes (hora local del navegador).
      viejo.push(new Date('2026-11-07T00:00:00').toISOString())
    }
  } finally {
    if (original === undefined) delete process.env.TZ
    else process.env.TZ = original
  }
  assert.ok(new Set(viejo).size > 1, `la forma vieja tendría que cambiar con la zona: ${viejo.join(', ')}`)
})

// descuentoHastaTexto: «hasta el sáb 7/11» al lado del precio tachado, en hora de Montevideo.
import { descuentoHastaTexto } from '@/lib/drop-date'
import { resolveDiscountEndsAt } from '@/lib/types'

test('el fin del descuento se dice con día de la semana y fecha de Montevideo', () => {
  // finDiaUY('2026-11-07') = 23:59:59 del sábado en Uruguay, ya domingo en UTC.
  assert.equal(descuentoHastaTexto('2026-11-08T02:59:59.000Z'), 'hasta el sáb 7/11')
  assert.equal(descuentoHastaTexto('2026-11-11T12:00:00.000Z'), 'hasta el mié 11/11')
})

test('sin fecha o con fecha ilegible no se muestra nada', () => {
  for (const v of [null, undefined, '', 'mañana']) assert.equal(descuentoHastaTexto(v), null, String(v))
})

test('solo cuenta el ends_at del descuento que gana, nunca el de otro', () => {
  const futuro = new Date(Date.now() + 86400000).toISOString()
  const base = { id: 'd', active: true, starts_at: null, scope: 'all', category_id: null, ends_at: futuro }
  const prod = (pct) => ({ category_id: 'c1', discount_active: pct > 0, discount_percent: pct })
  assert.equal(resolveDiscountEndsAt(prod(0), [{ ...base, percent: 15 }]), futuro)
  assert.equal(resolveDiscountEndsAt(prod(20), [{ ...base, percent: 15 }]), null)
  assert.equal(resolveDiscountEndsAt(prod(0), [{ ...base, percent: 15, ends_at: null }]), null)
  assert.equal(resolveDiscountEndsAt(prod(0), []), null)
})
