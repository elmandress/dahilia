import { getAllArticles } from '@/content/blog'
import { CLUSTER_LABEL } from '@/content/blog/types'
import { SITE_URL } from '@/lib/env'

// RSS de las notas del blog (/blog/feed.xml).
//
// Por qué: Google acepta feeds RSS/Atom como sitemap y, como son chicos, los
// vuelve a leer más seguido que un sitemap entero; recomienda usar los dos
// (Google Search Central, "Best practices for XML sitemaps and RSS/Atom
// feeds"). Es la vía automática para que se entere rápido de una nota nueva:
// la API de indexación no sirve para un blog (ver scripts/index-urls.mjs).
// Se envía a Search Console con `npm run sitemaps`.
//
// Sale del repo (src/content/blog), sin consultar la base.
export const revalidate = 3600

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

// Las notas guardan solo la fecha: se toma el mediodía de Montevideo.
const rfc822 = (isoDate: string) => new Date(`${isoDate}T12:00:00-03:00`).toUTCString()

export function GET() {
  const articles = [...getAllArticles()]
    .sort((a, b) => (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt))
    .slice(0, 30)

  const items = articles
    .map((a) => {
      const url = `${SITE_URL}/blog/${a.slug}`
      return [
        '<item>',
        `<title>${esc(a.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${rfc822(a.publishedAt)}</pubDate>`,
        `<category>${esc(CLUSTER_LABEL[a.cluster])}</category>`,
        `<description>${esc(a.description)}</description>`,
        '</item>',
      ].join('')
    })
    .join('\n')

  const newest = articles[0]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Notas de Dahila Crochet</title>
<link>${SITE_URL}/blog</link>
<atom:link href="${SITE_URL}/blog/feed.xml" rel="self" type="application/rss+xml"/>
<description>Guías sobre cuidado de prendas tejidas, cómo comprar crochet en Uruguay, regalos tejidos a mano y encargos a medida.</description>
<language>es-UY</language>
${newest ? `<lastBuildDate>${rfc822(newest.updatedAt ?? newest.publishedAt)}</lastBuildDate>` : ''}
${items}
</channel>
</rss>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
