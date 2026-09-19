import { jsonLdScript } from '@/lib/json-ld'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getAllArticles, getUsedClusters, getClusterArticles } from '@/content/blog'
import { CLUSTER_LABEL, CLUSTER_INTRO, type Article } from '@/content/blog/types'
import { readingMinutes } from '@/content/blog/toc'
import { dahila, Eyebrow } from '@/components/ui/Primitives'
import { SITE_URL } from '@/lib/env'
import { OG_BASE } from '@/lib/og'
import { BLUR_DATA_URL } from '@/lib/types'
import { getCatalog } from '@/lib/catalog'
import { withHeroOverride } from '@/content/blog/hero'

// El texto vive en el repo (src/content/blog); de la base sale solo la foto de
// portada que se cambie desde /admin/blog, y viene del catálogo ya cacheado.
// El admin revalida al guardar: la hora es solo la red de seguridad.
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Notas sobre crochet, cuidado de prendas y tejido a mano',
  description:
    'Guías sobre cuidado de prendas tejidas, cómo comprar crochet en Uruguay, regalos tejidos a mano y encargos a medida. Escritas por quien teje.',
  // El RSS (feed.xml/route.ts), para lectores de feeds y para que Google lo encuentre.
  alternates: {
    canonical: '/blog',
    types: { 'application/rss+xml': [{ url: '/blog/feed.xml', title: 'Notas de Dahila Crochet' }] },
  },
  openGraph: {
    ...OG_BASE,
    title: 'Notas — Dahila Crochet',
    description:
      'Guías sobre cuidado de prendas tejidas, cómo comprar crochet en Uruguay y encargos a medida.',
    url: `${SITE_URL}/blog`,
  },
}

