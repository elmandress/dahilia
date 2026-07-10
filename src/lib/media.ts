// Utilidades compartidas de medios (cliente y servidor).
//
// `slugify` vivía copiado en 3 páginas del admin; acá queda la única copia.
// `mediaPath` arma el nombre de archivo del storage con palabras reales:
// Google Images usa el nombre del archivo como señal de relevancia
// (Search Central, "Image SEO best practices") — "top-flower-dahila-crochet-
// ab12.jpg" le dice algo al buscador; "1737271721_x4f2.jpg" no le dice nada.
// Solo afecta subidas nuevas: las fotos existentes conservan su URL.

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function mediaPath(folder: string, hint: string, originalFileName: string): string {
  const ext = (originalFileName.split('.').pop() || 'jpg').toLowerCase()
  const base = slugify(hint).slice(0, 60) || 'foto'
  // Sufijo corto anti-colisión: dos fotos del mismo producto no se pisan.
  const rand = Math.random().toString(36).slice(2, 6)
  return `${folder}/${base}-dahila-crochet-${rand}.${ext}`
}
