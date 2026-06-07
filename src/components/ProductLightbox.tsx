'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useScrollLock } from '@/lib/scroll-lock'
import { dahila, Icon } from './ui/Primitives'

export interface GalleryImage {
  url: string
  alt: string
}

/**
 * Full-screen image viewer with click-to-zoom, keyboard nav and a thumbnail
 * strip. Loaded on demand (next/dynamic) — it never ships in the initial
 * product-page bundle, only when the shopper opens it.
 */
export default function ProductLightbox({
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

  useScrollLock(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onNav(1)
      else if (e.key === 'ArrowLeft') onNav(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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

      {images.length > 1 && (
        <>
          <button onClick={() => onNav(-1)} aria-label="Anterior" className="lightbox-arrow" style={{ left: 14 }}>
            <Icon name="caret-left" size={22} />
          </button>
          <button onClick={() => onNav(1)} aria-label="Siguiente" className="lightbox-arrow" style={{ right: 14 }}>
            <Icon name="caret-right" size={22} />
          </button>
        </>
      )}

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
