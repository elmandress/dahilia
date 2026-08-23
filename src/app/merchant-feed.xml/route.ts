import { createClient } from '@/lib/supabase/public'
import { SITE_URL } from '@/lib/env'
import { getFinalPrice, getPrimaryPhoto } from '@/lib/types'
import { botImageUrl } from '@/lib/media'
import type { Product, Discount } from '@/lib/types'

export const revalidate = 3600

/**
 * Feed de productos para Google Merchant Center.
 *
 * Por qué existe: Merchant Center estaba armando el catálogo RASTREANDO el
 * sitio ("found by Google"), y así solo encontró 19 de 34 productos — el
 * rastreo es lento, incompleto y no se puede apurar. Con un feed, Google lee
 * la lista completa de una y la re-lee sola cada día.
 *
 * Y resuelve algo que los datos estructurados de la página NO pueden: el
 * atributo `identifier_exists`. Estas piezas son hechas a mano y no tienen
 * código de barras (GTIN) ni número de fabricante (MPN); sin declarar
 * explícitamente que no existen, Merchant Center marca los productos como
 * "Limited" por identificador faltante y les baja el alcance. Ese atributo
 * es exclusivo del feed: en JSON-LD Google lo ignora.
 *
 * Se conecta en Merchant Center → Data sources → Add product source →
 * Scheduled fetch, apuntando a https://dahila.uy/merchant-feed.xml
 *
 * Formato: RSS 2.0 con el namespace de Google, que es el que Merchant Center
 * acepta sin conversión.
 */

function xmlEscape(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Texto plano de una descripción: sin saltos raros ni tags, y acotada. */
function cleanDescription(raw: string | null, fallback: string): string {
  const t = (raw ?? '').replace(/\s+/g, ' ').trim()
  return (t || fallback).slice(0, 4900)
}

export async function GET() {
  let items = ''

  try {
    const supabase = await createClient()
    const [{ data: prods }, { data: disc }] = await Promise.all([
      supabase
        .from('products')
        .select('*, category:categories(name), media:product_media(url, is_primary, type), sizes:product_sizes(size, price_uyu, available)')
        .in('status', ['active', 'soldout'])
        .order('sort_order', { ascending: true }),
      supabase.from('discounts').select('*').eq('active', true),
    ])

    const discounts = (disc ?? []) as Discount[]
    const products = (prods ?? []) as Product[]

    items = products
      .map((p) => {
        // Precio: el del talle disponible más barato, que es el que la clienta
        // ve como "desde". Un precio que no se puede comprar es justamente lo
        // que Merchant Center marca como discrepancia contra la página.
        const sizePrices = (p.sizes ?? [])
          .filter((s) => s.available !== false)
          .map((s) => getFinalPrice(p, s.size, discounts))
          .filter((n) => n > 0)
        const price = sizePrices.length > 0
          ? Math.min(...sizePrices)
          : getFinalPrice(p, undefined, discounts)
        if (!(price > 0)) return '' // sin precio no es publicable

        const photo = getPrimaryPhoto(p)
        if (!photo || photo.startsWith('/')) return '' // sin foto real, se omite

        // Disponibilidad honesta: solo "in_stock" si la pieza sale ya. Lo que
        // se teje a pedido es "backorder" — mismo criterio que el schema de la
        // ficha, para que el feed y la página no se contradigan.
        const availability =
          p.status === 'soldout'
            ? 'out_of_stock'
            : p.lead_time_weeks_min === 0 && p.lead_time_weeks_max === 0
              ? 'in_stock'
              : 'backorder'

        const desc = cleanDescription(
          p.description,
          `${p.name}: tejido a mano a crochet en Montevideo, en tu talle y tus colores.`
        )

        // Plazo de producción en días hábiles, desde las semanas de la ficha.
        const minDays = Math.min(p.lead_time_weeks_min, p.lead_time_weeks_max) * 5
        const maxDays = Math.max(p.lead_time_weeks_min, p.lead_time_weeks_max) * 5

        return `    <item>
      <g:id>${xmlEscape(p.slug)}</g:id>
      <g:title>${xmlEscape(p.name.slice(0, 150))}</g:title>
      <g:description>${xmlEscape(desc)}</g:description>
      <g:link>${xmlEscape(`${SITE_URL}/tienda/${p.slug}`)}</g:link>
      <g:image_link>${xmlEscape(botImageUrl(SITE_URL, photo))}</g:image_link>
      <g:availability>${availability}</g:availability>
      <g:price>${price}.00 UYU</g:price>
      <g:condition>new</g:condition>
      <g:brand>Dahila Crochet</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
${p.category?.name ? `      <g:product_type>${xmlEscape(p.category.name)}</g:product_type>\n` : ''}${p.material ? `      <g:material>${xmlEscape(p.material)}</g:material>\n` : ''}      <g:min_handling_time>${minDays}</g:min_handling_time>
      <g:max_handling_time>${maxDays}</g:max_handling_time>
    </item>`
      })
      .filter(Boolean)
      .join('\n')
  } catch (e) {
    // Un feed vacío es mucho mejor que un feed roto: Merchant Center
    // reintenta solo y no borra el catálogo por una lectura fallida.
    console.error('merchant-feed fetch failed', e)
    items = ''
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Dahila Crochet</title>
    <link>${SITE_URL}</link>
    <description>Prendas tejidas a crochet, hechas a mano y a medida, desde Montevideo, Uruguay.</description>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
