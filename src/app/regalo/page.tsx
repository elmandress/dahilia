import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/catalog'
import { getListingPrice } from '@/lib/types'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'
import { RegaloClient, type GiftSuggestion } from './RegaloClient'
import { REGALO_FAQ } from './faq'
import { jsonLdScript } from '@/lib/json-ld'

export const revalidate = 3600

const TITLE = 'Tarjeta de regalo: regalá una prenda tejida a mano'
const DESCRIPTION = 'Regalá Dahila sin adivinar el talle ni el color: elegís el monto, escribís un mensaje y quien la recibe elige su prenda. Tejida a mano en Montevideo, a su medida.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/regalo' },
  openGraph: { ...OG_BASE, title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/regalo` },
}

/**
 * Tarjeta de regalo (08/10/2026). No hay pago en la web: la página arma el
 * pedido y lo manda por WhatsApp, como el resto del checkout. Anush cobra y
 * crea en /admin/cupones un cupón de monto fijo con el código que le manda a
 * quien regala. Se apaga desde Configuración → "Tarjeta de regalo".
 */
export default async function RegaloPage() {
  const { settings, products, discounts } = await getCatalog()
  if (settings.regalo_enabled === 'false') notFound()

  const whatsappUrl = settings.contact_whatsapp_url?.trim() || 'https://wa.me/59899850073'

  // Montos sugeridos: precios REALES del catálogo (la pieza más accesible,
  // una del medio y la de mayor valor), nunca cifras inventadas. Cada chip
  // dice qué prenda alcanza a pagar.
  const priced = products
    .filter((p) => p.status === 'active' && !p.is_custom_only)
    .map((p) => ({ name: p.name, price: getListingPrice(p, discounts) }))
    .filter((p) => p.price > 0)
    .sort((a, b) => a.price - b.price)
  const picks = priced.length === 0 ? [] : [
    priced[0],
    priced[Math.floor(priced.length / 2)],
    priced[priced.length - 1],
  ]
  const suggestions: GiftSuggestion[] = picks
    .filter((p, i, arr) => arr.findIndex((q) => q.price === p.price) === i)
    .map((p) => ({ amount: p.price, label: p.name }))

  // Las mismas preguntas que se ven en la página, como FAQPage para Google.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REGALO_FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }} />
      <RegaloClient whatsappUrl={whatsappUrl} suggestions={suggestions} />
    </>
  )
}
