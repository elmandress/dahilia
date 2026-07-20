import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Product, Category, Discount } from '@/lib/types'
import { getPrimaryPhoto, getFinalPrice, resolveDiscountPercent } from '@/lib/types'
import { getCatalog, getProductBySlug, getSnapshotData } from '@/lib/catalog'
import { ProductDetailsClient } from './ProductDetailsClient'
import { CatalogReadOnlyBanner } from '@/components/CatalogReadOnlyBanner'
import { getEncargosCuposState } from '@/components/EncargosDisponibles'
import { TiendaClient } from '../TiendaClient'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'
import { botImageUrl } from '@/lib/media'
import { COMPLEMENT_PREFS } from '@/lib/complements'

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
  // DB caída: resolver el slug contra el snapshot para que la tienda siga
  // navegable en modo lectura (si no, cada URL daría 404).
  if (catRes.error || prodRes.error) {
    const snap = getSnapshotData()
    const cat = snap.categories.find((c) => c.slug === slug)
    if (cat) return { type: 'category' as const, category: cat }
    if (snap.products.some((p) => p.slug === slug)) return { type: 'product' as const }
    return null
  }
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

  // Try category first (con fallback al snapshot si la DB está caída).
  const { data: catData, error: catErr } = await supabase
    .from('categories')
    .select('name, description')
    .eq('slug', slug)
    .maybeSingle()

  let cat = catData as { name: string; description: string | null } | null
  if (catErr) {
    const snapCat = getSnapshotData().categories.find((c) => c.slug === slug)
    cat = snapCat ? { name: snapCat.name, description: snapCat.description } : null
  }

  if (cat) {
    // CTR: keyword exacto ("cardigans de crochet") + beneficio concreto en la
    // descripción — no una definición de la página. Backlinko (4M resultados):
    // el keyword exacto en el title rinde +24% de clicks que una variante.
    const title = `${cat.name} de crochet, tejidos a mano`
    const desc =
      cat.description ||
      `${cat.name} hechos a mano en Montevideo, en tu talle y tus colores. Precios claros, envío a todo Uruguay — y si querés algo distinto, se teje a medida para vos.`
    return {
      title,
      description: desc,
      alternates: { canonical: `/tienda/${slug}` },
      // og:title sin "| Dahila Crochet": la marca ya viaja en og:site_name
      // (OG_BASE) y duplicarla desperdicia los ~65 caracteres del preview.
      openGraph: {
        ...OG_BASE,
        title,
        description: desc,
        url: `${SITE_URL}/tienda/${slug}`,
        images: [{ url: `${SITE_URL}/tienda/${slug}/og`, width: 1200, height: 630, alt: title, type: 'image/jpeg' }],
      },
      // Twitter explícito: sin esto, la página HEREDA el twitter:title genérico
      // del layout y la twitter-image de la SECCIÓN /tienda (la convención de
      // archivo cascadea a los segmentos hijos) — en X/Discord/Slack la
      // categoría compartida mostraba la tarjeta genérica de la tienda.
      twitter: {
        card: 'summary_large_image',
        title,
        description: desc,
        images: [`${SITE_URL}/tienda/${slug}/og`],
      },
    }
  }

  // Try product (con fallback al snapshot si la DB está caída).
  const { data, error: prodErr } = await supabase
    .from('products')
    .select('*, media:product_media(*)')
    .eq('slug', slug)
    .maybeSingle()

  let product = data as Product | null
  if (prodErr) product = getSnapshotData().products.find((p) => p.slug === slug) ?? null
  if (!product) return { title: 'Producto no encontrado', robots: { index: false, follow: false } }

  // CTR de la ficha: el title lleva el diferencial ("tejido a mano, a tu
  // medida") y la descripción VENDE — precio incluido cuando existe (los
  // estudios de e-commerce coinciden: precio/beneficio en el snippet trae
  // clicks calificados; la genérica "Comprar X" no le da razones a nadie).
  // getFinalPrice sin reglas de lote: el precio exacto ya viaja en el schema.
  const finalPrice = getFinalPrice(product)
  const priceBit = finalPrice > 0 ? `UYU ${finalPrice.toLocaleString('es-UY')}, ` : ''
  const valueLine = `Tejido a mano en Montevideo — ${priceBit}a tu talle y en tus colores. Envío a todo Uruguay.`
  const ownDesc = (product.description ?? '').replace(/\s+/g, ' ').trim()
  const ownDescCut = ownDesc.length > 90 ? `${ownDesc.slice(0, 87).trimEnd()}…` : ownDesc
  const description = ownDesc
    ? `${ownDescCut}${/[.!?…]$/.test(ownDescCut) ? '' : '.'} ${valueLine}`
    : `${product.name}: ${valueLine}`

  return {
    title: `${product.name} — tejido a mano, a tu medida`,
    description,
    alternates: { canonical: `/tienda/${product.slug}` },
    // La imagen para compartir es la tarjeta JPEG de ./og (ver og/route.tsx:
    // la convención opengraph-image.tsx generaba un PNG de ~915 KB que
    // WhatsApp descartaba). X/Twitter cae solo al og:image cuando no hay
    // twitter:image propio.
    openGraph: {
      ...OG_BASE,
      title: `${product.name} — tejido a mano, a tu medida`,
      description,
      url: `${SITE_URL}/tienda/${product.slug}`,
      images: [{
        url: `${SITE_URL}/tienda/${product.slug}/og`,
        width: 1200,
        height: 630,
        alt: `${product.name} — Dahila Crochet`,
        type: 'image/jpeg',
      }],
    },
    // Twitter explícito — mismo motivo que en la rama de categoría: sin esto,
    // X/Discord/Slack mostraban el título del layout y la twitter-image de
    // /tienda en vez de la foto y el precio de ESTE producto.
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} — tejido a mano, a tu medida`,
      description,
      images: [`${SITE_URL}/tienda/${product.slug}/og`],
    },
  }
}

// ─── Category view ───────────────────────────────────────────────────────────

async function CategoryPage({ slug, category }: { slug: string; category: Category }) {
  const supabase = await createClient()

  // Catálogo con fallback al snapshot si la DB está caída (ver src/lib/catalog.ts).
  const { products, categories, colors, discounts, source } = await getCatalog(supabase)

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
      {source === 'snapshot' && <CatalogReadOnlyBanner />}
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

  // Producto con fallback al snapshot si la DB está caída (ver src/lib/catalog.ts).
  const { product, source } = await getProductBySlug(supabase, slug)

  // Distinguir "no existe" de "la base falló": si la consulta EN VIVO dice que
  // no está → 404 real. Si la base falló y el snapshot tampoco lo tiene → lanzar
  // (5xx transitorio): así ISR/Google reintentan y no desindexan la ficha.
  if (!product) {
    if (source === 'snapshot') {
      throw new Error(`Supabase caído y sin snapshot para /tienda/${slug}`)
    }
    notFound()
  }

  const isSnapshot = source === 'snapshot'

  // Descuentos, settings y relacionados: en vivo desde la DB; en modo lectura
  // (snapshot), desde el snapshot — sin volver a pegarle a la base caída.
  let discounts: Discount[]
  let settings: Record<string, string>
  let relatedAll: Product[]
  if (isSnapshot) {
    const snap = getSnapshotData()
    discounts = snap.discounts
    settings = snap.settings
    relatedAll = snap.products.filter((p) => p.status === 'active' && p.id !== product.id).slice(0, 24)
  } else {
    const [{ data: discountData }, { data: settingsData }, { data: relatedData }] = await Promise.all([
      supabase.from('discounts').select('*').eq('active', true),
      supabase.from('site_settings').select('key, value').in('key', [
        'size_guide_note', 'contact_whatsapp_url', 'shipping_estimate',
        'queue_note_enabled', 'queue_note_text',
        'pdp_trust_1', 'pdp_trust_2', 'pdp_trust_3',
        'maker_name', 'maker_bio', 'maker_photo_url',
        'pdp_process_enabled',
        'pdp_process_step_1_icon', 'pdp_process_step_1_label', 'pdp_process_step_1_body',
        'pdp_process_step_2_icon', 'pdp_process_step_2_label', 'pdp_process_step_2_body',
        'pdp_process_step_3_icon', 'pdp_process_step_3_label', 'pdp_process_step_3_body',
        'encargos_cupos_enabled', 'encargos_cupos_total', 'encargos_cupos_taken', 'encargos_cupos_label',
      ]),
      supabase
        .from('products')
        .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*)')
        .eq('status', 'active')
        .neq('id', product.id)
        .order('sort_order', { ascending: true })
        .limit(24),
    ])
    discounts = (discountData ?? []) as Discount[]
    settings = ((settingsData ?? []) as Array<{ key: string; value: string }>)
      .reduce<Record<string, string>>((acc, r) => ({ ...acc, [r.key]: String(r.value ?? '') }), {})
    relatedAll = (relatedData ?? []) as Product[]
  }

  const getSetting = (k: string): string | undefined => settings[k]
  const sizeGuideNote = getSetting('size_guide_note')
  const whatsappUrl = getSetting('contact_whatsapp_url') || 'https://wa.me/59899850073'
  const shippingEstimate = getSetting('shipping_estimate')
  // Aviso de lista de espera (misma semántica que el layout: ON salvo 'false').
  const queueNote = getSetting('queue_note_enabled') !== 'false' ? (getSetting('queue_note_text') ?? '').trim() : ''
  const trustItems = [
    { icon: 'truck',         text: getSetting('pdp_trust_1')?.trim() || 'Envío a todo Uruguay' },
    { icon: 'hand-heart',    text: getSetting('pdp_trust_2')?.trim() || 'Hecho a mano' },
    { icon: 'whatsapp-logo', text: getSetting('pdp_trust_3')?.trim() || 'Coordinás por WhatsApp' },
  ].filter((t) => t.text.length > 0)
  const encargosCupos = getEncargosCuposState({
    encargos_cupos_enabled: getSetting('encargos_cupos_enabled') || '',
    encargos_cupos_total: getSetting('encargos_cupos_total') || '',
    encargos_cupos_taken: getSetting('encargos_cupos_taken') || '',
    encargos_cupos_label: getSetting('encargos_cupos_label') || '',
  })

  // "Completá el look": otro top al lado de un top compite por la misma venta;
  // un bolso o un accesorio al lado de un top la agranda. Por eso la fila mezcla
  // 2 piezas que COMPLEMENTAN (otra categoría, priorizando los pares que se usan
  // juntos y la misma colección) + 2 similares para quien busca alternativas.
  const prefs = COMPLEMENT_PREFS[product.category?.slug ?? ''] ?? []
  const prefRank = (p: Product) => {
    const i = prefs.indexOf(p.category?.slug ?? '')
    return i === -1 ? prefs.length : i
  }
  const complements = relatedAll
    .filter((p) => p.category_id && p.category_id !== product.category_id)
    .sort(
      (a, b) =>
        Number(!!b.collection_id && b.collection_id === product.collection_id) -
          Number(!!a.collection_id && a.collection_id === product.collection_id) ||
        prefRank(a) - prefRank(b)
    )
  const similar = relatedAll.filter((p) => p.category_id && p.category_id === product.category_id)
  // La tira del bloque de compra se lleva los 2 mejores complementos; el grid
  // de abajo arma sus 4 con similares + los complementos que siguen, sin
  // repetir lo que la tira ya mostró.
  const lookComplements = complements.slice(0, 2)
  const related = [...similar.slice(0, 2), ...complements.slice(2, 4)]
  for (const p of relatedAll) {
    if (related.length >= 4) break
    if (!related.some((r) => r.id === p.id) && !lookComplements.some((c) => c.id === p.id)) related.push(p)
  }

  const photo = getPrimaryPhoto(product)
  // Full image set → richer Product structured data (Google can show several).
  // Vía /_next/image (botImageUrl): Googlebot-Image descarga ~100 KB desde
  // dahila.uy en vez del original de varios MB desde supabase.co — el JSON-LD
  // era una de las 3 canillas del egress de Supabase (ver lib/media.ts).
  const galleryImages = (product.media ?? [])
    .filter((m) => m.type === 'image')
    .map((m) => botImageUrl(SITE_URL, m.url))
  const schemaImages = galleryImages.length > 0 ? galleryImages : [botImageUrl(SITE_URL, photo)]
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
    // Sin `mpn`: son piezas hechas a mano, una por una — no existe un número
    // de parte de fabricante real, y reusar el UUID interno ahí es dato
    // de relleno que Google no puede aprovechar. `sku` (el id interno) alcanza.
    sku: product.id,
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
      // Merchant listings: destino + tiempos. El "handling" es el tejido de la
      // pieza (semanas del producto → días); el tránsito es el courier en UY.
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'UY' },
        ...(product.lead_time_weeks_min > 0 || product.lead_time_weeks_max > 0
          ? {
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: (product.lead_time_weeks_min || product.lead_time_weeks_max) * 7,
                  maxValue: (product.lead_time_weeks_max || product.lead_time_weeks_min) * 7,
                  unitCode: 'DAY',
                },
                transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3, unitCode: 'DAY' },
              },
            }
          : {}),
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
    <div style={{ paddingBottom: '4rem' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      {isSnapshot && <CatalogReadOnlyBanner waUrl={whatsappUrl} />}

      <ProductDetailsClient
        product={product}
        discountPercent={resolveDiscountPercent(product, discounts)}
        related={related}
        lookComplements={lookComplements}
        discounts={discounts}
        sizeGuideNote={sizeGuideNote}
        whatsappUrl={whatsappUrl}
        shippingEstimate={shippingEstimate}
        queueNote={queueNote}
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
        encargosCupos={encargosCupos}
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
