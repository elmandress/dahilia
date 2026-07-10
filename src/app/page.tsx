import { createClient } from '@/lib/supabase/server'
import type { Product, Discount, Color } from '@/lib/types'
import type { Testimonial } from '@/components/TestimonialsStrip'
import { HomeClient } from './HomeClient'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  const [settingsRes, productsRes, newestRes, discountsRes, testimonialsRes] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(12),
    // Sección "Nuevo" de la home: los últimos productos publicados de verdad
    // (por fecha de alta), no los primeros del orden manual de la tienda.
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(4),
    supabase.from('discounts').select('*').eq('active', true),
    Promise.resolve(
      supabase.from('testimonials').select('*').order('sort_order', { ascending: true })
    ).catch(() => ({ data: [] })),
  ])

  const settings = (settingsRes.data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
    {}
  )

  const normalize = (rows: unknown[]) =>
    rows.map((p) => {
      const row = p as Product & { colors?: Array<{ color: Color | null }> }
      const joined = (row.colors ?? []) as Array<{ color: Color | null }>
      return { ...row, colors: joined.map((c) => c.color).filter((c): c is Color => !!c) }
    }) as Product[]

  const products = normalize(productsRes.data ?? [])
  const newest = normalize(newestRes.data ?? [])
  const discounts = (discountsRes.data ?? []) as Discount[]
  const testimonials = ((testimonialsRes as { data: Testimonial[] | null }).data ?? []) as Testimonial[]

  // Bloque "Próximo drop": si apunta a una colección, el link solo se pasa
  // cuando esa colección está realmente publicada — el teaser nunca puede
  // filtrar una página que todavía da 404.
  let dropCollectionHref: string | null = null
  const dropSlug = (settings.drop_collection_slug ?? '').trim()
  if (settings.drop_enabled !== 'false' && dropSlug) {
    const { data: dropCol } = await supabase
      .from('collections')
      .select('slug, published')
      .eq('slug', dropSlug)
      .maybeSingle()
    if (dropCol?.published) dropCollectionHref = `/colecciones/${dropCol.slug}`
  }

  // FAQPage schema — Google can render FAQ dropdowns in search results.
  const faqItems = [1, 2, 3, 4, 5]
    .map((n) => ({ q: settings[`faq_${n}_q`], a: settings[`faq_${n}_a`] }))
    .filter((f) => f.q?.trim() && f.a?.trim())

  const faqJsonLd = faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  } : null

  // WebSite schema — enables Google SERP search box for the domain.
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dahila Crochet',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/tienda?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }

  // LocalBusiness — shows brand panel in Google with location, contact, links.
  const waUrl = settings.contact_whatsapp_url || 'https://wa.me/59899850073'
  const igUrl = settings.contact_instagram_url || 'https://www.instagram.com/dahila.crochet/'
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ClothingStore'],
    name: 'Dahila Crochet',
    description: settings.brand_short_intro || 'Prendas tejidas a crochet, hechas a mano y a medida, desde Montevideo.',
    url: SITE_URL,
    // ImageObject explícito (no solo la URL) — Google recomienda ancho/alto
    // declarados para el logo del panel de marca; el isotype ya es 512×512.
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/isotype-color.png`, width: 512, height: 512 },
    image: { '@type': 'ImageObject', url: `${SITE_URL}/logo-full.jpg`, width: 1200, height: 630 },
    telephone: settings.contact_whatsapp || '+598 99 850 073',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Montevideo',
      addressCountry: 'UY',
    },
    sameAs: [igUrl, waUrl],
    priceRange: '$$',
    currenciesAccepted: 'UYU',
    // Coherente con lo que el carrito realmente ofrece (CarritoClient.tsx):
    // transferencia o Mercado Pago — nada de "Cash" para piezas hechas a
    // pedido y coordinadas por WhatsApp.
    paymentAccepted: 'Bank Transfer, Mercado Pago',
    openingHours: 'Mo-Fr 09:00-18:00',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <HomeClient products={products} newest={newest} settings={settings} discounts={discounts} testimonials={testimonials} dropCollectionHref={dropCollectionHref} />
    </>
  )
}
