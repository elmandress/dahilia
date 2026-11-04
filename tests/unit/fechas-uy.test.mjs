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
