import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Product, Category, Color, Discount } from '@/lib/types'
import { getPrimaryPhoto, getFinalPrice } from '@/lib/types'
import { SITE_URL } from '@/lib/env'
import { TiendaClient } from './TiendaClient'
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
  const maxParam = typeof params.max === 'string' ? params.max : ''
  const sortParam = typeof params.sort === 'string' ? params.sort : ''
  const onlyOffers = params.oferta === '1'

  const [categoriesRes, productsRes, colorsRes, discountsRes] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order', { ascending: true }),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .in('status', ['active', 'soldout'])
      .order('sort_order', { ascending: true }),
    supabase.from('colors').select('*').order('sort_order', { ascending: true }),
    supabase.from('discounts').select('*').eq('active', true),
  ])

  const categories = (categoriesRes.data ?? []) as Category[]
  const colors = (colorsRes.data ?? []) as Color[]
  const discounts = (discountsRes.data ?? []) as Discount[]

  // Flatten the joined product_colors → Color[] for each product.
  const products = (productsRes.data ?? []).map((p) => {
    const joined = (p.colors ?? []) as Array<{ color: Color | null }>
    return {
      ...p,
      colors: joined.map((c) => c.color).filter((c): c is Color => !!c),
    }
  }) as Product[]

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
    <TiendaClient
      key={`${categoryFilter}|${searchQuery}|${colorParam}|${maxParam}|${sortParam}|${onlyOffers}`}
      initialProducts={products}
      categories={categories}
      colors={colors}
      discounts={discounts}
      initialFilter={categoryFilter}
      initialSearch={searchQuery}
      initialColor={colorParam}
      initialMax={maxParam}
      initialSort={sortParam}
      initialOnlyOffers={onlyOffers}
    />
    </>
  )
}
