// src/lib/whatsapp.ts: un solo armado de links de WhatsApp (QA-15).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { waLink, waBase, mensajeVolverATejer, WHATSAPP_DEFAULT } from '@/lib/whatsapp'

const unText = (href) => {
  const u = new URL(href)
  assert.equal(u.protocol, 'https:')
  assert.equal(href.split('?').length, 2, `un solo "?": ${href}`)
  assert.equal(u.searchParams.getAll('text').length, 1)
  return u
}

test('wa.me sin https, con espacios o barra final: link https con un solo text', () => {
  for (const base of ['wa.me/59899850073', ' https://wa.me/59899850073/ ', 'http://wa.me/59899850073', 'https://www.wa.me/+59899850073']) {
    const href = waLink(base, 'Hola! ¿Cómo va?')
    assert.ok(href, base)
    const u = unText(href)
    assert.equal(u.hostname, 'wa.me')
    assert.equal(u.pathname, '/59899850073')
    assert.equal(u.searchParams.get('text'), 'Hola! ¿Cómo va?')
  }
})

test('los espacios del texto van como %20, igual que antes', () => {
  assert.equal(waLink(WHATSAPP_DEFAULT, 'a b+c'), 'https://wa.me/59899850073?text=a%20b%2Bc')
})

test('api.whatsapp.com/send?phone= conserva phone y suma text una sola vez', () => {
  const href = waLink('https://api.whatsapp.com/send?phone=59899850073&text=viejo', 'nuevo')
  const u = unText(href)
  assert.equal(u.hostname, 'api.whatsapp.com')
  assert.equal(u.searchParams.get('phone'), '59899850073')
  assert.equal(u.searchParams.get('text'), 'nuevo')
})

test('sin texto, el link queda limpio', () => {
  assert.equal(waLink('wa.me/59899850073/'), 'https://wa.me/59899850073')
})

// Lo que guarda Configuración (COR-03): siempre wa.me, así un "?text=" pegado
// a mano en otra página no queda con dos "?".
test('waBase: wa.me o api.whatsapp.com → https://wa.me/<número>', () => {
  for (const base of ['wa.me/59899850073', 'https://wa.me/+598 99 850 073/', 'https://api.whatsapp.com/send?phone=59899850073', 'api.whatsapp.com/send?phone=%2B59899850073&text=hola']) {
    assert.equal(waBase(base), 'https://wa.me/59899850073', base)
  }
  const pegado = `${waBase('https://api.whatsapp.com/send?phone=59899850073')}?text=${encodeURIComponent('Hola!')}`
  assert.equal(new URL(pegado).pathname, '/59899850073')
  assert.equal(new URL(pegado).searchParams.get('text'), 'Hola!')
  for (const base of ['https://ejemplo.com', '', null, 'https://api.whatsapp.com/send']) assert.equal(waBase(base), null, String(base))
})

test('lo que no es WhatsApp da null', () => {
  for (const base of ['https://ejemplo.com', 'https://dahila.uy/colecciones/sunset-26', '', '   ', null, undefined, 'wa.me/', 'https://wa.me/message/ABC123', 'https://api.whatsapp.com/send'])
    assert.equal(waLink(base, 'hola'), null, String(base))
})

test('mensajeVolverATejer: una o varias prendas', () => {
  assert.equal(
    mensajeVolverATejer(['Spring cardigan', 'Top Race']),
    'Hola! Quería pedir Spring cardigan y Top Race pero en la web figuran como no disponibles. ¿Se pueden volver a tejer? 🧶'
  )
  assert.equal(
    mensajeVolverATejer(['Spring cardigan']),
    'Hola! Quería pedir Spring cardigan pero en la web figura como no disponible. ¿Se puede volver a tejer? 🧶'
  )
  assert.match(mensajeVolverATejer(['A', 'B', 'C', 'A']), /pedir A, B y C pero/)
})
