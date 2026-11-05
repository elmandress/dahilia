import { createClient } from '@/lib/supabase/public'
import { getSnapshotData } from '@/lib/catalog'
import { SITE_URL } from '@/lib/env'
import {
  getEffectivePrice, getFinalPrice, getListingSize, getPrimaryPhoto, isReadyToShip, isUnicoLabel, sortSizes, variantLabel,
} from '@/lib/types'
import { botImageUrl } from '@/lib/media'
import { dropVisibility, type Product, type Discount } from '@/lib/types'
import { localTermFor } from '@/lib/vocabulario'
import { feedItemId, tieneVariantes, variantUrl } from '@/lib/catalog-ids'
import { promesaFicha } from '@/lib/seo-copy'

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

/** Con descuento, precio de lista + sale_price: Google muestra el tachado igual
 *  que la ficha. Antes iba solo el final como precio, y el −15 % no se veía. */
function priceTags(list: number, final: number): string {
  return final < list
    ? `      <g:price>${list}.00 UYU</g:price>\n      <g:sale_price>${final}.00 UYU</g:sale_price>`
    : `      <g:price>${final}.00 UYU</g:price>`
}

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
 * Google exige `availability_date` en cada producto marcado `backorder`.
 * La fecha sale del plazo real de producción de la ficha: hoy + el máximo de
 * semanas que esa misma ficha promete. Los productos listos para enviar no
 * llevan este atributo. Así el feed coincide con lo que lee la clienta y se
 * recalcula solo en cada revalidación.
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
 * el resto del catálogo es moda femenina. Sin categoría (la Box de regalo)
 * tampoco se sabe: unisex (SEO-08).
 */
function genderFor(categoryName: string | undefined): string {
  return !categoryName || categoryName === 'Accesorios' ? 'unisex' : 'female'
}

