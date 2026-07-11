import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { createClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/env'
import { botImageUrl } from '@/lib/media'

// Tarjeta social de la HOME — la URL que más se comparte (bio de Instagram,
// "mirá esta tienda"). Antes og:image era el logo sobre crema: correcto de
// marca, pero un preview con la foto real del hero vende una prenda, no un
// isotipo. Mismo pipeline que /tienda/[slug]/og: Satori → JPEG q82 (WhatsApp
// descarta PNGs pesados) con caché larga en el CDN.
// La usan el layout raíz (openGraph/twitter) y, por herencia, toda página que
// no define su propia imagen (encargo, contacto, términos…).
export async function GET() {
  let heroPhoto: string | null = null
  let tagline = 'Cada prenda se teje especialmente para vos: tu talle, tus colores.'

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['hero_image_url', 'brand_short_intro'])
    const get = (k: string) => (data ?? []).find((r) => r.key === k)?.value as string | undefined
    const rawHero = (get('hero_image_url') ?? '').trim()
    if (rawHero) heroPhoto = botImageUrl(SITE_URL, rawHero, 640)
    const intro = (get('brand_short_intro') ?? '').trim()
    if (intro) tagline = intro
  } catch {
    // Sin base: la tarjeta sale igual, con el hero por defecto.
  }
  if (!heroPhoto) heroPhoto = botImageUrl(SITE_URL, '/photos/top-lace-parque.jpg', 640)

  const card = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#FFFBF2',
          fontFamily: 'sans-serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroPhoto} alt="" width={560} height={630} style={{ objectFit: 'cover' }} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '56px 60px',
          }}
        >
          <div
            style={{
              fontSize: 19,
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: '#8F3B53',
              fontWeight: 600,
            }}
          >
            Dahila Crochet
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div
              style={{
                fontSize: 54,
                lineHeight: 1.06,
                color: '#1F1A1B',
                letterSpacing: '-0.02em',
                fontWeight: 400,
              }}
            >
              Tejido a mano en Uruguay, a tu medida
            </div>
            <div
              style={{
                fontSize: 22,
                lineHeight: 1.45,
                color: '#4A4143',
                fontWeight: 300,
                display: 'flex',
              }}
            >
              {tagline.length > 120 ? `${tagline.slice(0, 120).replace(/\s+\S*$/, '')}…` : tagline}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 19,
              color: '#4A4143',
              borderTop: '1px solid rgba(31,26,27,0.12)',
              paddingTop: 24,
            }}
          >
            {'Tops · cardigans · bolsos · accesorios — envío a todo Uruguay'}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )

  const png = Buffer.from(await card.arrayBuffer())
  const jpg = await sharp(png).jpeg({ quality: 82, progressive: true }).toBuffer()
  return new Response(new Uint8Array(jpg), {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
