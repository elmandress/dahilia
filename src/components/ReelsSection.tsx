'use client'

// Reels en el sitio (21/10/2026) — ver lib/reels.ts para el porqué del diseño.
//
// La conversión está en el reproductor: debajo del reel va "Ver la prenda" con
// el precio. Instagram trae 3 de cada 4 visitas, y hasta ahora el camino
// reel → ficha pasaba por la bio. Acá es un toque, y la clienta no sale del
// sitio (el reel se ve en una ventana, no en la app de Instagram).

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { dahila, Icon } from './ui/Primitives'
import { ImagenConRespaldo } from './ui/ImagenConRespaldo'
import { useFocusTrap } from '@/lib/focus-trap'
import { useScrollLock } from '@/lib/scroll-lock'
import { formatPrice, BLUR_DATA_URL } from '@/lib/types'
import { track } from '@/lib/analytics'
import type { ReelCard } from '@/lib/reels'

const ctaStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 18px', borderRadius: 10,
  background: dahila.ink900, color: '#fff', textDecoration: 'none', flexShrink: 0,
  fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
}

/** Ventana con el reproductor de Instagram + el camino a la ficha. */
export function ReelPlayer({ reel, onClose, source }: { reel: ReelCard | null; onClose: () => void; source: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const open = reel != null
  useFocusTrap(boxRef, open)
  useScrollLock(open)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!reel) return null
  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(31,26,27,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12,
      }}
    >
      <div
        ref={boxRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Reel de ${reel.product.name}`}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative', width: '100%', maxWidth: 400, maxHeight: '100%',
          display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar el reel"
          style={{
            position: 'absolute', top: 8, right: 8, zIndex: 2, width: 44, height: 44, borderRadius: 999,
            border: 'none', background: 'rgba(255,255,255,0.92)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon name="x" size={18} color={dahila.ink900} />
        </button>
        {/* El alto lo pone el propio reproductor de Instagram (encabezado +
            video vertical + pie); 640 px entra en un celular sin cortar el
            video y deja lugar abajo para el botón de la prenda. */}
        <iframe
          src={reel.embedUrl}
          title={`Reel de Instagram: ${reel.product.name}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{ width: '100%', height: 'min(640px, calc(100dvh - 150px))', border: 'none', display: 'block', background: dahila.cream100 }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderTop: `1px solid ${dahila.border}` }}>
          <div style={{ flex: 1, minWidth: 0, fontFamily: dahila.fontSans, lineHeight: 1.3 }}>
            <div style={{ fontSize: 14, color: dahila.ink900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{reel.product.name}</div>
            {reel.product.price > 0 && <div style={{ fontSize: 13, color: dahila.ink500 }}>{formatPrice(reel.product.price)}</div>}
          </div>
          {source === 'ficha' ? (
            // Ya está en la ficha: el botón la devuelve a elegir el talle.
            <button type="button" onClick={onClose} style={{ ...ctaStyle, border: 'none', cursor: 'pointer' }}>
              Volver a la ficha
            </button>
          ) : (
            <Link
              href={`/tienda/${reel.product.slug}`}
              onClick={() => { track('reel_to_product', { product: reel.product.slug, source }); onClose() }}
              style={ctaStyle}
            >
              Ver la prenda
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

/** Fila de reels de la home: tarjetas verticales con la foto de la prenda. */
export function ReelsSection({ reels }: { reels: ReelCard[] }) {
  const [open, setOpen] = useState<ReelCard | null>(null)
  if (reels.length === 0) return null
  return (
    <section aria-labelledby="reels-titulo" className="home-section" style={{ maxWidth: 1280, margin: '88px auto 0', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24, paddingBottom: 12, borderBottom: `1px solid ${dahila.border}` }}>
        <h2 id="reels-titulo" style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase', color: dahila.ink900, margin: 0 }}>
          Mirala puesta
        </h2>
        <span style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500 }}>Reels de Instagram</span>
      </div>
      <div className="reels-rail" style={{ display: 'grid', gridAutoFlow: 'column', gridAutoColumns: 'minmax(0, 200px)', gap: 14, overflowX: 'auto', scrollSnapType: 'x mandatory', paddingBottom: 8 }}>
        {reels.map((r) => (
          <div key={r.url} style={{ scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <button
              type="button"
              onClick={() => { track('reel_open', { product: r.product.slug, source: 'home' }); setOpen(r) }}
              aria-label={`Ver el reel de ${r.product.name}`}
              style={{ position: 'relative', aspectRatio: '9 / 16', width: '100%', border: 'none', padding: 0, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: dahila.cream100 }}
            >
              {r.product.photo && (
                <ImagenConRespaldo
                  slug={r.product.slug}
                  src={r.product.photo}
                  alt=""
                  fill
                  // Mismos tamaños y calidad que ProductCard: reusa las
                  // versiones de la foto que ya están en caché.
                  quality={82}
                  sizes="(max-width: 480px) 50vw, (max-width: 720px) 50vw, (max-width: 1280px) 25vw, 280px"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  style={{ objectFit: 'cover' }}
                />
              )}
              <span aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(31,26,27,0) 55%, rgba(31,26,27,0.55) 100%)' }} />
              <span aria-hidden style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: 52, height: 52, borderRadius: 999, background: 'rgba(255,255,255,0.92)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="play" weight="fill" size={22} color={dahila.ink900} />
              </span>
              {r.caption && (
                <span style={{ position: 'absolute', left: 10, right: 10, bottom: 10, textAlign: 'left', fontFamily: dahila.fontSans, fontSize: 12, lineHeight: 1.35, color: '#fff' }}>
                  {r.caption}
                </span>
              )}
            </button>
            <Link href={`/tienda/${r.product.slug}`} onClick={() => track('reel_to_product', { product: r.product.slug, source: 'home_tarjeta' })} style={{ textDecoration: 'none', fontFamily: dahila.fontSans, lineHeight: 1.3, minHeight: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: 13, color: dahila.ink900 }}>{r.product.name}</span>
              {r.product.price > 0 && <span style={{ fontSize: 12, color: dahila.ink500 }}>{formatPrice(r.product.price)}</span>}
            </Link>
          </div>
        ))}
      </div>
      <ReelPlayer reel={open} onClose={() => setOpen(null)} source="home" />
    </section>
  )
}

/** En la ficha: link "Mirala en movimiento" que abre el reel de esa prenda. */
export function ReelLink({ reel }: { reel: ReelCard }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => { track('reel_open', { product: reel.product.slug, source: 'ficha' }); setOpen(true) }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, alignSelf: 'flex-start', minHeight: 44,
          padding: '0 14px', borderRadius: 999, cursor: 'pointer',
          border: `1px solid ${dahila.borderStrong}`, background: '#fff',
          fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink900,
        }}
      >
        <Icon name="play-circle" size={18} color={dahila.wine600} /> Mirala en movimiento
      </button>
      <ReelPlayer reel={open ? reel : null} onClose={() => setOpen(false)} source="ficha" />
    </>
  )
}
