// src/app/admin/productos/talles-plan.ts: talles por upsert, nunca "borrar todo e insertar" (QA-M1, CRO-06).
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planTalles } from '@/app/admin/productos/talles-plan'

const EXISTENTES = [{ id: 'a', size: 'S' }, { id: 'b', size: 'M' }, { id: 'c', size: 'L' }]
const T = (size, price_uyu = null, available = true) => ({ size, price_uyu, available })

// La tabla product_sizes en memoria, con el UNIQUE(product_id, size) de la base:
// el upsert actualiza por nombre y conserva el id (y el stock_qty) de la fila.
function tabla(filas) {
  const rows = filas.map((f) => ({ product_id: 'p1', stock_qty: null, ...f }))
  let n = 0
  return {
    rows,
    upsert(list) {
      for (const u of list) {
        const fila = rows.find((r) => r.product_id === u.product_id && r.size === u.size)
        if (fila) Object.assign(fila, u)
        else rows.push({ id: `nuevo-${++n}`, stock_qty: null, ...u })
      }
    },
    borrar(ids) {
      for (const id of ids) rows.splice(rows.findIndex((r) => r.id === id), 1)
    },
  }
}

test('renombrar, agregar y quitar: solo se borra lo que ya no está', () => {
  // S pasa a "S/M" (renombre), M sigue, L se quita y XL es nuevo.
  const plan = planTalles(EXISTENTES, [T('S/M', 1500), T('M'), T('XL', 2000, false)], 'p1')
  assert.deepEqual(plan.upserts.map((u) => u.size), ['S/M', 'M', 'XL'])
  assert.deepEqual(plan.upserts.map((u) => u.sort_order), [0, 1, 2])
  assert.deepEqual([...plan.deleteIds].sort(), ['a', 'c'])
  assert.ok(!plan.deleteIds.includes('b'), 'M sigue en el formulario: no se borra')
})

test('guardar sin tocar los talles no borra nada y mantiene los ids', () => {
  const plan = planTalles(EXISTENTES, [T('S'), T('M'), T('L')], 'p1')
  assert.deepEqual(plan.deleteIds, [])
  const t = tabla(EXISTENTES)
  t.upsert(plan.upserts)
  assert.deepEqual(t.rows.map((r) => r.id), ['a', 'b', 'c'])
})

test('nunca "borrar todo": con talles en el formulario, ninguno de los que siguen se borra', () => {
  const casos = [
    [T('M'), T('S')], // reordenar
    [T('m'), T('M ')], // mayúsculas y espacios: M sigue, "m" es otro talle
    [T('L'), T('XL'), T('XXL')],
    [T('Único')],
  ]
  for (const form of casos) {
    const plan = planTalles(EXISTENTES, form, 'p1')
    const quedan = new Set(form.map((f) => f.size.trim()).filter(Boolean))
    for (const id of plan.deleteIds) {
      const fila = EXISTENTES.find((e) => e.id === id)
      assert.ok(!quedan.has(fila.size), `borra ${fila.size} aunque sigue en ${JSON.stringify(form)}`)
    }
    assert.ok(plan.upserts.length > 0)
  }
})

test('los upserts no traen stock_qty: no pisan las unidades contadas', () => {
  const plan = planTalles(EXISTENTES, [T('S', 1500), T('M')], 'p1')
  for (const u of plan.upserts) assert.ok(!('stock_qty' in u), JSON.stringify(u))
  const t = tabla([{ id: 'a', size: 'S', stock_qty: 2 }, { id: 'b', size: 'M', stock_qty: 1 }])
  t.upsert(plan.upserts)
  assert.deepEqual(t.rows.map((r) => [r.size, r.stock_qty, r.price_uyu]), [['S', 2, 1500], ['M', 1, null]])
})

test('ignora talles vacíos y repetidos, y el orden es el del formulario', () => {
  const plan = planTalles([], [T('  '), T('L'), T('S'), T('L', 9)], 'p1')
  assert.deepEqual(plan.upserts.map((u) => [u.size, u.sort_order, u.price_uyu]), [['L', 0, null], ['S', 1, null]])
})

test('si el guardado se corta entre el upsert y el borrado, la prenda nunca queda sin talles y el reintento converge', () => {
  const form = [T('S/M', 1500), T('XL')]
  const t = tabla(EXISTENTES)
  // 1er intento: el upsert pasa y el borrado falla (red del celular).
  t.upsert(planTalles(t.rows, form, 'p1').upserts)
  assert.ok(t.rows.length > 0)
  // Reintento desde la misma pantalla: relee lo que hay y termina el trabajo.
  const plan2 = planTalles(t.rows, form, 'p1')
  t.upsert(plan2.upserts)
  t.borrar(plan2.deleteIds)
  assert.deepEqual(t.rows.map((r) => [r.size, r.sort_order]), [['S/M', 0], ['XL', 1]])
})

test('vaciar el formulario a propósito borra los talles (la prenda pasa a precio base)', () => {
  const plan = planTalles(EXISTENTES, [], 'p1')
  assert.deepEqual(plan.upserts, [])
  assert.deepEqual([...plan.deleteIds].sort(), ['a', 'b', 'c'])
})
