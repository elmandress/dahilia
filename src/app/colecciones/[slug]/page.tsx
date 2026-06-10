import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Collection, Product, Discount, Color } from '@/lib/types'
import { getFinalPrice } from '@/lib/types'
import { ProductCard } from '@/components/ProductCard'
import { dahila, Eyebrow } from '@/components/ui/Primitives'
import { SITE_URL } from '@/lib/env'

export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('collections').select('name, description, cover_url').eq('slug', slug).eq('published', true).maybeSingle()
  if (!data) return { title: 'Colección' }
  const desc = data.description || `Colección ${data.name} — piezas tejidas a crochet, hechas a mano por Dahila Crochet.`
  return {
    title: data.name,
    description: desc,
    alternates: { canonical: `/colecciones/${slug}` },
    openGraph: {
      title: `${data.name} | Dahila Crochet`,
      description: desc,
      url: `${SITE_URL}/colecciones/${slug}`,
      type: 'website',
      ...(data.cover_url ? { images: [{ url: data.cover_url, alt: data.name }] } : {}),
    },
  }
}

export default async function ColeccionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: col } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!col) notFound()
  const collection = col as Collection

  const [{ data: prodData }, { data: discountData }] = await Promise.all([
    supabase
      .from('products')
      .select('*, category:categories(*), media:product_media(*), sizes:product_sizes(*), colors:product_colors(color:colors(*))')
      .eq('collection_id', collection.id)
      .in('status', ['active', 'soldout'])
      .order('sort_order', { ascending: true }),
    supabase.from('discounts').select('*').eq('active', true),
  ])

  const products = (prodData ?? []).map((p) => {
    const joined = (p.colors ?? []) as Array<{ color: Color | null }>
    return { ...p, colors: joined.map((c) => c.color).filter((c): c is Color => !!c) }
  }) as Product[]
  const discounts = (discountData ?? []) as Discount[]

  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: collection.name,
    description: collection.description || `Colección ${collection.name} — Dahila Crochet.`,
    url: `${SITE_URL}/colecciones/${collection.slug}`,
    ...(collection.cover_url ? { image: collection.cover_url } : {}),
    mainEntity: products.length > 0 ? {
      '@type': 'ItemList',
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => {
        const price = getFinalPrice(p, undefined, discounts)
        const img = (p.media ?? [])[0]?.url ?? ''
        return {
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Product',
            name: p.name,
            url: `${SITE_URL}/tienda/${p.slug}`,
            ...(img ? { image: img } : {}),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'UYU',
              price: price,
              availability: p.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            },
          },
        }
      }),
    } : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
    <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px' }}>
      <nav style={{ display: 'flex', gap: 6, fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 24 }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link>
        <span>/</span>
        <Link href="/colecciones" style={{ color: 'inherit', textDecoration: 'none' }}>Colecciones</Link>
        <span>/</span>
        <span style={{ color: dahila.ink900 }}>{collection.name}</span>
      </nav>

      {/* Cover / hero band */}
      <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: dahila.cream100, marginBottom: 40 }}>
        {collection.cover_url ? (
          <div className="hero-frame" style={{ position: 'relative', height: 'clamp(260px, 42vh, 420px)' }}>
            <Image src={collection.cover_url} alt={collection.name} fill priority sizes="100vw" style={{ objectFit: 'cover' }} />
            <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(31,26,27,0.55), rgba(31,26,27,0) 60%)' }} />
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 'clamp(20px, 4vw, 40px)', color: '#fff' }}>
              <Eyebrow style={{ color: 'rgba(255,255,255,0.85)' }}>Colección</Eyebrow>
              <h1 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 48px)', margin: '6px 0 0', lineHeight: 1.05 }}>{collection.name}</h1>
            </div>
          </div>
        ) : (
          <div style={{ padding: 'clamp(32px, 6vw, 64px)' }}>
            <Eyebrow>Colección</Eyebrow>
            <h1 style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(30px, 5vw, 48px)', margin: '8px 0 0', lineHeight: 1.05, color: dahila.ink900 }}>{collection.name}</h1>
          </div>
        )}
      </div>

      {collection.description && (
        <p style={{ fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(16px, 2.4vw, 20px)', lineHeight: 1.6, color: dahila.ink700, maxWidth: 640, margin: '0 0 44px' }}>
          {collection.description}
        </p>
      )}

      {products.length === 0 ? (
        <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink500 }}>
          Todavía no hay piezas en esta colección. <Link href="/tienda" style={{ color: dahila.wine600 }}>Ver la tienda →</Link>
        </p>
      ) : (
        <div className="tienda-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 22, rowGap: 44 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} discounts={discounts} />
          ))}
        </div>
      )}
    </main>
    </>
  )
}
