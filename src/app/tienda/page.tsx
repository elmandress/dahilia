import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getCatalog } from '@/lib/catalog'
import { getPrimaryPhoto, getFinalPrice } from '@/lib/types'
import { SITE_URL } from '@/lib/env'
import { TiendaClient } from './TiendaClient'
import { CatalogReadOnlyBanner } from '@/components/CatalogReadOnlyBanner'
import { OG_BASE } from '@/lib/og'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Ropa de crochet hecha a mano en Uruguay',
  description: 'Tops, cardigans, bolsos y sets tejidos a mano en Montevideo, con precios claros. Cada pieza se puede pedir en tu talle y tus colores. Envío a todo Uruguay.',
  alternates: { canonical: '/tienda' },
  openGraph: {
    ...OG_BASE,
    title: 'Ropa de crochet hecha a mano en Uruguay',
    description: 'Tops, cardigans, bolsos y sets tejidos a mano en Montevideo, con precios claros. Envío a todo Uruguay.',
    url: '/tienda',
  },
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  const categoryFilter = typeof params.cat === 'string' ? params.cat : ''
  const searchQuery = typeof params.q === 'string' ? params.q : ''
  const colorParam = typeof params.color === 'string' ? params.color : ''
  const sizeParam = typeof params.talle === 'string' ? params.talle : ''
  const maxParam = typeof params.max === 'string' ? params.max : ''
  const sortParam = typeof params.sort === 'string' ? params.sort : ''
  const onlyOffers = params.oferta === '1'
  const hideOutOfStock = params.disp === '1'

  // Catálogo con fallback al snapshot estático si la DB está caída (402 de
  // cuota) — el sitio sigue navegable en modo lectura en vez de quedar vacío.
  const { products, categories, colors, discounts, source } = await getCatalog(supabase)

  // CollectionPage + ItemList JSON-LD — describes /tienda as a product listing
  // and lets Google show it as a carousel. Limited to the first 24 items.
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tienda',
    description: 'Colección actual de prendas tejidas a crochet — tops, cardigans, accesorios y sets.',
    url: `${SITE_URL}/tienda`,
    isPartOf: { '@type': 'WebSite', name: 'Dahila Crochet', url: SITE_URL },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.slice(0, 24).map((p, i) => {
        const photo = getPrimaryPhoto(p)
        return {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: p.name,
            url: `${SITE_URL}/tienda/${p.slug}`,
            image: photo.startsWith('http') ? photo : `${SITE_URL}${photo}`,
            offers: {
              '@type': 'Offer',
              price: getFinalPrice(p, undefined, discounts).toFixed(2),
              priceCurrency: 'UYU',
              availability:
                p.status === 'active'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
            },
          },
        }
      }),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    {source === 'snapshot' && <CatalogReadOnlyBanner />}
    <TiendaClient
      key={`${categoryFilter}|${searchQuery}|${colorParam}|${sizeParam}|${maxParam}|${sortParam}|${onlyOffers}|${hideOutOfStock}`}
      initialProducts={products}
      categories={categories}
      colors={colors}
      discounts={discounts}
      initialFilter={categoryFilter}
      initialSearch={searchQuery}
      initialColor={colorParam}
      initialSize={sizeParam}
      initialMax={maxParam}
      initialSort={sortParam}
      initialOnlyOffers={onlyOffers}
      initialHideOutOfStock={hideOutOfStock}
    />
    </>
  )
}
