import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCatalog } from '@/lib/catalog'
import { getListingPrice, isReadyToShip, isTalleUnico } from '@/lib/types'
import { ProductCard } from '@/components/ProductCard'
import { dahila } from '@/components/ui/tokens'
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

  // El menú dice "Regalos" y esta página era solo la tarjeta: quien quería
  // regalar algo físico no encontraba las piezas sin talle que ya están
  // tejidas (recorridos 04/11/2026).
  const sinTalle = products
    .filter((p) => p.status === 'active' && !p.is_custom_only && isReadyToShip(p) && isTalleUnico(p.sizes))
    .slice(0, 4)

  // Las mismas preguntas que se ven en la página, como FAQPage para Google.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: REGALO_FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(faqJsonLd) }} />
      <RegaloClient
        whatsappUrl={whatsappUrl}
        suggestions={suggestions}
        sinTalle={sinTalle.length > 0 && (
          <section aria-labelledby="regalo-sin-talle" style={{ marginTop: 64 }}>
            <h2 id="regalo-sin-talle" style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 28, color: dahila.ink900, margin: '0 0 6px' }}>
              O regalá algo que no tiene talle
            </h2>
            <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink500, margin: '0 0 20px' }}>
              Ya están tejidas: salen apenas coordinamos.
            </p>
            <div className="tienda-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, rowGap: 44 }}>
              {sinTalle.map((p) => <ProductCard key={p.id} product={p} discounts={discounts} />)}
            </div>
          </section>
        )}
      />
    </>
  )
}
