import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { getFinalPrice, getEffectivePrice } from '@/lib/types'
import type { Product } from '@/lib/types'

export const alt = 'Dahila Crochet'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Tarjeta social de producto — el "escaparate" que viaja por WhatsApp e
// Instagram. Diseño tipo Shopify: foto grande a sangre, marca arriba, nombre
// protagonista, precio como chip (con descuento cuando existe) y la promesa
// de la marca al pie. Reglas de Satori: todo div con más de un hijo lleva
// display flex explícito, y el texto interpolado va en un solo template.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  // Next 16: `params` es una Promise también en los archivos de metadata.
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('name, description, base_price_uyu, discount_percent, discount_active, media:product_media(url, is_primary)')
    .eq('slug', slug)
    .maybeSingle()

  const product = data as (Product & { media?: { url: string; is_primary: boolean }[] }) | null

  // El mismo slug también puede ser una categoría (ruta compartida
  // /tienda/[slug]) — sin este fallback, compartir un link de categoría
  // generaba una tarjeta genérica sin foto ni nombre.
  const category = product
    ? null
    : (
        await supabase
          .from('categories')
          .select('name, description')
          .eq('slug', slug)
          .maybeSingle()
      ).data as { name: string; description: string | null } | null

  const name = product?.name ?? category?.name ?? 'Dahila Crochet'
  const desc =
    product?.description ?? category?.description ?? 'Tejido a mano, hecho en Uruguay.'
  const photo =
    product?.media?.find((m) => m.is_primary)?.url ||
    product?.media?.[0]?.url ||
    null

  // Precio final (descuento por producto incluido) + precio de lista tachado
  // cuando hay rebaja — la tarjeta cuenta la oferta sin abrir el link.
  const listPrice = product ? getEffectivePrice(product) : 0
  const finalPrice = product ? getFinalPrice(product) : 0
  const hasDiscount = finalPrice > 0 && finalPrice < listPrice

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
            width={560}
            height={630}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: 560,
              height: 630,
              background: '#FAF1DF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              letterSpacing: '0.24em',
              color: '#C9C2C4',
            }}
          >
            DAHILA
          </div>
        )}
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
                fontSize: name.length > 18 ? 56 : 66,
                lineHeight: 1.04,
                color: '#1F1A1B',
                letterSpacing: '-0.02em',
                fontWeight: 400,
              }}
            >
              {name}
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
              {desc.replace(/\s+/g, ' ').slice(0, 120)}
            </div>
            {finalPrice > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6 }}>
                <div
                  style={{
                    display: 'flex',
                    background: '#1F1A1B',
                    color: '#FFFFFF',
                    fontSize: 26,
                    fontWeight: 600,
                    padding: '12px 26px',
                    borderRadius: 999,
                  }}
                >
                  {`UYU ${finalPrice.toLocaleString('es-UY')}`}
                </div>
                {hasDiscount ? (
                  <div
                    style={{
                      display: 'flex',
                      fontSize: 22,
                      color: '#8C8285',
                      textDecoration: 'line-through',
                    }}
                  >
                    {`UYU ${listPrice.toLocaleString('es-UY')}`}
                  </div>
                ) : null}
              </div>
            ) : null}
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
            {'Tejido a mano en Uruguay · A tu talle y en tus colores'}
          </div>
        </div>
      </div>
    ),
    size
  )
}
