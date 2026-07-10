'use client'

import { useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { dahila, Eyebrow, Icon } from './ui/Primitives'
import { BLUR_DATA_URL } from '@/lib/types'
import { subscribeToVipList } from '@/lib/subscribe'

/**
 * Bloque "Próximo drop" del home — la mecánica de expectativa del playbook de
 * drops (/admin/estrategia → Drops), como pieza reutilizable:
 *
 *   - Antes de la fecha: nombre + countdown + teaser + captura VIP
 *     ("lo ves 24 horas antes"). La escasez es real: cada drop es tejido a mano.
 *   - Pasada la fecha: "Ya está online" con CTA a la colección (si está
 *     publicada) o a la tienda.
 *
 * Todo llega de Configuración → "Próximo drop" (site_settings). Sin fecha
 * válida muestra "muy pronto" — nunca un countdown roto.
 */

export interface DropTeaserProps {
  name: string
  /** ISO local ("2026-11-15 10:00"). Inválida/vacía → sin countdown. */
  dateIso: string
  teaser: string
  imageUrl: string
  /** Link a la colección, solo si el server confirmó que está publicada. */
  collectionHref: string | null
}

function parseDropDate(iso: string): number | null {
  if (!iso.trim()) return null
  const t = new Date(iso.trim().replace(' ', 'T')).getTime()
  return Number.isFinite(t) ? t : null
}

/** Días/horas/minutos restantes, en el idioma del resto del sitio. */
function remaining(target: number, now: number): { d: number; h: number; m: number } | null {
  const diff = target - now
  if (diff <= 0) return null
  const d = Math.floor(diff / 86_400_000)
  const h = Math.floor((diff % 86_400_000) / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return { d, h, m }
}

function VipCapture() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await subscribeToVipList(email, 'drop')
      if (res.ok) {
        setDone(res.already ? 'Ya estabas en la lista — lo vas a ver primero.' : '¡Lista! Lo vas a ver 24 horas antes que el resto.')
      } else {
        setError(res.error || 'No pudimos anotarte. Probá de nuevo.')
      }
    })
  }

  if (done) {
    return (
      <p role="status" style={{
        fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400,
        color: dahila.wine600, margin: 0,
      }}>{done}</p>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="email"
          required
          placeholder="tu@correo.uy"
          aria-label="Tu email para ver el drop antes"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, color: dahila.ink900,
            background: 'transparent', border: 'none',
            borderBottom: `1px solid ${dahila.borderStrong}`,
            padding: '10px 0 8px', minWidth: 200, flex: '1 1 auto',
          }}
        />
        <button
          type="submit"
          disabled={isPending}
          style={{
            fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            background: dahila.ink900, color: '#fff', border: 'none',
            borderRadius: 8, padding: '12px 18px', cursor: isPending ? 'wait' : 'pointer',
            opacity: isPending ? 0.7 : 1, whiteSpace: 'nowrap',
          }}
        >
          {isPending ? 'Anotando…' : 'Verlo 24 h antes'}
        </button>
      </div>
      {error && (
        <span role="alert" style={{ fontFamily: dahila.fontSans, fontSize: 12, color: '#B6314A' }}>
          {error}
        </span>
      )}
    </form>
  )
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 54 }}>
      <span style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(26px, 4vw, 36px)',
        lineHeight: 1.1, color: dahila.ink900, fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
      <span style={{
        fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: dahila.ink500,
      }}>{label}</span>
    </div>
  )
}

export function DropTeaser({ name, dateIso, teaser, imageUrl, collectionHref }: DropTeaserProps) {
  const target = parseDropDate(dateIso)
  // El countdown solo existe en el cliente (el HTML del server mostraría una
  // cuenta congelada y distinta → mismatch). Hasta montar: guiones.
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    // Sincronizar con el reloj real es exactamente el caso de uso de un efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const left = target && now ? remaining(target, now) : null
  const isLive = target !== null && now !== null && now >= target

  return (
    <section className="home-section" aria-label={`Próximo drop: ${name}`} style={{ maxWidth: 1280, margin: '88px auto 0', padding: '0 24px' }}>
      <div className="home-banner" style={{
        display: 'grid', gridTemplateColumns: imageUrl ? '1fr 1.1fr' : '1fr',
        background: dahila.cream100, borderRadius: 20, overflow: 'hidden',
        alignItems: 'stretch', border: `1px solid ${dahila.border}`,
      }}>
        {imageUrl && (
          <div className="home-banner-img" style={{ position: 'relative', minHeight: 300 }}>
            <Image
              src={imageUrl}
              alt={`Adelanto del drop ${name}`}
              fill
              sizes="(max-width: 720px) 100vw, 600px"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div style={{
          padding: 'clamp(32px, 5vw, 56px)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16,
        }}>
          <Eyebrow>{isLive ? 'Ya está online' : 'Próximo drop'}</Eyebrow>
          <h2 style={{
            fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(28px, 4vw, 42px)',
            lineHeight: 1.08, letterSpacing: '-0.02em', color: dahila.ink900, margin: 0,
          }}>{name}</h2>

          {!isLive && (
            left ? (
              <div aria-live="off" style={{ display: 'flex', gap: 'clamp(14px, 3vw, 28px)', alignItems: 'flex-start' }}>
                <CountdownUnit value={left.d} label={left.d === 1 ? 'día' : 'días'} />
                <CountdownUnit value={left.h} label="horas" />
                <CountdownUnit value={left.m} label="min" />
              </div>
            ) : (
              <span style={{
                fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
                fontSize: 18, color: dahila.ink700,
              }}>Muy pronto.</span>
            )
          )}

          {teaser && (
            <p style={{
              fontFamily: dahila.fontSans, fontSize: 15, fontWeight: 300, lineHeight: 1.7,
              color: dahila.ink700, margin: 0, maxWidth: 460,
            }}>{teaser}</p>
          )}

          {isLive ? (
            <div style={{ marginTop: 4 }}>
              <Link
                href={collectionHref || '/tienda'}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: dahila.ink900, color: '#fff', textDecoration: 'none',
                  borderRadius: 10, padding: '13px 22px',
                  fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                {collectionHref ? 'Ver la colección' : 'Ver la tienda'}
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 440 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700,
              }}>
                <Icon name="heart" size={14} color={dahila.wine600} />
                Cantidades chicas — es tejido a mano. La lista VIP compra primero.
              </span>
              <VipCapture />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
