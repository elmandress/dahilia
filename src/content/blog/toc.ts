import type { Article, Block } from './types'

/** Ancla estable a partir del texto del H2. Misma función la usan el índice y
 *  el propio heading, así que nunca pueden quedar desfasados. */
export function headingId(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Índice del artículo, derivado de los H2. Se muestra solo cuando hay
 *  suficientes secciones como para que ayude (con 2 títulos es ruido). */
export function tableOfContents(blocks: Block[]): { id: string; text: string }[] {
  const headings = blocks
    .filter((b): b is Extract<Block, { type: 'h2' }> => b.type === 'h2')
    .map((b) => ({ id: headingId(b.text), text: b.text }))
  return headings.length >= 4 ? headings : []
}

/** Minutos de lectura estimados sobre el texto real de los bloques (200 ppm,
 *  ritmo de lectura habitual en español). Se calcula, no se escribe a mano:
 *  un número inventado en el frontmatter envejece mal apenas se edita la nota. */
export function readingMinutes(article: Article): number {
  const words = blockText(article.body).split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.round(words / 200))
}

/** Todo el texto plano de los bloques — para contar palabras y nada más. */
function blockText(blocks: Block[]): string {
  const chunks: string[] = []
  for (const b of blocks) {
    switch (b.type) {
      case 'p': case 'h2': case 'h3': case 'quote': case 'note':
        chunks.push(b.text); break
      case 'ul': case 'ol':
        chunks.push(b.items.join(' ')); break
      case 'callout':
        chunks.push(b.title ?? '', b.text); break
      case 'steps':
        chunks.push(b.items.map((s) => `${s.title} ${s.text}`).join(' ')); break
      case 'shopCta':
        chunks.push(b.title, b.text); break
      case 'faq':
        chunks.push(b.items.map((f) => `${f.q} ${f.a}`).join(' ')); break
      case 'image':
        chunks.push(b.caption ?? ''); break
    }
  }
  // Las marcas de enlace no son palabras que se lean: [texto](/url) → texto.
  return chunks.join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '')
}
