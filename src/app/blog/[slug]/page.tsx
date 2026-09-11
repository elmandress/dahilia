import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getAllArticles, getArticle, getRelatedArticles } from '@/content/blog'
import { CLUSTER_LABEL, type Article } from '@/content/blog/types'
import { readingMinutes, tableOfContents } from '@/content/blog/toc'
import { ArticleBody } from '@/components/blog/ArticleBody'
import { ProductCard } from '@/components/ProductCard'
import { getCatalog } from '@/lib/catalog'
import { dahila, Breadcrumb } from '@/components/ui/Primitives'
import { BLUR_DATA_URL } from '@/lib/types'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'
import { botImageUrl } from '@/lib/media'

// Una página estática por nota, generada en el build. El contenido vive en el
// repo, así que no hay ninguna consulta que revalidar: lo único que sale de la
// base son los productos recomendados, y vienen del catálogo ya cacheado.
export const revalidate = 3600

// SIN `dynamicParams = false` a propósito (se sacó el 04/09/2026).
//
// Estaba puesto para que /blog/lo-que-sea respondiera 404 de verdad en vez de
// un soft 404 (hay un loading.tsx en la raíz: el shell sale por streaming con
// status 200 antes de que corra notFound()). Pero en producción las 8 notas
// reales daban 404: los headers mostraban `Cache-Status: "Next.js"; hit` con
// `fwd-status=404`, o sea un 404 GUARDADO en la caché de Next de Netlify —
// mientras los productos tenían guardado un 200. `dynamicParams = false` es la
// única configuración que hace que esta ruta conteste 404 a cualquier path que
// no esté en la lista armada en el build; si la lista que usa el runtime de
// Netlify no coincide (en el deploy o en una revalidación ISR), cada nota cae
// en 404 y ese 404 queda cacheado. Con dynamicParams activo, un slug válido
// siempre se renderiza aunque falte en esa lista.
//
// El soft 404 de un slug inválido queda mitigado igual que en /tienda/[slug]:
// `robots: noindex` en generateMetadata, así Google no indexa la URL basura.
// Es el mismo trade-off, y perder un soft 404 raro es mucho mejor que perder
// el blog entero.

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  // Slug inválido: noindex (ver nota sobre dynamicParams arriba).
  if (!article) return { title: 'Nota no encontrada', robots: { index: false, follow: false } }

  const url = `${SITE_URL}/blog/${article.slug}`
  return {
    title: article.metaTitle ?? article.title,
    description: article.description,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      ...OG_BASE,
      type: 'article',
      title: article.metaTitle ?? article.title,
      description: article.description,
      url,
      publishedTime: article.publishedAt,
      ...(article.updatedAt ? { modifiedTime: article.updatedAt } : {}),
      ...(article.hero
        ? { images: [{ url: botImageUrl(SITE_URL, article.hero.src), alt: article.hero.alt }] }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle ?? article.title,
      description: article.description,
      ...(article.hero ? { images: [botImageUrl(SITE_URL, article.hero.src)] } : {}),
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const toc = tableOfContents(article.body)
  const related = getRelatedArticles(article)
  const products = await pickProducts(article)

  return (
    <article className="blog-article" style={{ maxWidth: 1080, margin: '0 auto', padding: '32px 24px 96px' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />

      <Breadcrumb items={[
        { label: 'Inicio', href: '/' },
        { label: 'Notas', href: '/blog' },
        { label: article.title },
      ]} />

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <header style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 30 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
            fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: dahila.ink500,
          }}>
            <span style={{ color: dahila.wine600 }}>{CLUSTER_LABEL[article.cluster]}</span>
            <span aria-hidden>·</span>
            <span>{readingMinutes(article)} min de lectura</span>
          </div>

          <h1 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300,
            fontSize: 'clamp(30px, 5vw, 46px)', lineHeight: 1.08,
            letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
          }}>
            {article.title}
          </h1>

          <p style={{
            fontFamily: dahila.fontSans, fontSize: 17, fontWeight: 300, lineHeight: 1.7,
            color: dahila.ink700, margin: 0,
          }}>
            {article.excerpt}
          </p>

          <div style={{
            fontFamily: dahila.fontSans, fontSize: 12.5, fontWeight: 300, color: dahila.ink500,
            paddingTop: 6,
          }}>
            Escrito por el taller de Dahila Crochet ·{' '}
            <time dateTime={article.updatedAt ?? article.publishedAt}>
              {formatDate(article.updatedAt ?? article.publishedAt)}
            </time>
          </div>
        </header>

        {article.hero && (
          <div style={{
            position: 'relative', width: '100%', aspectRatio: '16 / 10',
            borderRadius: 18, overflow: 'hidden', background: dahila.cream50,
            marginBottom: 36,
          }}>
            <Image
              src={article.hero.src}
              alt={article.hero.alt}
              fill
              quality={90}
              fetchPriority="high"
              loading="eager"
              sizes="(max-width: 780px) 100vw, 720px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}

        {toc.length > 0 && (
          <nav aria-label="Contenido de la nota" style={{
            background: dahila.cream50, border: `1px solid ${dahila.border}`,
            borderRadius: 16, padding: '20px 24px', marginBottom: 36,
          }}>
            <div style={{
              fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: dahila.ink500, marginBottom: 12,
            }}>
              En esta nota
            </div>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {toc.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`} style={{
                    fontFamily: dahila.fontSans, fontSize: 14.5, fontWeight: 300,
                    lineHeight: 1.5, color: dahila.ink700, textDecoration: 'none',
                  }}>
                    {h.text}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <ArticleBody blocks={article.body} />
      </div>

      {/* Productos reales relacionados. Salen del catálogo cacheado, así que
          esta sección no agrega ni una consulta a la base. Es también el puente
          concreto entre el tráfico orgánico y la tienda. */}
      {products.length > 0 && (
        <section style={{ marginTop: 64, paddingTop: 40, borderTop: `1px solid ${dahila.border}` }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            gap: 16, flexWrap: 'wrap', marginBottom: 26,
          }}>
            <h2 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              color: dahila.ink900, margin: 0,
            }}>
              Del taller a tu placard
            </h2>
            <Link href={article.relatedCategorySlug ? `/tienda/${article.relatedCategorySlug}` : '/tienda'} style={{
              fontFamily: dahila.fontSans, fontSize: 12.5, letterSpacing: '0.06em',
              color: dahila.ink700, textDecoration: 'none',
            }}>
              Ver la tienda →
            </Link>
          </div>
          <div className="product-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22,
          }}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section style={{ marginTop: 64, paddingTop: 40, borderTop: `1px solid ${dahila.border}` }}>
          <h2 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            color: dahila.ink900, margin: '0 0 26px',
          }}>
            Seguir leyendo
          </h2>
          <div className="blog-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 28,
          }}>
            {related.map((r) => (
              <Link key={r.slug} href={`/blog/${r.slug}`} style={{
                display: 'flex', flexDirection: 'column', gap: 8,
                textDecoration: 'none', color: 'inherit', minWidth: 0,
              }}>
                <span style={{
                  fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.14em',
                  textTransform: 'uppercase', color: dahila.wine600,
                }}>
                  {CLUSTER_LABEL[r.cluster]}
                </span>
                <span style={{
                  fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 19,
                  lineHeight: 1.25, color: dahila.ink900,
                }}>
                  {r.title}
                </span>
                <span style={{
                  fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300,
                  lineHeight: 1.6, color: dahila.ink700,
                }}>
                  {r.excerpt}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}

/** Productos recomendados: los declarados en el artículo (respetando el orden)
 *  y, si no alcanzan, se completa con activos de la categoría relacionada. */
async function pickProducts(article: Article) {
  const { products } = await getCatalog()
  const active = products.filter((p) => p.status === 'active')

  const picked = (article.relatedProductSlugs ?? [])
    .map((slug) => active.find((p) => p.slug === slug))
    .filter((p): p is NonNullable<typeof p> => !!p)

  if (picked.length >= 4) return picked.slice(0, 4)

  const fill = active.filter(
    (p) => p.category?.slug === article.relatedCategorySlug && !picked.includes(p)
  )
  return [...picked, ...fill].slice(0, 4)
}

function articleJsonLd(article: Article) {
  const url = `${SITE_URL}/blog/${article.slug}`
  const faqBlocks = article.body.filter(
    (b): b is Extract<typeof b, { type: 'faq' }> => b.type === 'faq'
  )
  const faqItems = faqBlocks.flatMap((b) => b.items)

  const graph: object[] = [
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: article.metaTitle ?? article.title,
      description: article.description,
      inLanguage: 'es-UY',
      datePublished: article.publishedAt,
      dateModified: article.updatedAt ?? article.publishedAt,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      // Autoría a nivel marca: no hay una firma personal en el sitio para las
      // notas, y declarar un autor persona que no existe sería inventar.
      author: { '@type': 'Organization', name: 'Dahila Crochet', url: SITE_URL },
      publisher: {
        '@type': 'Organization',
        name: 'Dahila Crochet',
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/isotype-color.png`, width: 512, height: 512 },
      },
      ...(article.hero
        ? { image: { '@type': 'ImageObject', url: botImageUrl(SITE_URL, article.hero.src) } }
        : {}),
      isPartOf: { '@type': 'Blog', name: 'Notas de Dahila Crochet', url: `${SITE_URL}/blog` },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Notas', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    },
  ]

  if (faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          // El texto va sin las marcas de enlace: el schema describe la
          // respuesta, no el marcado.
          text: f.a.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, ''),
        },
      })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']
  return `${d} de ${MONTHS[m - 1]} de ${y}`
}
