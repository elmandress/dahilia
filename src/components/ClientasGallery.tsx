import Image from 'next/image'
import Link from 'next/link'
import { dahila } from './ui/tokens'
import { Icon } from './ui/Primitives'
import { BLUR_DATA_URL } from '@/lib/types'
import type { Testimonial } from './TestimonialsStrip'

/**
 * "Clientas con su Dahila" (08/10/2026): fotos reales de clientas usando la
 * prenda, cargadas desde /admin/testimonios (con permiso). Es la prueba
 * social más fuerte para quien llega desde Instagram: una persona real con
 * la pieza puesta. Sin fotos cargadas, no se dibuja nada.
 *
 * Server component: no tiene estado.
 */
export function ClientasGallery({ items, productLinks = {}, title = 'Clientas con su Dahila', compact = false }: {
  items: Testimonial[]
  /** product_id → { name, slug }: cada foto linkea a la prenda que compró. */
  productLinks?: Record<string, { name: string; slug: string }>
  title?: string
  /** En la ficha: menos aire y fotos más chicas. */
  compact?: boolean
}) {
  const withPhoto = items.filter((t) => t.photo_url?.trim())
  if (withPhoto.length === 0) return null

  return (
    <section
      aria-label={title}
      className={compact ? undefined : 'home-section'}
      style={{ maxWidth: 1280, margin: compact ? '48px auto 0' : '88px auto 0', padding: '0 24px' }}
    >
      <h2 style={{
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: dahila.fontDisplay, fontWeight: 300,
        fontSize: compact ? 20 : 22, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: dahila.ink900, margin: '0 0 24px', paddingBottom: 12,
        borderBottom: `1px solid ${dahila.border}`,
      }}>
        <Icon name="camera" size={20} color={dahila.wine600} /> {title}
      </h2>
      <div className="product-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 22,
      }}>
        {withPhoto.slice(0, compact ? 4 : 8).map((t) => {
          const prod = t.product_id ? productLinks[t.product_id] : undefined
          return (
            <figure key={t.id} style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ position: 'relative', aspectRatio: '4 / 5', borderRadius: 12, overflow: 'hidden', background: dahila.cream100 }}>
                <Image
                  src={t.photo_url as string}
                  alt={prod ? `${t.author.trim()} con su ${prod.name}` : `${t.author.trim()} con su prenda Dahila`}
                  fill
                  sizes="(max-width: 720px) 50vw, 300px"
                  quality={82}
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <figcaption style={{ fontFamily: dahila.fontSans, fontSize: 12.5, lineHeight: 1.5, color: dahila.ink700 }}>
                {t.text?.trim() && (
                  <span style={{
                    display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300, fontSize: 14, color: dahila.ink700,
                  }}>“{t.text.trim()}”</span>
                )}
                <span style={{ display: 'block', marginTop: 4, color: dahila.ink500 }}>
                  {t.author.trim()}{t.location?.trim() ? `, ${t.location.trim()}` : ''}
                  {prod && !compact && (
                    <> · <Link href={`/tienda/${prod.slug}`} style={{ color: dahila.wine600 }}>{prod.name}</Link></>
                  )}
                </span>
              </figcaption>
            </figure>
          )
        })}
      </div>
    </section>
  )
}
