// src/lib/drop-date.ts: el aviso del drop a la lista sale una sola vez (QA-13).
// lista-drop.ts importa 'server-only'; la regla vive en drop-date.ts y la usa tal cual.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { dropSentKey, avisoYaEnviado, parseDropDateUY } from '@/lib/drop-date'

const LAUNCH = parseDropDateUY('2026-10-28 19:00')
const AHORA = Date.parse('2026-10-28T12:00:00Z')
const DROP = { name: 'Sunset ‘26', rawDate: '2026-10-28 19:00', slug: 'sunset-26', launch: LAUNCH, now: AHORA }

test('la clave es la colección y el instante del lanzamiento', () => {
  assert.equal(dropSentKey('sunset-26', LAUNCH), 'sunset-26|2026-10-28T22:00:00.000Z')
  assert.equal(dropSentKey('', LAUNCH), 'tienda|2026-10-28T22:00:00.000Z')
  // Misma hora escrita de otra forma: mismo drop, misma clave.
  assert.equal(dropSentKey('sunset-26', parseDropDateUY('28/10/2026 19hs')), dropSentKey('sunset-26', LAUNCH))
})

test('la clave no cambia si solo cambia el nombre: corregirlo no reenvía el aviso', () => {
  const enviado = dropSentKey('sunset-26', LAUNCH)
  assert.equal(avisoYaEnviado({ ...DROP, enviado, enviadoAt: null }), true)
  assert.equal(avisoYaEnviado({ ...DROP, name: "Sunset '26", enviado, enviadoAt: null }), true)
})

test('la clave legada «Sunset ‘26|2026-10-28 19:00» sigue contando como enviada', () => {
  assert.equal(avisoYaEnviado({ ...DROP, enviado: 'Sunset ‘26|2026-10-28 19:00', enviadoAt: null }), true)
  // Aunque después del despliegue se corrija el nombre: la vieja cuenta por la fecha.
  assert.equal(avisoYaEnviado({ ...DROP, name: "Sunset '26", enviado: 'Sunset ‘26|2026-10-28 19:00', enviadoAt: null }), true)
})

test('cambiar la fecha arma un envío nuevo (por eso Configuración pregunta antes)', () => {
  const otraFecha = { ...DROP, rawDate: '2026-10-29 19:00', launch: parseDropDateUY('2026-10-29 19:00') }
  assert.equal(avisoYaEnviado({ ...otraFecha, enviado: dropSentKey('sunset-26', LAUNCH), enviadoAt: null }), false)
  assert.equal(avisoYaEnviado({ ...otraFecha, enviado: 'Sunset ‘26|2026-10-28 19:00', enviadoAt: null }), false)
})

test('un aviso que salió hace menos de 12 h bloquea otro aunque la clave cambie', () => {
  const otraFecha = { ...DROP, rawDate: '2026-10-28 21:00', launch: parseDropDateUY('2026-10-28 21:00') }
  const enviado = dropSentKey('sunset-26', LAUNCH)
  assert.equal(avisoYaEnviado({ ...otraFecha, enviado, enviadoAt: new Date(AHORA - 3 * 3_600_000).toISOString() }), true)
  assert.equal(avisoYaEnviado({ ...otraFecha, enviado, enviadoAt: new Date(AHORA - 13 * 3_600_000).toISOString() }), false)
  assert.equal(avisoYaEnviado({ ...otraFecha, enviado, enviadoAt: 'cualquier cosa' }), false)
})

test('sin drop configurado no hay nada enviado', () => {
  assert.equal(avisoYaEnviado({ ...DROP, name: '', enviado: dropSentKey('sunset-26', LAUNCH), enviadoAt: null }), false)
  assert.equal(avisoYaEnviado({ ...DROP, enviado: '', enviadoAt: null }), false)
})
