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
 * explícitamente que no existen, Merchant Center las marca como "Limited"
 * por identificador faltante. Ese atributo es exclusivo del feed.
 *
 * Se conecta en Merchant Center → Data sources → Add product source →
 * Scheduled fetch, apuntando a https://dahila.uy/merchant-feed.xml
 *
 * Formato: RSS 2.0 con el namespace de Google.
 */

/** Uruguay es UTC-3 todo el año (no tiene horario de verano desde 2015). */
const UY_OFFSET = '-03:00'

function xmlEscape(v: string): string {
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Texto plano de una descripción: sin saltos raros, y acotada al límite. */
function cleanDescription(raw: string | null, fallback: string): string {
  const t = (raw ?? '').replace(/\s+/g, ' ').trim()
  return (t || fallback).slice(0, 4900)
}

/**
 * Fecha estimada en que la pieza va a estar lista, en ISO 8601.
 *
 * Google EXIGE `availability_date` en todo lo marcado `backorder`: sin ella
 * rechaza el producto entero — era lo que desaprobaba las 34 fichas enteras.
 * Como acá nada está en stock (todo se teje cuando se encarga), la fecha sale
 * del plazo real de producción de cada ficha: hoy + el máximo de semanas que
 * esa misma ficha promete. Así el feed nunca dice algo distinto de lo que lee
 * la clienta en la página, y se recalcula sola en cada revalidación.
 */
function availabilityDate(weeksMax: number): string {
  const d = new Date()
  d.setDate(d.getDate() + Math.max(1, weeksMax) * 7)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}T12:00:00${UY_OFFSET}`
}

/**
 * `gender` según lo que la prenda realmente es. Google acepta male/female/
 * unisex, y ponerlo mal es peor que no ponerlo: aparece en búsquedas que no
 * corresponden. Los accesorios (bolsos, bandanas, bufandas) no tienen género;
 * el resto del catálogo es moda femenina.
 */
function genderFor(categoryName: string | undefined): string {
  return categoryName === 'Accesorios' ? 'unisex' : 'female'
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
        const photo = getPrimaryPhoto(p)
        if (!photo || photo.startsWith('/')) return '' // sin foto real, se omite

        // Disponibilidad honesta: solo "in_stock" si la pieza sale ya. Lo que
        // se teje a pedido es "backorder" — mismo criterio que el schema de la
        // ficha, para que el feed y la página no se contradigan.
        const enStock = p.lead_time_weeks_min === 0 && p.lead_time_weeks_max === 0
        const availability =
          p.status === 'soldout' ? 'out_of_stock' : enStock ? 'in_stock' : 'backorder'

        const weeksMax = Math.max(p.lead_time_weeks_min, p.lead_time_weeks_max)
        // La fecha solo corresponde a lo que todavía no existe: Google la
        // rechaza en un producto marcado en stock.
        const fechaLinea = availability === 'backorder'
          ? `\n      <g:availability_date>${availabilityDate(weeksMax)}</g:availability_date>`
          : ''

        const desc = cleanDescription(
          p.description,
          `${p.name}: tejido a mano a crochet en Montevideo, en tu talle y tus colores.`
        )

        // Plazo de producción en días hábiles, desde las semanas de la ficha.
        const minDays = Math.min(p.lead_time_weeks_min, p.lead_time_weeks_max) * 5
        const maxDays = weeksMax * 5

        // Atributos comunes a todas las variantes de la prenda.
        const comunes = `      <g:description>${xmlEscape(desc)}</g:description>
      <g:link>${xmlEscape(`${SITE_URL}/tienda/${p.slug}`)}</g:link>
      <g:image_link>${xmlEscape(botImageUrl(SITE_URL, photo))}</g:image_link>
      <g:availability>${availability}</g:availability>${fechaLinea}
      <g:condition>new</g:condition>
      <g:brand>Dahila Crochet</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:age_group>adult</g:age_group>
      <g:gender>${genderFor(p.category?.name)}</g:gender>
${p.category?.name ? `      <g:product_type>${xmlEscape(p.category.name)}</g:product_type>\n` : ''}${p.material ? `      <g:material>${xmlEscape(p.material)}</g:material>\n` : ''}      <g:min_handling_time>${minDays}</g:min_handling_time>
      <g:max_handling_time>${maxDays}</g:max_handling_time>`

        const talles = (p.sizes ?? []).filter((s) => s.available !== false)

        // Una prenda con talles va como VARIANTES: un <item> por talle, todos
        // unidos por item_group_id. Es la estructura que Google espera para
        // ropa, y de paso cada talle publica SU precio exacto — antes iba uno
        // solo, el más barato, que es justo la discrepancia contra la página
        // que Merchant Center marca.
        if (talles.length > 0) {
          return talles
            .map((s) => {
              const price = getFinalPrice(p, s.size, discounts)
              if (!(price > 0)) return ''
              return `    <item>
      <g:id>${xmlEscape(`${p.slug}-${s.size}`)}</g:id>
      <g:item_group_id>${xmlEscape(p.slug)}</g:item_group_id>
      <g:title>${xmlEscape(`${p.name} — talle ${s.size}`.slice(0, 150))}</g:title>
      <g:size>${xmlEscape(s.size)}</g:size>
      <g:price>${price}.00 UYU</g:price>
${comunes}
    </item>`
            })
            .filter(Boolean)
            .join('\n')
        }

        // Sin talles (accesorios, bolsos): una sola ficha, talle único.
        const price = getFinalPrice(p, undefined, discounts)
        if (!(price > 0)) return '' // sin precio no es publicable
        return `    <item>
      <g:id>${xmlEscape(p.slug)}</g:id>
      <g:title>${xmlEscape(p.name.slice(0, 150))}</g:title>
      <g:price>${price}.00 UYU</g:price>
${comunes}
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
