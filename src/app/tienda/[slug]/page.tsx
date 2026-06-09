import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Product, Discount, Color } from '@/lib/types'
import { getPrimaryPhoto, getFinalPrice, resolveDiscountPercent } from '@/lib/types'
import { ProductDetailsClient } from './ProductDetailsClient'
import Link from 'next/link'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data } = await supabase
    .from('products')
    .select('*, media:product_media(*)')
    .eq('slug', slug)
    .maybeSingle()

  const product = data as Product | null

  if (!product) {
    return {
      title: 'Producto no encontrado',
      robots: { index: false, follow: false },
    }
  }

  const photo = getPrimaryPhoto(product)
  const description = product.description || `Comprar ${product.name} a medida en Dahila Crochet.`

  return {
    title: product.name,
    description,
    alternates: {
      canonical: `/tienda/${product.slug}`,
    },
    openGraph: {
      type: 'website',
      title: `${product.name} | Dahila Crochet`,
      description,
      url: `${SITE_URL}/tienda/${product.slug}`,
      images: [photo],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Dahila Crochet`,
      description,
      images: [photo],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const [{ data }, { data: discountData }, { data: settingsData }] = await Promise.all([
    supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        media:product_media(*),
        sizes:product_sizes(*),
        colors:product_colors(*, color:colors(*))
      `)
      .eq('slug', slug)
      .maybeSingle(),
    supabase.from('discounts').select('*').eq('active', true),
    supabase.from('site_settings').select('key, value').in('key', [
      'size_guide_note', 'contact_whatsapp_url', 'shipping_estimate',
      'pdp_trust_1', 'pdp_trust_2', 'pdp_trust_3',
      'maker_name', 'maker_bio', 'maker_photo_url',
      'installments_enabled', 'installments_label',
    ]),
  ])

  const product = data as Product | null
  // Flatten the joined product_colors → Color[] (mirrors the store query).
  if (product) {
    const joined = (product.colors ?? []) as unknown as Array<{ color: Color | null }>
    product.colors = joined.map((c) => c.color).filter((c): c is Color => !!c)
  }
  const discounts = (discountData ?? []) as Discount[]
  const sizeGuideNote = (settingsData ?? []).find((r) => r.key === 'size_guide_note')?.value as string | undefined
  const whatsappUrl = ((settingsData ?? []).find((r) => r.key === 'contact_whatsapp_url')?.value as string | undefined) || 'https://wa.me/59894605015'
  const shippingEstimate = (settingsData ?? []).find((r) => r.key === 'shipping_estimate')?.value as string | undefined
  const getSetting = (k: string) => (settingsData ?? []).find((r) => r.key === k)?.value as string | undefined
  const trustItems = [
    { icon: 'truck', text: getSetting('pdp_trust_1')?.trim() || 'Envío a todo Uruguay' },
    { icon: 'hand-heart', text: getSetting('pdp_trust_2')?.trim() || 'Hecho a mano' },
    { icon: 'whatsapp-logo', text: getSetting('pdp_trust_3')?.trim() || 'Coordinás por WhatsApp' },
  ].filter((t) => t.text.length > 0)

  if (!product) {
    notFound()
  }

  // Related products: same category first, fall back to any active product.
  // Fetched after we know the product so we can filter by its category.
  const { data: relatedData } = await supabase
    .from('products')
    .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*)')
    .eq('status', 'active')
    .neq('id', product.id)
    .order('sort_order', { ascending: true })
    .limit(8)

  const relatedAll = (relatedData ?? []) as Product[]
  const sameCategory = relatedAll.filter((p) => p.category_id && p.category_id === product.category_id)
  const related = (sameCategory.length >= 2 ? sameCategory : relatedAll).slice(0, 4)

  const photo = getPrimaryPhoto(product)
  // Schema.org requires absolute image URLs.
  const absolutePhoto = photo.startsWith('http') ? photo : `${SITE_URL}${photo}`
  // Use the discounted price in structured data so Google shows the real price.
  const finalPrice = getFinalPrice(product, undefined, discounts)
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    image: [absolutePhoto],
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Dahila Crochet',
    },
    ...(product.material ? { material: product.material } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/tienda/${product.slug}`,
      price: finalPrice.toFixed(2),
      priceCurrency: 'UYU',
      availability:
        product.status === 'active'
          ? 'https://schema.org/InStock'
          : product.status === 'soldout'
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
      ...(product.category
        ? [{
            '@type': 'ListItem',
            position: 3,
            name: product.category.name,
            item: `${SITE_URL}/tienda?cat=${product.category.slug}`,
          }]
        : []),
      {
        '@type': 'ListItem',
        position: product.category ? 4 : 3,
        name: product.name,
        item: `${SITE_URL}/tienda/${product.slug}`,
      },
    ],
  }

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Breadcrumbs */}
      <nav className="breadcrumbs hide-mobile" aria-label="Migas de pan">
        <Link href="/">Inicio</Link>
        <span className="breadcrumbs__sep">/</span>
        <Link href="/tienda">Tienda</Link>
        {product.category && (
          <>
            <span className="breadcrumbs__sep">/</span>
            <Link href={`/tienda?cat=${product.category.slug}`}>{product.category.name}</Link>
          </>
        )}
        <span className="breadcrumbs__sep">/</span>
        <span style={{ color: 'var(--fg)' }}>{product.name}</span>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ProductDetailsClient
        product={product}
        discountPercent={resolveDiscountPercent(product, discounts)}
        related={related}
        discounts={discounts}
        sizeGuideNote={sizeGuideNote}
        whatsappUrl={whatsappUrl}
        shippingEstimate={shippingEstimate}
        trustItems={trustItems}
        makerName={getSetting('maker_name') || 'Anush'}
        makerBio={getSetting('maker_bio') || ''}
        makerPhoto={getSetting('maker_photo_url') || ''}
        installmentsEnabled={getSetting('installments_enabled') === 'true'}
        installmentsLabel={getSetting('installments_label') || '¿Querés pagar en 2 cuotas? Hablemos por WhatsApp →'}
      />
    </div>
  )
}
