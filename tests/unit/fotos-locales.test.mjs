// Blindaje del egress de Supabase (13/11/2026): las fotos de la tienda se piden
// a /media del propio sitio, nunca a supabase.co. El 12/11/2026 el proyecto
// quedó restringido por tercera vez porque cada foto sin caché en Netlify
// bajaba el original de Supabase.
// Correr: npm run test:unit
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fotoLocal, botImageUrl } from '@/lib/media'

const STORAGE = 'https://abcdefghij.supabase.co/storage/v1/object/public/media'

test('una foto del storage se pide a /media del sitio, con la misma ruta', () => {
  assert.equal(fotoLocal(`${STORAGE}/products/top-flower-dahila-crochet-ab12.jpg`), '/media/products/top-flower-dahila-crochet-ab12.jpg')
  assert.equal(fotoLocal(`${STORAGE}/products/1780769960986_im5hejg0ttb.jpeg`), '/media/products/1780769960986_im5hejg0ttb.jpeg')
  assert.equal(fotoLocal(`${STORAGE}/site/drop-dahila-crochet-eb61.PNG`), '/media/site/drop-dahila-crochet-eb61.PNG')
})

test('lo que no es una foto del storage vuelve intacto', () => {
  for (const url of [
    '/photos/top-lace-parque.jpg',
    '/fotos-respaldo/bandana.jpg',
    '/placeholder-product.svg',
    'https://lh3.googleusercontent.com/a/foto',
    `${STORAGE}/products/video-dahila-crochet-ab12.mp4`,
    `${STORAGE}/products/logo.svg`,
    `${STORAGE}/products/../secreto.jpg`,
    `${STORAGE}/products/foto.jpg?token=1`,
    'https://abcdefghij.supabase.co/storage/v1/object/public/otro-bucket/foto.jpg',
  ]) {
    assert.equal(fotoLocal(url), url)
  }
})

test('lo que consumen los bots tampoco apunta a supabase.co', () => {
  const url = botImageUrl('https://dahila.uy', `${STORAGE}/products/poncho-ete-dahila-crochet-tily.jpg`)
  assert.equal(url, 'https://dahila.uy/_next/image?url=%2Fmedia%2Fproducts%2Fponcho-ete-dahila-crochet-tily.jpg&w=1200&q=82')
  assert.equal(botImageUrl('https://dahila.uy', '/photos/top-lace-parque.jpg'), 'https://dahila.uy/photos/top-lace-parque.jpg')
})

// La guardia: si alguien vuelve a importar next/image directo en la tienda, esa
// foto vuelve a salir de Supabase y nadie se entera hasta el próximo 402.
test('la tienda no usa next/image directo: pasa por components/ui/Foto', () => {
  const src = fileURLToPath(new URL('../../src/', import.meta.url))
  const permitidos = new Set([path.join('components', 'ui', 'Foto.tsx')])
  const culpables = []
  const recorrer = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      const rel = path.relative(src, full)
      if (e.isDirectory()) {
        // El admin muestra la foto del storage tal cual: pocas vistas, y es la fuente.
        if (rel !== path.join('app', 'admin')) recorrer(full)
      } else if (/\.tsx?$/.test(e.name) && !permitidos.has(rel)) {
        if (/from\s+['"]next\/(image|legacy\/image)['"]/.test(readFileSync(full, 'utf8'))) culpables.push(rel)
      }
    }
  }
  recorrer(src)
  assert.deepEqual(culpables, [], 'Importá Image desde @/components/ui/Foto')
})
