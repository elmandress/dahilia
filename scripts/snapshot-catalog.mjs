// Genera el snapshot estático del catálogo (src/lib/catalog-snapshot.json) y
// su fecha (src/lib/catalog-snapshot-meta.json).
//
// Por qué existe: en el plan Free de Supabase, superar la cuota restringe TODO
// el proyecto (HTTP 402) hasta que resetea el ciclo. Con este snapshot
// commiteado, el sitio degrada a un catálogo NAVEGABLE en modo lectura
// ("encargá por WhatsApp") en vez de mostrar el cartel de mantenimiento —
// y de paso corta el egress de la DB a ~0 durante la caída.
//
// Uso (desde la raíz del repo, con Node 20.6+, CON LA DB ARRIBA):
//   node --env-file=.env.local scripts/snapshot-catalog.mjs
// y commitear los dos JSON. Usa solo la clave pública (la misma que viaja en el
// navegador): es solo lectura, de lo que ve cualquier visitante, y no baja
// fotos. Sin .env.local, alcanza con SUPABASE_URL y SUPABASE_ANON_KEY (del
// proyecto de la TIENDA, no el del MCP; Settings → API) en el entorno.
//
// Se regenera antes de cada deploy (.claude/skills/quality-gate):
// `node scripts/snapshot-edad.mjs` falla si tiene más de 14 días, y /admin
// muestra el mismo aviso. No va en una GitHub Action: las Actions fallaban
// siempre y los relojes se mudaron a Netlify (27/10/2026).

import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const URL_ = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
// Nunca la clave de servicio: saltea la RLS y el snapshot tiene que ser lo
// mismo que lee la tienda.
const KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!URL_ || !KEY) {
  console.error('Faltan la URL y la clave pública de Supabase (NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local).')
  process.exit(1)
}

const supabase = createClient(URL_, KEY)

// Mismo shape que consume src/lib/catalog.ts (products con joins). La colección
// se pide solo para dejar afuera los drops que no son públicos (mismo criterio
// que dropVisibility en src/lib/types.ts) y se descarta antes de escribir; queda
// su nombre, como en el catálogo en vivo, para que el buscador encuentre "sunset".
const PRODUCT_SELECT =
  '*, category:categories(*), collection:collections(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))'

const isPublicDrop = (p) => !p.collection_id || (p.collection?.published && !p.collection?.unlisted)

function normalizeProducts(rows) {
  return (rows ?? []).filter(isPublicDrop).map((p) => {
    const joined = p.colors ?? []
    return {
      ...p,
      collection: undefined,
      collection_name: p.collection?.name ?? undefined,
      colors: joined.map((c) => c.color).filter(Boolean),
    }
  })
}

// Estado interno del panel (la lista privada, el progreso de Estrategia): no es
// contenido de la tienda y no tiene por qué quedar en el repo. Mismo criterio
// que la policy de database/admin-pedidos-y-ajustes-2026-11.sql, que hace lo
// mismo para la clave pública.
const CLAVE_PRIVADA = /^(lista_|estrategia_)/

async function main() {
  const [categoriesRes, productsRes, colorsRes, discountsRes, settingsRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .in('status', ['active', 'soldout'])
      .order('sort_order', { ascending: true }),
    supabase.from('colors').select('*').order('sort_order', { ascending: true }),
    supabase.from('discounts').select('*').eq('active', true),
    supabase.from('site_settings').select('key, value'),
  ])

  const firstError = [categoriesRes, productsRes, colorsRes, discountsRes, settingsRes].find((r) => r.error)
  if (firstError?.error) {
    console.error('La DB devolvió error — ¿está caída o superó la cuota?')
    console.error(firstError.error.message)
    process.exit(1)
  }

  const settings = (settingsRes.data ?? [])
    .filter((r) => !CLAVE_PRIVADA.test(r.key))
    .reduce((acc, r) => ({ ...acc, [r.key]: String(r.value ?? '') }), {})

  const generatedAt = new Date().toISOString()
  const snapshot = {
    generatedAt,
    products: normalizeProducts(productsRes.data),
    categories: categoriesRes.data ?? [],
    colors: colorsRes.data ?? [],
    discounts: discountsRes.data ?? [],
    settings,
  }

  // Un snapshot sin productos dejaría la tienda en el cartel de mantenimiento
  // en la próxima caída: mejor no pisar el que hay.
  if (snapshot.products.length === 0) {
    console.error('0 productos — ¿la clave no ve el catálogo? No se escribió nada.')
    process.exit(1)
  }

  const libDir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/lib')
  const outPath = resolve(libDir, 'catalog-snapshot.json')
  await writeFile(outPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')
  // La fecha va también aparte: /admin la importa para avisar si el respaldo
  // envejeció, sin meter las ~140 KB del snapshot en el panel.
  await writeFile(resolve(libDir, 'catalog-snapshot-meta.json'), JSON.stringify({ generatedAt }, null, 2) + '\n', 'utf8')

  console.log(`Snapshot escrito: ${outPath}`)
  console.log(
    `  ${snapshot.products.length} productos · ${snapshot.categories.length} categorías · ` +
    `${snapshot.colors.length} colores · ${snapshot.discounts.length} descuentos · ` +
    `${Object.keys(settings).length} settings`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