export async function GET() {
  // Con la DB caída, esto devolvía un feed vacío — "mejor que uno roto", pero
  // un feed vacío recurrente puede leerse en Merchant Center como señal de
  // sacar el catálogo de circulación. El resto del sitio ya cae al snapshot
  // estático ante este escenario (misma cuota agotada de jul-2026); el feed
  // no lo hacía (auditoría 03/09/2026).
  let products: Product[] = []
  let discounts: Discount[] = []
  try {
    const supabase = await createClient()
    const [{ data: prods, error: prodErr }, { data: disc, error: discErr }] = await Promise.all([
      supabase
        .from('products')
        // slug: para la palabra uruguaya del título (lib/vocabulario.ts).
        // sort_order de los talles: el orden de las variantes y el precio de
        // una prenda sin talle disponible.
        .select('*, category:categories(name, slug), collection:collections(*), media:product_media(url, is_primary, type), sizes:product_sizes(size, price_uyu, available, sort_order)')
        .in('status', ['active', 'soldout'])
        .order('sort_order', { ascending: true }),
      supabase.from('discounts').select('*').eq('active', true),
    ])
    if (prodErr) throw prodErr
    if (discErr) throw discErr
    discounts = (disc ?? []) as Discount[]
    // Prendas de un drop que todavía no es público: fuera del feed.
    products = ((prods ?? []) as Product[]).filter((p) => dropVisibility(p) === 'public')
  } catch (e) {
    console.error('merchant-feed fetch failed, usando snapshot', e)
    const snap = getSnapshotData()
    products = snap.products as Product[]
    discounts = snap.discounts as Discount[]
  }

  let items = ''
  try {
    items = products
      .map((p) => {
        const photo = getPrimaryPhoto(p)
        // Título de Shopping con lo que la prenda ES, en el idioma de quien
        // busca: "Spring cardigan · saco tejido a mano" (08/10/2026). Google
        // empareja la búsqueda contra el título; el nombre solo no dice qué es.
        const local = localTermFor(p)
        const baseTitle = local ? `${p.name} · ${local} tejido a mano` : p.name
        const productType = local && p.category?.name
          ? `${p.category.name} > ${local[0].toUpperCase()}${local.slice(1)}s tejidos`
          : p.category?.name
        if (!photo || photo.startsWith('/')) return '' // sin foto real, se omite

        // Disponibilidad honesta: solo "in_stock" si la pieza sale ya. Lo que
        // se teje a pedido es "backorder" — mismo criterio que el schema de la
        // ficha, para que el feed y la página no se contradigan. 21/10/2026:
        // antes pedía además plazo máximo 0, y la Box de regalo y las Mini
        // bufandas salían "en stock" en la ficha y "a pedido" acá; Merchant
        // Center marca esa diferencia como error de disponibilidad.
        // 04/11/2026 (SEO-08, bug #22): también agotada cuando todos sus talles
        // lo están. Antes esa prenda caía en la rama "sin talles" y publicaba
        // un ítem nuevo, en stock o a pedido, a precio base.
        const enStock = isReadyToShip(p)
        const weeksMax = Math.max(p.lead_time_weeks_min, p.lead_time_weeks_max)
        const disponibilidad = (agotada: boolean) => {
          const availability =
            p.status === 'soldout' || agotada ? 'out_of_stock' : enStock ? 'in_stock' : 'backorder'
          // La fecha solo corresponde a lo que todavía no existe: Google la
          // rechaza en un producto marcado en stock.
          const fechaLinea = availability === 'backorder'
            ? `\n      <g:availability_date>${availabilityDate(weeksMax)}</g:availability_date>`
            : ''
          return `      <g:availability>${availability}</g:availability>${fechaLinea}`
        }

        // Sin descripción propia, la misma promesa que el title y la tarjeta
        // de la ficha (SEO-03): "en tu talle y tus colores" iba en todas,
        // también en las piezas ya tejidas y en las que no tienen talle.
        const desc = cleanDescription(p.description, `${p.name}. ${promesaFicha(p).linea}`)

        // Plazo de producción en días hábiles, desde las semanas de la ficha.
        // En stock: sale ya, aunque la ficha conserve un máximo de semanas viejo.
        const minDays = enStock ? 0 : Math.min(p.lead_time_weeks_min, p.lead_time_weeks_max) * 5
        const maxDays = enStock ? 2 : weeksMax * 5

        // Atributos comunes a todas las variantes de la prenda. El link va por
        // ítem (el de cada variante abre con su talle elegido) y la canónica
        // es la ficha a secas, la misma de la página (SEO-01).
        const comunes = `      <g:description>${xmlEscape(desc)}</g:description>
      <g:canonical_link>${xmlEscape(`${SITE_URL}/tienda/${p.slug}`)}</g:canonical_link>
      <g:image_link>${xmlEscape(botImageUrl(SITE_URL, photo))}</g:image_link>
      <g:condition>new</g:condition>
      <g:brand>Dahila Crochet</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:age_group>adult</g:age_group>
      <g:gender>${genderFor(p.category?.name)}</g:gender>
${productType ? `      <g:product_type>${xmlEscape(productType)}</g:product_type>\n` : ''}${p.material ? `      <g:material>${xmlEscape(p.material)}</g:material>\n` : ''}      <g:min_handling_time>${minDays}</g:min_handling_time>
      <g:max_handling_time>${maxDays}</g:max_handling_time>`

        // Una prenda con talles va como VARIANTES: un <item> por talle, todos
        // unidos por item_group_id. Es la estructura que Google espera para
        // ropa, y de paso cada talle publica SU precio exacto — antes iba uno
        // solo, el más barato, que es justo la discrepancia contra la página
        // que Merchant Center marca. Los ids salen de lib/catalog-ids.ts, la
        // misma regla que el píxel de Meta (TRK-01): "Único" no es un talle,
        // y la prenda que solo tiene esa fila va por la rama de abajo.
        if (tieneVariantes(p)) {
          const filas = sortSizes(p.sizes).filter((s) => !isUnicoLabel(s.size))
          const disponibles = filas.filter((s) => s.available !== false)
          // Todos agotados: los mismos ids, cada uno out_of_stock.
          const agotada = disponibles.length === 0
          // Modelos y no talles (Pulseras Terra: Lisas, Con lurex, Con
          // caracolas): g:pattern en vez de g:size, y el título sin "talle".
          const porModelo = variantLabel(p.sizes) === 'Modelo'
          return (agotada ? filas : disponibles)
            .map((s) => {
              const price = getFinalPrice(p, s.size, discounts)
              if (!(price > 0)) return ''
              const list = getEffectivePrice(p, s.size)
              const atributo = porModelo ? 'pattern' : 'size'
              return `    <item>
      <g:id>${xmlEscape(feedItemId(p.slug, s.size))}</g:id>
      <g:item_group_id>${xmlEscape(p.slug)}</g:item_group_id>
      <g:title>${xmlEscape(`${baseTitle} — ${porModelo ? '' : 'talle '}${s.size}`.slice(0, 150))}</g:title>
      <g:${atributo}>${xmlEscape(s.size)}</g:${atributo}>
      <g:link>${xmlEscape(variantUrl(SITE_URL, p.slug, s.size))}</g:link>
${priceTags(list, price)}
${disponibilidad(agotada)}
${comunes}
    </item>`
            })
            .filter(Boolean)
            .join('\n')
        }

        // Sin talles (accesorios, bolsos) o solo con la fila "Único": una sola
        // ficha, con el precio de su fila (el Sweater net tiene el suyo ahí).
        // Si esa fila está agotada, el ítem también.
        const filas = sortSizes(p.sizes)
        const talle = getListingSize(p) ?? filas[0]?.size
        const price = getFinalPrice(p, talle, discounts)
        if (!(price > 0)) return '' // sin precio no es publicable
        const list = getEffectivePrice(p, talle)
        return `    <item>
      <g:id>${xmlEscape(feedItemId(p.slug))}</g:id>
      <g:title>${xmlEscape(baseTitle.slice(0, 150))}</g:title>
      <g:link>${xmlEscape(variantUrl(SITE_URL, p.slug))}</g:link>
${priceTags(list, price)}
${disponibilidad(filas.length > 0 && filas.every((s) => s.available === false))}
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
