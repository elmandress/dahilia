import { jsonLdScript } from '@/lib/json-ld'
import type { Metadata } from 'next'
import { unstable_rethrow } from 'next/navigation'
import { getCatalog } from '@/lib/catalog'
import { getPrimaryPhoto, getListingPrice, isReadyToShip } from '@/lib/types'
import { botImageUrl } from '@/lib/media'
import { SITE_URL } from '@/lib/env'
import { TiendaClient } from '../TiendaClient'
import { CatalogReadOnlyBanner } from '@/components/CatalogReadOnlyBanner'
import { MaintenanceScreen } from '@/components/MaintenanceScreen'
import { OG_BASE } from '@/lib/og'

export const revalidate = 3600

const TITULO = 'Ropa de crochet hecha a mano en Uruguay'

// El precio de entrada va al principio de la descripción, igual que en las
// fichas y en las categorías desde el 13/09: en Google, un número concreto le
// dice a quien busca si está en su rango antes de entrar. /tienda es la
// segunda página con más impresiones (195 en 28 días al 16/09, posición 4,5)
// y su descripción no tenía ninguno. Si el catálogo no responde, va sin precio.
export async function generateMetadata(): Promise<Metadata> {
  let desde = ''
  try {
    const { products } = await getCatalog()
    const precios = products
      .filter((p) => p.status === 'active' && !p.is_custom_only)
      .map((p) => getListingPrice(p))
      .filter((n) => n > 0)
    if (precios.length) desde = `Desde UYU ${Math.min(...precios).toLocaleString('es-UY')}. `
  } catch (e) {
    unstable_rethrow(e)
  }
  const description = `${desde}Tops, cardigans, bolsos y sets tejidos a mano en Montevideo. Cada pieza se puede pedir en tu talle y tus colores. Envío a todo Uruguay.`
  return {
    title: TITULO,
    description,
    alternates: { canonical: '/tienda' },
    // Foto real (la tarjeta de la home, /og). Hasta el 19/09/2026 /tienda se
    // compartía SIN imagen: su opengraph-image.tsx vivía en un grupo de rutas
    // ((listado)), donde Next le agrega un sufijo a la ruta (/tienda/opengraph-
    // image-nfh255) y no la enlaza en la metadata.
    openGraph: {
      ...OG_BASE,
      title: TITULO,
      description,
      url: '/tienda',
    },
  }
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const categoryFilter = typeof params.cat === 'string' ? params.cat : ''
  const searchQuery = typeof params.q === 'string' ? params.q : ''
  const colorParam = typeof params.color === 'string' ? params.color : ''
  const sizeParam = typeof params.talle === 'string' ? params.talle : ''
  const maxParam = typeof params.max === 'string' ? params.max : ''
  const sortParam = typeof params.sort === 'string' ? params.sort : ''
  const onlyOffers = params.oferta === '1'
  const hideOutOfStock = params.disp === '1'
  const onlyReadyToShip = params.ya === '1'

  // Catálogo con fallback al snapshot estático si la DB está caída (402 de
  // cuota) — el sitio sigue navegable en modo lectura en vez de quedar vacío.
  const { products, categories, colors, discounts, source } = await getCatalog()

  // DB caída y sin snapshot que mostrar → cartel de mantenimiento a pantalla
  // completa (no una tienda vacía). Corre en el render del servidor, así que
  // funciona en producción aunque el proxy no se active en el build.
  if (source === 'snapshot' && products.length === 0) return <MaintenanceScreen />

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
            // Vía botImageUrl (lib/media.ts): esta ItemList tenía la URL
            // cruda de Supabase Storage — Googlebot la recorre en cada
            // rastreo de /tienda (hub, changeFrequency diario), hasta 24
            // fotos originales directo del storage. Misma canilla de egress
            // que el fix de julio tapó en la ficha de producto pero no acá.
            image: botImageUrl(SITE_URL, photo),
            // Mismo precio que la tarjeta y misma disponibilidad que la ficha
            // (auditoría 12/09/2026): antes declaraba InStock para TODO lo
            // activo, y la ficha del mismo producto decía BackOrder.
            offers: {
              '@type': 'Offer',
              price: getListingPrice(p, discounts).toFixed(2),
              priceCurrency: 'UYU',
              availability:
                p.status !== 'active'
                  ? 'https://schema.org/OutOfStock'
                  : isReadyToShip(p)
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/BackOrder',
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
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionJsonLd) }}
      />
    {source === 'snapshot' && <CatalogReadOnlyBanner />}
    <TiendaClient
      conFotoPrimero={source === 'snapshot'}
      key={`${categoryFilter}|${searchQuery}|${colorParam}|${sizeParam}|${maxParam}|${sortParam}|${onlyOffers}|${hideOutOfStock}|${onlyReadyToShip}`}
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
      initialOnlyReadyToShip={onlyReadyToShip}
    />
    </>
  )
}
