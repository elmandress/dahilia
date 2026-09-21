'use client'

import { useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { ImagenConRespaldo } from './ui/ImagenConRespaldo'
import { dahila, Icon } from './ui/Primitives'
import { BLUR_DATA_URL } from '@/lib/types'
import type { GalleryImage } from './ProductLightbox'

// The zoom lightbox only renders after the shopper taps the main image — load
// it on demand so it stays out of the product page's first-load JS.
const ProductLightbox = dynamic(() => import('./ProductLightbox'), { ssr: false })

// La foto principal es un riel con scroll-snap: en el celular se desliza con
// el dedo (antes solo cambiaba tocando las miniaturas, y deslizar la foto no
// hacía nada). Sin librería: el swipe es el scroll nativo del navegador. Las
// miniaturas y el lightbox mueven el riel; el riel actualiza la foto activa.
export function ProductGallery({ images, productName, slug }: { images: GalleryImage[]; productName: string; slug?: string }) {
  const safeImages = images.length > 0 ? images : [{ url: '/placeholder-product.svg', alt: productName }]
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const count = safeImages.length

  // Deslizamiento → foto activa (para el contador y las miniaturas).
  const onScroll = useCallback(() => {
    const el = trackRef.current
    if (!el || el.clientWidth === 0) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    setActive((prev) => (prev === i ? prev : i))
  }, [])

  // Miniatura o lightbox → mueve el riel hasta esa foto.
  const scrollTo = useCallback((i: number) => {
    setActive(i)
    const el = trackRef.current
    if (!el) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: i * el.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [])

  const go = useCallback(
    (dir: number) => scrollTo(((active + dir) % count + count) % count),
    [active, count, scrollTo]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ position: 'relative' }}>
        <div
          ref={trackRef}
          className="pdp-gallery-track"
          onScroll={onScroll}
          role="region"
          aria-label={count > 1 ? `Fotos de ${productName}: deslizá para ver las ${count}` : `Foto de ${productName}`}
          style={{ borderRadius: 12, background: dahila.cream50 }}
        >
          {safeImages.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              className="pdp-gallery-slide"
              onClick={() => { setActive(i); setLightbox(true) }}
              aria-label={count > 1 ? `Ampliar foto ${i + 1} de ${count}` : 'Ampliar imagen'}
              style={{
                position: 'relative', aspectRatio: '4/5',
                background: dahila.cream50, border: 'none', padding: 0, cursor: 'zoom-in',
              }}
            >
              <ImagenConRespaldo
                slug={slug}
                src={img.url}
                alt={img.alt || productName}
                fill
                // La primera foto es el LCP de la ficha. Next 16 deprecó
                // `priority`: fetchPriority="high" + eager es el reemplazo. Las
                // demás cargan cuando se acercan (swipe o miniatura).
                {...(i === 0
                  ? { fetchPriority: 'high' as const, loading: 'eager' as const }
                  : { loading: 'lazy' as const })}
                quality={90}
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
                sizes="(max-width: 720px) 100vw, 640px"
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>

        <span
          aria-hidden
          style={{
            position: 'absolute', bottom: 12, right: 12, pointerEvents: 'none',
            width: 36, height: 36, borderRadius: 999,
            background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: dahila.ink900, boxShadow: dahila.shadowSm,
          }}
        >
          <Icon name="magnifying-glass-plus" size={16} />
        </span>

        {/* Cuántas fotos hay y cuál se está viendo: sin esto, que se puede
            deslizar no se descubre. */}
        {count > 1 && (
          <span
            aria-hidden
            style={{
              position: 'absolute', bottom: 12, left: 12, pointerEvents: 'none',
              background: 'rgba(255,255,255,0.92)', borderRadius: 999, padding: '5px 11px',
              fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500, color: dahila.ink900,
              boxShadow: dahila.shadowSm, fontVariantNumeric: 'tabular-nums',
            }}
          >
            {active + 1} / {count}
          </span>
        )}
      </div>

      {/* Thumbnails — only show if more than one */}
      {count > 1 && (
        <div
          className="producto-thumbs"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(count, 5)}, 1fr)`,
            gap: 10,
          }}
        >
          {safeImages.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => scrollTo(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === active}
              style={{
                position: 'relative',
                aspectRatio: '1/1',
                borderRadius: 8,
                overflow: 'hidden',
                background: dahila.cream50,
                border: i === active ? `2px solid ${dahila.ink900}` : `1px solid ${dahila.border}`,
                padding: 0,
                cursor: 'pointer',
                transition: `border-color 140ms ${dahila.ease}`,
              }}
            >
              <ImagenConRespaldo
                slug={slug}
                src={img.url}
                alt=""
                fill
                quality={82}
                sizes="(max-width: 720px) 22vw, 120px"
                style={{ objectFit: 'cover', opacity: i === active ? 1 : 0.85 }}
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <ProductLightbox
          images={safeImages}
          index={active}
          onClose={() => setLightbox(false)}
          onChange={scrollTo}
          onNav={go}
          productName={productName}
        />
      )}
    </div>
  )
}
