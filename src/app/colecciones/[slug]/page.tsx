import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/public'
import type { Collection, Product, Discount, Color } from '@/lib/types'
import { getFinalPrice } from '@/lib/types'
import { botImageUrl } from '@/lib/media'
import { ProductCard } from '@/components/ProductCard'
import { dahila, Eyebrow, Breadcrumb } from '@/components/ui/Primitives'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'

export const revalidate = 300

// Mismo motivo que tienda/[slug]: sin esto, `params` fuerza dinámico en toda
// la ruta. Colecciones "unlisted" (acceso anticipado VIP) quedan afuera a
// propósito — no se pre-generan, y `dynamicParams` (true por default) las
// sigue sirviendo on-demand para quien tiene el link directo, sin publicarlas.
export async function generateStaticParams() {
  const supabase = createClient()
  // select('*') a propósito, no .eq('unlisted', ...): esa columna depende de
  // una migración (drops-2026-07.sql) que puede no estar corrida — traer todo
  // y filtrar acá tolera una DB sin esa columna (mismo criterio que
  // colecciones/page.tsx y sitemap.ts).
  const { data } = await supabase.from('collections').select('*')
  return (data ?? [])
    .filter((c) => (c as Collection).published && !(c as Collection).unlisted)
    .map((c) => ({ slug: (c as Collection).slug }))
}

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
      ...OG_BASE,
      title: `${data.name} — colección tejida a mano`,
      description: desc,
      url: `${SITE_URL}/colecciones/${slug}`,
      ...(data.cover_url ? { images: [{ url: data.cover_url, alt: data.name }] } : {}),
    },
  }
}

export default async function ColeccionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: col, error: colError } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  // Error de la base ≠ colección inexistente: lanzar mantiene la versión ISR
  // cacheada viva en vez de reemplazarla por un 404 (mismo patrón que la PDP).
  if (colError) throw new Error(`Supabase falló al cargar /colecciones/${slug}: ${colError.message}`)
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
    // Vía botImageUrl (lib/media.ts) — mismo motivo que el ItemList de abajo:
    // sin esto, Googlebot bajaba la portada original directo de Supabase
    // Storage en cada rastreo de la colección.
    ...(collection.cover_url ? { image: botImageUrl(SITE_URL, collection.cover_url) } : {}),
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
            // Vía botImageUrl: esta ItemList tenía la URL cruda de Supabase
            // Storage — misma canilla de egress que en /tienda y
            // /tienda/[categoría] (ver comentarios ahí).
            ...(img ? { image: botImageUrl(SITE_URL, img) } : {}),
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
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px 80px' }}>
      <Breadcrumb items={[
        { label: 'Inicio', href: '/' },
        { label: 'Colecciones', href: '/colecciones' },
        { label: collection.name },
      ]} />

      {/* Cover / hero band */}
      <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: dahila.cream100, marginBottom: 40 }}>
        {collection.cover_url ? (
          <div className="hero-frame" style={{ position: 'relative', height: 'clamp(260px, 42vh, 420px)' }}>
            <Image src={collection.cover_url} alt={collection.name} fill fetchPriority="high" loading="eager" quality={90} sizes="100vw" style={{ objectFit: 'cover' }} />
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
        <div className="tienda-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22, rowGap: 44 }}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} discounts={discounts} />
          ))}
        </div>
      )}
    </div>
    </>
  )
}
