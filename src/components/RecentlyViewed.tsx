'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { dahila } from './ui/Primitives'
import { BLUR_DATA_URL } from '@/lib/types'

export interface RecentItem {
  slug: string
  name: string
  photo: string
  price: number
}

const KEY = 'dahila_recently_viewed'
const MAX = 8

/** Read the recently-viewed list from localStorage (safe on SSR/private mode). */
function readRecent(): RecentItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/**
 * Records the current product into the recently-viewed list and renders the
 * other recent items as a strip. Purely client-side (localStorage) — no backend,
 * no tracking, helps shoppers get back to pieces they were comparing.
 */
export function RecentlyViewed({ current }: { current: RecentItem }) {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    // localStorage is client-only, so this read + setState has to happen in an
    // effect. It runs once per product (current.slug) and reads an external
    // store, which is exactly what effects are for — the cascading-render the
    // lint rule guards against doesn't apply here.
    const prev = readRecent()
    const next = [current, ...prev.filter((p) => p.slug !== current.slug)].slice(0, MAX)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(next.filter((p) => p.slug !== current.slug))
  }, [current])

  if (items.length === 0) return null

  return (
    <section style={{ marginTop: 72 }}>
      <h2 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300,
        fontSize: 22, letterSpacing: '0.08em', textTransform: 'uppercase',
        color: dahila.ink900, margin: '0 0 24px', paddingBottom: 12,
        borderBottom: `1px solid ${dahila.border}`,
      }}>
        Viste hace poco
      </h2>
      <div className="recent-strip" style={{
        display: 'grid', gridAutoFlow: 'column',
        gridAutoColumns: 'minmax(150px, 1fr)',
        gap: 16, overflowX: 'auto', paddingBottom: 6,
        scrollSnapType: 'x proximity',
      }}>
        {items.map((p) => (
          <Link
            key={p.slug}
            href={`/tienda/${p.slug}`}
            style={{ textDecoration: 'none', color: 'inherit', scrollSnapAlign: 'start' }}
          >
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '3 / 4',
              borderRadius: 10, overflow: 'hidden', background: dahila.cream50, marginBottom: 8,
            }}>
              <Image src={p.photo} alt={p.name} fill quality={82} sizes="160px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
            </div>
            <div style={{ fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 14, color: dahila.ink900, lineHeight: 1.2 }}>{p.name}</div>
            {p.price > 0 && (
              <div style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink700, marginTop: 2 }}>
                UYU {p.price.toLocaleString('es-UY')}
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
