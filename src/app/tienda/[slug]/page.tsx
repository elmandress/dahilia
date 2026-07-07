import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Product, Category, Color, Discount } from '@/lib/types'
import { getPrimaryPhoto, getFinalPrice, resolveDiscountPercent } from '@/lib/types'
import { ProductDetailsClient } from './ProductDetailsClient'
import { TiendaClient } from '../TiendaClient'
import Link from 'next/link'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

/**
 * This single dynamic segment handles two URL shapes:
 *   /tienda/cardigans        → category page (CollectionPage schema, full filter UI)
 *   /tienda/cardigan-merino  → product detail page (Product schema, PDP)
 *
 * Resolution order: check categories first (fast, few rows), then products.
 * If neither matches → 404.
 */
async function resolveSlug(slug: string) {
  const supabase = await createClient()
  const [catRes, prodRes] = await Promise.all([
    supabase.from('categories').select('*').eq('slug', slug).maybeSingle(),
    supabase.from('products').select('slug, status').eq('slug', slug).maybeSingle(),
  ])
  if (catRes.data) return { type: 'category' as const, category: catRes.data as Category }
  if (prodRes.data) return { type: 'product' as const }
  return null
}

export async function generateStaticParams() {
  const supabase = createBrowserClient()
  const [{ data: cats }, { data: prods }] = await Promise.all([
    supabase.from('categories').select('slug'),
    supabase.from('products').select('slug').in('status', ['active', 'soldout']),
  ])
  return [
    ...(cats ?? []).map((c) => ({ slug: c.slug })),
    ...(prods ?? []).map((p) => ({ slug: p.slug })),
  ]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  // Try category first
  const { data: cat } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle()

  if (cat) {
    const desc =
      cat.description ||
      `${cat.name} tejidos a crochet, hechos a mano y a medida en Montevideo. Encontrá tu ${cat.name.toLowerCase()} ideal en Dahila Crochet.`
    return {
      title: cat.name,
      description: desc,
      alternates: { canonical: `/tienda/${slug}` },
      openGraph: { title: `${cat.name} | Dahila Crochet`, description: desc, url: `${SITE_URL}/tienda/${slug}` },
    }
  }

  // Try product
  const { data } = await supabase
    .from('products')
    .select('*, media:product_media(*)')
    .eq('slug', slug)
    .maybeSingle()

  const product = data as Product | null
  if (!product) return { title: 'Producto no encontrado', robots: { index: false, follow: false } }

  const photoRaw = getPrimaryPhoto(product)
  const photoUrl = photoRaw.startsWith('http') ? photoRaw : `${SITE_URL}${photoRaw}`
  const description = product.description || `Comprar ${product.name} a medida en Dahila Crochet.`
  const ogImage = { url: photoUrl, width: 1200, height: 1500, alt: product.name }

  return {
    title: product.name,
    description,
    alternates: { canonical: `/tienda/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} | Dahila Crochet`,
      description,
      url: `${SITE_URL}/tienda/${product.slug}`,
      images: [ogImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Dahila Crochet`,
      description,
      images: [photoUrl],
    },
  }
}

// ─── Category view ───────────────────────────────────────────────────────────

async function CategoryPage({ slug, category }: { slug: string; category: Category }) {
  const supabase = await createClient()

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
  const products = (productsRes.data ?? []).map((p) => {
    const joined = (p.colors ?? []) as Array<{ color: Color | null }>
    return { ...p, colors: joined.map((c) => c.color).filter((c): c is Color => !!c) }
  }) as Product[]

  const categoryProducts = products.filter((p) => p.category?.slug === slug)

  const collectionPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `${category.name} de Dahila Crochet`,
    url: `${SITE_URL}/tienda/${slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
        { '@type': 'ListItem', position: 3, name: category.name, item: `${SITE_URL}/tienda/${slug}` },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: categoryProducts.slice(0, 24).map((p, i) => {
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
              availability: p.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <TiendaClient
        key={`cat:${slug}`}
        initialProducts={products}
        categories={categories}
        colors={colors}
        discounts={discounts}
        initialFilter={slug}
      />
    </>
  )
}

// ─── Product detail view ──────────────────────────────────────────────────────

async function ProductPage({ slug }: { slug: string }) {
  const supabase = await createClient()

  const [{ data }, { data: discountData }, { data: settingsData }] = await Promise.all([
    supabase
      .from('products')
      .select(`
        *,
        category:categories(*),
        collection:collections(*),
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
      'pdp_process_enabled',
      'pdp_process_step_1_icon', 'pdp_process_step_1_label', 'pdp_process_step_1_body',
      'pdp_process_step_2_icon', 'pdp_process_step_2_label', 'pdp_process_step_2_body',
      'pdp_process_step_3_icon', 'pdp_process_step_3_label', 'pdp_process_step_3_body',
    ]),
  ])

  const product = data as Product | null
  if (product) {
    const joined = (product.colors ?? []) as unknown as Array<{ color: Color | null }>
    product.colors = joined.map((c) => c.color).filter((c): c is Color => !!c)
  }
  const discounts = (discountData ?? []) as Discount[]
  const getSetting = (k: string) => (settingsData ?? []).find((r) => r.key === k)?.value as string | undefined
  const sizeGuideNote = getSetting('size_guide_note')
  const whatsappUrl = getSetting('contact_whatsapp_url') || 'https://wa.me/59894605015'
  const shippingEstimate = getSetting('shipping_estimate')
  const trustItems = [
    { icon: 'truck',         text: getSetting('pdp_trust_1')?.trim() || 'Envío a todo Uruguay' },
    { icon: 'hand-heart',    text: getSetting('pdp_trust_2')?.trim() || 'Hecho a mano' },
    { icon: 'whatsapp-logo', text: getSetting('pdp_trust_3')?.trim() || 'Coordinás por WhatsApp' },
  ].filter((t) => t.text.length > 0)

  if (!product) notFound()

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
  const absolutePhoto = photo.startsWith('http') ? photo : `${SITE_URL}${photo}`
  // Full image set → richer Product structured data (Google can show several).
  const galleryImages = (product.media ?? [])
    .filter((m) => m.type === 'image')
    .map((m) => (m.url.startsWith('http') ? m.url : `${SITE_URL}${m.url}`))
  const schemaImages = galleryImages.length > 0 ? galleryImages : [absolutePhoto]
  const finalPrice = getFinalPrice(product, undefined, discounts)

  // Price validity one year out — keeps Google Merchant / rich-results parsing
  // happy without asserting a promo end date the owner didn't set. This is a
  // Server Component that runs per-request (revalidate=3600), so reading the
  // clock here is intentional and safe.
  // eslint-disable-next-line react-hooks/purity
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10)

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    ...(product.description ? { description: product.description } : {}),
    image: schemaImages,
    sku: product.id,
    mpn: product.id,
    brand: { '@type': 'Brand', name: 'Dahila Crochet' },
    ...(product.category ? { category: product.category.name } : {}),
    ...(product.material ? { material: product.material } : {}),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/tienda/${product.slug}`,
      seller: { '@type': 'Organization', name: 'Dahila Crochet', url: SITE_URL },
      price: finalPrice.toFixed(2),
      priceCurrency: 'UYU',
      availability:
        product.status === 'active'
          ? 'https://schema.org/InStock'
          : product.status === 'soldout'
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/PreOrder',
      itemCondition: 'https://schema.org/NewCondition',
      priceValidUntil,
      // Hecho a medida: no se aceptan cambios (coherente con la FAQ del sitio).
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'UY',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      },
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITE_URL}/tienda` },
      ...(product.category
        ? [{ '@type': 'ListItem', position: 3, name: product.category.name, item: `${SITE_URL}/tienda/${product.category.slug}` }]
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
      <nav className="breadcrumbs hide-mobile" aria-label="Migas de pan">
        <Link href="/">Inicio</Link>
        <span className="breadcrumbs__sep">/</span>
        <Link href="/tienda">Tienda</Link>
        {product.category && (
          <>
            <span className="breadcrumbs__sep">/</span>
            {/* Clean category URL — /tienda/cardigans instead of ?cat= */}
            <Link href={`/tienda/${product.category.slug}`}>{product.category.name}</Link>
          </>
        )}
        <span className="breadcrumbs__sep">/</span>
        <span style={{ color: 'var(--fg)' }}>{product.name}</span>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

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
        processEnabled={getSetting('pdp_process_enabled') === 'true'}
        processSteps={[
          { icon: getSetting('pdp_process_step_1_icon') || 'chat-text',  label: getSetting('pdp_process_step_1_label') || 'Escribís',        body: getSetting('pdp_process_step_1_body') || 'Contame qué prenda querés, tu medida y colores favoritos.' },
          { icon: getSetting('pdp_process_step_2_icon') || 'scissors',   label: getSetting('pdp_process_step_2_label') || 'Elegimos juntas', body: getSetting('pdp_process_step_2_body') || 'Te muestro las lanas disponibles y confirmamos todos los detalles.' },
          { icon: getSetting('pdp_process_step_3_icon') || 'needle',     label: getSetting('pdp_process_step_3_label') || 'Te lo tejo',      body: getSetting('pdp_process_step_3_body') || 'Trabajo en tu prenda y te aviso cuando está lista para enviar.' },
        ].filter((s) => s.label.trim())}
      />
    </div>
  )
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export default async function TiendaSlugPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  await searchParams // consumed by TiendaClient via URL state

  const resolved = await resolveSlug(slug)
  if (!resolved) notFound()

  if (resolved.type === 'category') {
    return <CategoryPage slug={slug} category={resolved.category} />
  }
  return <ProductPage slug={slug} />
}
