'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { dahila, Icon } from './ui/Primitives'

interface GalleryImage {
  url: string
  alt: string
}

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
          priority
          quality={90}
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
        <Lightbox
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

function Lightbox({
  images,
  index,
  onClose,
  onChange,
  onNav,
  productName,
}: {
  images: GalleryImage[]
  index: number
  onClose: () => void
  onChange: (i: number) => void
  onNav: (dir: number) => void
  productName: string
}) {
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const stageRef = useRef<HTMLDivElement>(null)

  // Lock body scroll while open + keyboard nav.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNav(1)
      else if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose, onNav])

  const current = images[index]

  const handleMove = (e: React.MouseEvent) => {
    if (!zoomed || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Galería de ${productName}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(20,16,17,0.92)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 18px', color: '#fff',
      }}>
        <span style={{ fontFamily: dahila.fontSans, fontSize: 12, letterSpacing: '0.08em', opacity: 0.8 }}>
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff',
            width: 40, height: 40, borderRadius: 999, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="x" size={20} />
        </button>
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        onClick={() => setZoomed((z) => !z)}
        onMouseMove={handleMove}
        style={{
          flex: 1, position: 'relative', overflow: 'hidden',
          cursor: zoomed ? 'zoom-out' : 'zoom-in',
          margin: '0 8px',
        }}
      >
        <Image
          src={current.url}
          alt={current.alt || productName}
          fill
          quality={100}
          sizes="100vw"
          style={{
            objectFit: 'contain',
            transform: zoomed ? 'scale(2.2)' : 'scale(1)',
            transformOrigin: `${origin.x}% ${origin.y}%`,
            transition: zoomed ? 'none' : `transform 220ms ${dahila.ease}`,
          }}
        />
      </div>

      {/* Nav arrows (multiple images) */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => onNav(-1)}
            aria-label="Anterior"
            className="lightbox-arrow"
            style={{ left: 14 }}
          >
            <Icon name="caret-left" size={22} />
          </button>
          <button
            onClick={() => onNav(1)}
            aria-label="Siguiente"
            className="lightbox-arrow"
            style={{ right: 14 }}
          >
            <Icon name="caret-right" size={22} />
          </button>
        </>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{
          display: 'flex', gap: 8, justifyContent: 'center',
          padding: '14px 12px calc(env(safe-area-inset-bottom, 0px) + 14px)',
          overflowX: 'auto',
        }}>
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => { onChange(i); setZoomed(false) }}
              aria-label={`Imagen ${i + 1}`}
              style={{
                position: 'relative', flex: '0 0 auto',
                width: 54, height: 54, borderRadius: 6, overflow: 'hidden',
                border: i === index ? '2px solid #fff' : '1px solid rgba(255,255,255,0.3)',
                padding: 0, cursor: 'pointer', background: 'transparent',
              }}
            >
              <Image src={img.url} alt="" fill quality={82} sizes="54px" style={{ objectFit: 'cover', opacity: i === index ? 1 : 0.6 }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
