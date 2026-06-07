'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { dahila, Icon } from './ui/Primitives'
import { BLUR_DATA_URL } from '@/lib/types'
import type { GalleryImage } from './ProductLightbox'

// The zoom lightbox only renders after the shopper taps the main image — load
// it on demand so it stays out of the product page's first-load JS.
const ProductLightbox = dynamic(() => import('./ProductLightbox'), { ssr: false })

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const safeImages = images.length > 0 ? images : [{ url: '/placeholder-product.svg', alt: productName }]
  const [active, setActive] = useState(0)
  const [lightbox, setLightbox] = useState(false)

  const current = safeImages[Math.min(active, safeImages.length - 1)]

  const go = useCallback(
    (dir: number) => {
      setActive((prev) => {
        const n = safeImages.length
        return ((prev + dir) % n + n) % n
      })
    },
    [safeImages.length]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Main image */}
      <button
        onClick={() => setLightbox(true)}
        aria-label="Ampliar imagen"
        style={{
          position: 'relative',
          aspectRatio: '4/5',
          borderRadius: 12,
          overflow: 'hidden',
          background: dahila.cream50,
          border: 'none',
          padding: 0,
          cursor: 'zoom-in',
          width: '100%',
        }}
      >
        <Image
          src={current.url}
          alt={current.alt || productName}
          fill
          // PDP main image is the LCP element. Next 16 deprecated `priority`;
          // fetchPriority="high" + eager loading is the recommended replacement.
          fetchPriority="high"
          loading="eager"
          quality={90}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 720px) 100vw, 640px"
          style={{ objectFit: 'cover' }}
        />
        <span
          aria-hidden
          style={{
            position: 'absolute', bottom: 12, right: 12,
            width: 36, height: 36, borderRadius: 999,
            background: 'rgba(255,255,255,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: dahila.ink900, boxShadow: dahila.shadowSm,
          }}
        >
          <Icon name="magnifying-glass-plus" size={16} />
        </span>
      </button>

      {/* Thumbnails — only show if more than one */}
      {safeImages.length > 1 && (
        <div
          className="producto-thumbs"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(safeImages.length, 5)}, 1fr)`,
            gap: 10,
          }}
        >
          {safeImages.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
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
              <Image
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
          onChange={setActive}
          onNav={go}
          productName={productName}
        />
      )}
    </div>
  )
}
