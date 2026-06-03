import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/lib/types'

export const alt = 'Dahila Crochet'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('name, description, base_price_uyu, media:product_media(url, is_primary)')
    .eq('slug', params.slug)
    .maybeSingle()

  const product = data as (Product & { media?: { url: string; is_primary: boolean }[] }) | null
  const name = product?.name ?? 'Dahila Crochet'
  const desc = product?.description ?? 'Tejido a mano, hecho en Uruguay.'
  const photo =
    product?.media?.find((m) => m.is_primary)?.url ||
    product?.media?.[0]?.url ||
    null

  return new ImageResponse(
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
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photo}
            alt=""
            width={520}
            height={630}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: 520, height: 630, background: '#FAF1DF' }} />
        )}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            gap: 18,
          }}
        >
          <div
            style={{
              fontSize: 18,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: '#8C8285',
            }}
          >
            Dahila Crochet
          </div>
          <div
            style={{
              fontSize: 64,
              lineHeight: 1.05,
              color: '#1F1A1B',
              letterSpacing: '-0.02em',
              fontWeight: 300,
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 22,
              lineHeight: 1.4,
              color: '#4A4143',
              fontWeight: 300,
              display: 'flex',
            }}
          >
            {desc.slice(0, 140)}
          </div>
          {product?.base_price_uyu ? (
            <div
              style={{
                marginTop: 12,
                fontSize: 22,
                color: '#1F1A1B',
                fontWeight: 500,
              }}
            >
              UYU {product.base_price_uyu.toLocaleString('es-UY')}
            </div>
          ) : null}
        </div>
      </div>
    ),
    size
  )
}
