import { createClient } from '@/lib/supabase/server'
import type { Product, Discount, Color } from '@/lib/types'
import type { Testimonial } from '@/components/TestimonialsStrip'
import { HomeClient } from './HomeClient'
import { SITE_URL } from '@/lib/env'

export const revalidate = 3600

export default async function Home() {
  const supabase = await createClient()

  const [settingsRes, productsRes, discountsRes, testimonialsRes] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(12),
    supabase.from('discounts').select('*').eq('active', true),
    Promise.resolve(
      supabase.from('testimonials').select('*').order('sort_order', { ascending: true })
    ).catch(() => ({ data: [] })),
  ])

  const settings = (settingsRes.data ?? []).reduce<Record<string, string>>(
    (acc, curr) => ({ ...acc, [curr.key]: curr.value }),
    {}
  )

  const products = (productsRes.data ?? []).map((p) => {
    const joined = (p.colors ?? []) as Array<{ color: Color | null }>
    return { ...p, colors: joined.map((c) => c.color).filter((c): c is Color => !!c) }
  }) as Product[]
  const discounts = (discountsRes.data ?? []) as Discount[]
  const testimonials = ((testimonialsRes as { data: Testimonial[] | null }).data ?? []) as Testimonial[]

  // FAQPage schema — Google can render FAQ dropdowns in search results.
  const faqItems = [1, 2, 3, 4]
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
  const waUrl = settings.contact_whatsapp_url || 'https://wa.me/59894605015'
  const igUrl = settings.contact_instagram_url || 'https://www.instagram.com/dahila.crochet/'
  const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ClothingStore'],
    name: 'Dahila Crochet',
    description: settings.brand_short_intro || 'Prendas tejidas a crochet, hechas a mano y a medida, desde Montevideo.',
    url: SITE_URL,
    logo: `${SITE_URL}/isotype-color.png`,
    image: `${SITE_URL}/logo-full.jpg`,
    telephone: settings.contact_whatsapp || '+598 94 605 015',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Montevideo',
      addressCountry: 'UY',
    },
    sameAs: [igUrl, waUrl],
    priceRange: '$$',
    currenciesAccepted: 'UYU',
    paymentAccepted: 'Cash, Bank Transfer',
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
      <HomeClient products={products} settings={settings} discounts={discounts} testimonials={testimonials} />
    </>
  )
}
