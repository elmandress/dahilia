// src/lib/settings-diff.ts: qué guardar en Configuración y si otra pantalla lo pisó (QA-09, QA-ARQ-1).
// Mismo escenario de QA/09-config-multipestana.test.mjs, con una tabla en memoria
// que se comporta como el upsert de PostgREST (last-write-wins, sin trigger).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cambiosPendientes, conflictos } from '@/lib/settings-diff'

function base(inicial) {
  const rows = new Map(Object.entries(inicial).map(([k, v]) => [k, { key: k, value: v, updated_at: '2026-11-01T00:00:00Z' }]))
  return {
    leer: () => Object.fromEntries([...rows.values()].map((r) => [r.key, r.value])),
    // Como estrategia/page.tsx hasta hoy: sin updated_at, la fecha queda vieja.
    upsert: (key, value, updated_at) => rows.set(key, { key, value, updated_at: updated_at ?? rows.get(key)?.updated_at ?? null }),
    borrar: (key) => rows.delete(key),
    fila: (key) => rows.get(key),
  }
}

const INICIAL = {
  promo_bar_text: 'Sunset ‘26 en stock',
  free_shipping_threshold: '4500',
  estrategia_progress: '{}',
  hero_title: 'Tejido a mano',
}

test('solo cambia la clave tocada', () => {
  const antes = { ...INICIAL }
  const ahora = { ...INICIAL, promo_bar_text: 'Envío gratis desde UYU 4.500' }
  assert.deepEqual(cambiosPendientes(antes, ahora), ['promo_bar_text'])
  assert.deepEqual(cambiosPendientes(antes, { ...INICIAL }), [])
})

test('una clave que no existía y se escribe por primera vez cuenta como cambio', () => {
  assert.deepEqual(cambiosPendientes(INICIAL, { ...INICIAL, hero_cta_href: '/colecciones/sunset-26' }), ['hero_cta_href'])
})

test('tocar un campo que no existía y dejarlo vacío no es un cambio (QA/09: quedaba "con cambios" para siempre)', () => {
  assert.deepEqual(cambiosPendientes(INICIAL, { ...INICIAL, hero_cta_href: '' }), [])
  // Vaciar uno que sí tenía valor sí lo es.
  assert.deepEqual(cambiosPendientes(INICIAL, { ...INICIAL, hero_title: '' }), ['hero_title'])
})

test('un valor cambiado en la base aparece como conflicto, aunque sea una escritura de estrategia sin updated_at', () => {
  const db = base(INICIAL)
  const cargado = db.leer() // se abre Configuración
  const fechaAntes = db.fila('estrategia_progress').updated_at
  db.upsert('estrategia_progress', '{"precios":true}') // Estrategia tilda una tarea, sin fecha
  assert.equal(db.fila('estrategia_progress').updated_at, fechaAntes, 'un chequeo por fecha no la ve')
  const frescos = db.leer() // relectura justo antes de guardar
  assert.deepEqual(conflictos(cargado, frescos, ['estrategia_progress', 'hero_title']), ['estrategia_progress'])
})

test('dos pestañas con la misma clave: la segunda se entera antes de pisar', () => {
  const db = base(INICIAL)
  const pestanaA = db.leer()
  const pestanaB = db.leer()
  db.upsert('promo_bar_text', 'Anush: envío gratis desde 4500', '2026-11-04T12:00:00Z') // A guarda
  const claves = cambiosPendientes(pestanaB, { ...pestanaB, promo_bar_text: 'Mati: 15% off' })
  assert.deepEqual(conflictos(pestanaB, db.leer(), claves), ['promo_bar_text'])
  // A, que guardó lo suyo, no tiene conflicto con su propio valor.
  assert.deepEqual(conflictos({ ...pestanaA, promo_bar_text: 'Anush: envío gratis desde 4500' }, db.leer(), ['promo_bar_text']), [])
})

test('sin cambios en la base no hay conflicto; una clave borrada por otra pantalla sí lo es', () => {
  const db = base(INICIAL)
  const cargado = db.leer()
  assert.deepEqual(conflictos(cargado, db.leer(), ['promo_bar_text', 'free_shipping_threshold']), [])
  db.borrar('hero_title')
  assert.deepEqual(conflictos(cargado, db.leer(), ['hero_title']), ['hero_title'])
  // Una clave que no existía al abrir y sigue sin existir: nada que avisar.
  assert.deepEqual(conflictos(cargado, db.leer(), ['hero_cta_href']), [])
})
