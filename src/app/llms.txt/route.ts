import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/env'
import { formatPrice, getFinalPrice } from '@/lib/types'
import type { Product, Discount } from '@/lib/types'

export const revalidate = 3600

// /llms.txt — a plain-text, LLM-friendly map of the store, generated from LIVE
// data (no invented content). Perplexity retrieves llms.txt to prioritise pages,
// and other answer engines increasingly treat it as an agent-readiness signal.
// The markdown structure + concrete specs (names, prices, links, FAQ) are exactly
// what LLMs extract well for AEO/GEO citation.
export async function GET() {
  let productLines = ''
  let faqBlock = ''

  try {
    const supabase = await createClient()
    const [{ data: prods }, { data: disc }, { data: settingRows }] = await Promise.all([
      supabase
        .from('products')
        .select('slug, name, description, base_price_uyu, discount_active, discount_percent, sizes:product_sizes(price_uyu)')
        .eq('status', 'active')
        .order('sort_order', { ascending: true }),
      supabase.from('discounts').select('*').eq('active', true),
      supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['faq_1_q', 'faq_1_a', 'faq_2_q', 'faq_2_a', 'faq_3_q', 'faq_3_a', 'faq_4_q', 'faq_4_a']),
    ])

    const discounts = (disc ?? []) as Discount[]
    productLines = ((prods ?? []) as unknown as Product[])
      .map((p) => {
        const price = formatPrice(getFinalPrice(p, undefined, discounts))
        const desc = p.description ? ` — ${p.description.replace(/\s+/g, ' ').trim()}` : ''
        return `- [${p.name}](${SITE_URL}/tienda/${p.slug}): ${price}${desc}`
      })
      .join('\n')

    const settings = (settingRows ?? []).reduce<Record<string, string>>(
      (acc, r) => ({ ...acc, [r.key as string]: String(r.value ?? '') }),
      {}
    )
    const faqs = [1, 2, 3, 4]
      .map((n) => ({ q: settings[`faq_${n}_q`], a: settings[`faq_${n}_a`] }))
      .filter((f) => f.q?.trim() && f.a?.trim())
    if (faqs.length > 0) {
      faqBlock = `\n## Preguntas frecuentes\n${faqs.map((f) => `**${f.q.trim()}**\n${f.a.trim()}`).join('\n\n')}\n`
    }
  } catch {
    productLines = ''
  }

  const body = `# Dahila Crochet

> Prendas tejidas a crochet, hechas a mano y a medida, desde Montevideo, Uruguay.
> Tienda artesanal (slow fashion): tops, cardigans, bolsos, accesorios y sets.
> Envíos a todo Uruguay. Los pedidos y encargos a medida se coordinan por WhatsApp.

## Cómo comprar
- Elegís la prenda en la tienda y coordinás stock, envío y pago por WhatsApp.
- También podés pedir una prenda **a medida** (tu talle y colores) desde /encargo.
- Las piezas a medida se tejen en 2–6 semanas según el modelo.

## Páginas principales
- [Tienda](${SITE_URL}/tienda): catálogo completo de prendas disponibles.
- [Encargos a medida](${SITE_URL}/encargo): pedí una prenda tejida a tu medida y colores.
- [Sobre el atelier](${SITE_URL}/atelier): quiénes somos y cómo trabajamos.
- [Envíos y cambios](${SITE_URL}/info): información de envíos, cuidados y pagos.
- [Contacto](${SITE_URL}/contacto): WhatsApp e Instagram.

## Catálogo
${productLines}
${faqBlock}
## Marca
- Nombre: Dahila Crochet
- Ubicación: Montevideo, Uruguay
- Instagram: https://www.instagram.com/dahila.crochet/
- Atributos: hecho a mano · a medida · lana y algodón natural · envío a todo Uruguay
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