export default async function BlogIndexPage() {
  const { settings } = await getCatalog()
  const withHero = (a: Article) => withHeroOverride(a, settings)
  const articles = getAllArticles().map(withHero)
  const clusters = getUsedClusters()
  // La destacada es la primera del registro (criterio editorial, no fecha) y
  // se excluye de su sección temática para no aparecer dos veces.
  const lead = articles[0]

  // Blog + ItemList: le dice a Google que esto es un blog y cuáles son sus
  // notas, sin repetir el Article schema que ya publica cada nota.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Notas de Dahila Crochet',
    description:
      'Guías sobre cuidado de prendas tejidas a mano, cómo comprar crochet en Uruguay y encargos a medida.',
    url: `${SITE_URL}/blog`,
    inLanguage: 'es-UY',
    publisher: { '@type': 'Organization', name: 'Dahila Crochet', url: SITE_URL },
    blogPost: articles.map((a) => ({
      '@type': 'BlogPosting',
      headline: a.title,
      url: `${SITE_URL}/blog/${a.slug}`,
      datePublished: a.publishedAt,
      ...(a.updatedAt ? { dateModified: a.updatedAt } : {}),
    })),
  }

  return (
    <div className="blog-page" style={{ maxWidth: 1080, margin: '0 auto', padding: '48px 24px 96px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />

      <header style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 44, maxWidth: 640 }}>
        <Eyebrow>Notas</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 52px)',
          lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
        }}>
          Sobre tejido, cuidado y encargos.
        </h1>
        <p style={{
          fontFamily: dahila.fontSans, fontSize: 16, fontWeight: 300, lineHeight: 1.75,
          color: dahila.ink700, margin: 0,
        }}>
          Lo que contestamos seguido por WhatsApp, escrito con calma: cómo cuidar una prenda
          tejida para que dure, qué mirar antes de comprar crochet y cómo funciona un encargo
          a medida.
        </p>
      </header>

      {/* Nota destacada — la primera del registro (criterio editorial, no fecha). */}
      {lead && <LeadCard article={lead} />}

      {/* El listado va AGRUPADO POR TEMA, no como una grilla mezclada. Con 8
          notas una grilla plana se sostenía; pasando de diez, la lectora ya no
          entiende qué separa una nota de otra (reporte de Mati, 04/09/2026), y
          además se pierde la señal de estructura temática que le sirve a
          Google. La nota destacada de arriba no se repite acá abajo. */}
      {clusters.map((c) => {
        const inCluster = getClusterArticles(c).map(withHero).filter((a) => a.slug !== lead?.slug)
        if (inCluster.length === 0) return null
        return (
          <section key={c} style={{ marginTop: 56 }}>
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6,
              paddingBottom: 18, marginBottom: 26,
              borderBottom: `1px solid ${dahila.border}`,
            }}>
              <h2 style={{
                fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 26,
                lineHeight: 1.2, color: dahila.ink900, margin: 0,
              }}>
                {CLUSTER_LABEL[c]}
              </h2>
              <p style={{
                fontFamily: dahila.fontSans, fontSize: 14.5, fontWeight: 300,
                lineHeight: 1.6, color: dahila.ink500, margin: 0,
              }}>
                {CLUSTER_INTRO[c]}
              </p>
            </div>
            <div className="blog-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 28, rowGap: 40,
            }}>
              {inCluster.map((a) => <ArticleCard key={a.slug} article={a} />)}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function LeadCard({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} className="blog-lead" style={{
      display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
      gap: 36, alignItems: 'center', textDecoration: 'none', color: 'inherit',
      background: dahila.cream50, border: `1px solid ${dahila.border}`,
      borderRadius: 20, overflow: 'hidden',
    }}>
      {article.hero && (
        <div className="blog-lead-img" style={{ position: 'relative', aspectRatio: '4 / 3', minHeight: 260 }}>
          <Image
            src={article.hero.src}
            alt={article.hero.alt}
            fill
            quality={82}
            sizes="(max-width: 860px) 100vw, 560px"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            style={{ objectFit: 'cover', objectPosition: article.hero.position }}
          />
        </div>
      )}
      <div style={{ padding: '32px 34px 32px 8px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <ArticleMeta article={article} />
        <h2 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(24px, 3vw, 32px)',
          lineHeight: 1.15, letterSpacing: '-0.01em', color: dahila.ink900, margin: 0,
        }}>
          {article.title}
        </h2>
        <p style={{
          fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7,
          color: dahila.ink700, margin: 0,
        }}>
          {article.excerpt}
        </p>
        <span style={{
          fontFamily: dahila.fontSans, fontSize: 12.5, letterSpacing: '0.06em',
          color: dahila.ink900, marginTop: 4,
        }}>
          Leer la nota →
        </span>
      </div>
    </Link>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/blog/${article.slug}`} style={{
      display: 'flex', flexDirection: 'column', gap: 10,
      textDecoration: 'none', color: 'inherit', minWidth: 0,
    }}>
      {article.hero && (
        <div style={{
          position: 'relative', aspectRatio: '4 / 3', borderRadius: 14,
          overflow: 'hidden', background: dahila.cream50, marginBottom: 4,
        }}>
          <Image
            src={article.hero.src}
            alt={article.hero.alt}
            fill
            quality={82}
            sizes="(max-width: 720px) 100vw, 340px"
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            style={{ objectFit: 'cover', objectPosition: article.hero.position }}
          />
        </div>
      )}
      <ArticleMeta article={article} />
      <h2 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 20,
        lineHeight: 1.25, color: dahila.ink900, margin: 0,
      }}>
        {article.title}
      </h2>
      <p style={{
        fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.65,
        color: dahila.ink700, margin: 0,
      }}>
        {article.excerpt}
      </p>
    </Link>
  )
}

function ArticleMeta({ article }: { article: Article }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
      fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.14em',
      textTransform: 'uppercase', color: dahila.ink500,
    }}>
      <span style={{ color: dahila.wine600 }}>{CLUSTER_LABEL[article.cluster]}</span>
      <span aria-hidden>·</span>
      <span>{readingMinutes(article)} min</span>
    </div>
  )
}
