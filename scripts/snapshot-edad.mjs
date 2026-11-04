// Cuántos días tiene el respaldo del catálogo (src/lib/catalog-snapshot.json).
//
// Con la base caída, la tienda muestra ese respaldo: precios, prendas y
// descuentos del día en que se generó. El del 05/10/2026 llegó a noviembre con
// 32 precios viejos y sin el drop Sunset ’26 (auditoría 04/11/2026). Por eso el
// quality-gate lo corre antes de cada deploy y /admin avisa lo mismo.
//
// Uso: node scripts/snapshot-edad.mjs
// Sale con 1 si tiene más de 14 días; se regenera con
//   node --env-file=.env.local scripts/snapshot-catalog.mjs

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const MAX_DIAS = 14
const libDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/lib')

async function fecha(archivo) {
  try {
    const { generatedAt } = JSON.parse(await readFile(resolve(libDir, archivo), 'utf8'))
    const t = Date.parse(generatedAt)
    return Number.isFinite(t) ? { generatedAt, t } : null
  } catch {
    return null
  }
}

// El meta es chico y lo escribe el script desde el 04/11/2026; si falta (un
// snapshot anterior), la fecha está adentro del snapshot.
const leida = (await fecha('catalog-snapshot-meta.json')) ?? (await fecha('catalog-snapshot.json'))
if (!leida) {
  console.error('No se encontró la fecha del snapshot. Regeneralo con: node --env-file=.env.local scripts/snapshot-catalog.mjs')
  process.exit(1)
}

const dias = Math.floor((Date.now() - leida.t) / 86_400_000)
console.log(`El respaldo del catálogo tiene ${dias} ${dias === 1 ? 'día' : 'días'} (${leida.generatedAt}).`)
if (dias > MAX_DIAS) {
  console.error(`Tiene más de ${MAX_DIAS}: regeneralo con node --env-file=.env.local scripts/snapshot-catalog.mjs y commitealo antes del deploy.`)
  process.exit(1)
}
