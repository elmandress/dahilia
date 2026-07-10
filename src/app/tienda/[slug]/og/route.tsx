import sharp from 'sharp'
import { renderProductOgCard } from '../og-card'

// La imagen OG del producto, en JPEG. Reemplaza a la convención
// opengraph-image.tsx por dos razones medidas en runtime:
//   1. Peso: Satori solo emite PNG y una foto de tejido en PNG pesaba ~915 KB
//      — WhatsApp descarta imágenes OG así de pesadas y el preview no cargaba.
//      El mismo card en JPEG q82 baja ~10×.
//   2. Velocidad: el crawler de WhatsApp corta a los pocos segundos. Con
//      Cache-Control s-maxage el CDN de Netlify sirve la tarjeta al instante
//      después de la primera visita (y stale-while-revalidate la renueva
//      de fondo cuando cambia el producto).
// generateMetadata (page.tsx) apunta og:image acá.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const card = await renderProductOgCard(slug)
  const png = Buffer.from(await card.arrayBuffer())
  const jpg = await sharp(png).jpeg({ quality: 82, progressive: true }).toBuffer()
  return new Response(new Uint8Array(jpg), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
