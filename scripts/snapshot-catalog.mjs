// Genera el snapshot estático del catálogo (src/lib/catalog-snapshot.json).
//
// Por qué existe: en el plan Free de Supabase, superar la cuota restringe TODO
// el proyecto (HTTP 402) hasta que resetea el ciclo. Con este snapshot
// commiteado, el sitio degrada a un catálogo NAVEGABLE en modo lectura
// ("encargá por WhatsApp") en vez de mostrar el cartel de mantenimiento —
// y de paso corta el egress de la DB a ~0 durante la caída.
//
// Uso (desde la raíz del repo, con Node 20+, CON LA DB ARRIBA):
//   1. Credenciales del proyecto de la TIENDA (no el del MCP):
//        set SUPABASE_URL=https://<proyecto>.supabase.co
//        set SUPABASE_ANON_KEY=<anon key, Settings → API>   (alcanza; datos públicos)
//   2. Correr:
//        node scripts/snapshot-catalog.mjs
//   3. Commitear el src/lib/catalog-snapshot.json resultante.
//
// Idealmente se corre cada tanto (o vía GitHub Action) para mantenerlo fresco.

import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const URL_ = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY

if (!URL_ || !KEY) {
  console.error('Faltan SUPABASE_URL y/o SUPABASE_ANON_KEY en el entorno.')
  process.exit(1)
}

const supabase = createClient(URL_, KEY)

// Mismo shape que consume src/lib/catalog.ts (products con joins).
const PRODUCT_SELECT =
  '*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))'

function normalizeProducts(rows) {
  return (rows ?? []).map((p) => {
    const joined = p.colors ?? []
    return { ...p, colors: joined.map((c) => c.color).filter(Boolean) }
  })
}

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

  const settings = (settingsRes.data ?? []).reduce(
    (acc, r) => ({ ...acc, [r.key]: String(r.value ?? '') }),
    {}
  )

  const snapshot = {
    generatedAt: new Date().toISOString(),
    products: normalizeProducts(productsRes.data),
    categories: categoriesRes.data ?? [],
    colors: colorsRes.data ?? [],
    discounts: discountsRes.data ?? [],
    settings,
  }

  const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '../src/lib/catalog-snapshot.json')
  await writeFile(outPath, JSON.stringify(snapshot, null, 2) + '\n', 'utf8')

  console.log(`Snapshot escrito: ${outPath}`)
  console.log(
    `  ${snapshot.products.length} productos · ${snapshot.categories.length} categorías · ` +
    `${snapshot.colors.length} colores · ${snapshot.discounts.length} descuentos · ` +
    `${Object.keys(settings).length} settings`
  )
  if (snapshot.products.length === 0) {
    console.warn('  ⚠  0 productos — el snapshot queda vacío (¿DB restringida?). No commitear así.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
