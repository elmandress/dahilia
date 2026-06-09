'use client'

import { useState, useEffect, useRef } from 'react'
import { dahila, Eyebrow, Icon } from '@/components/ui/Primitives'

export interface Testimonial {
  id: string
  author: string
  location: string | null
  text: string
  sort_order: number
}

export function TestimonialsStrip({ items }: { items: Testimonial[] }) {
  const [current, setCurrent] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const count = items.length
  const prev = () => setCurrent((c) => (c - 1 + count) % count)
  const next = () => setCurrent((c) => (c + 1) % count)

  // Auto-advance every 5s; pause on manual interaction
  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setCurrent((c) => (c + 1) % count), 5000)
  }

  useEffect(() => {
    if (count > 1) resetTimer()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, count])

  if (count === 0) return null

  const item = items[current]

  return (
    <section style={{ maxWidth: 880, margin: '88px auto 0', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Eyebrow>Lo que dicen</Eyebrow>
      </div>

      <div style={{
        position: 'relative',
        background: dahila.cream50,
        borderRadius: 20,
        padding: 'clamp(32px, 5vw, 52px)',
        textAlign: 'center',
        border: `1px solid ${dahila.border}`,
      }}>
        {/* Quote icon */}
        <div style={{ color: dahila.wine600, marginBottom: 18, display: 'flex', justifyContent: 'center' }}>
          <Icon name="quotes" size={28} color={dahila.wine600} />
        </div>

        {/* Text — fade transition via key change */}
        <blockquote key={item.id} style={{
          fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.65,
          color: dahila.ink900, margin: '0 0 24px',
          maxWidth: 640, marginLeft: 'auto', marginRight: 'auto',
        }}>
          "{item.text}"
        </blockquote>

        <div style={{
          fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
          color: dahila.ink700, letterSpacing: '0.04em',
        }}>
          {item.author}
          {item.location && (
            <span style={{ fontWeight: 300, color: dahila.ink500, marginLeft: 6 }}>
              — {item.location}
            </span>
          )}
        </div>

        {/* Nav arrows — only when multiple testimonials */}
        {count > 1 && (
          <>
            <button
              onClick={() => { prev(); resetTimer() }}
              aria-label="Anterior testimonio"
              style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                background: '#fff', border: `1px solid ${dahila.border}`, borderRadius: 999,
                width: 36, height: 36, cursor: 'pointer', color: dahila.ink700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="caret-left" size={14} />
            </button>
            <button
              onClick={() => { next(); resetTimer() }}
              aria-label="Siguiente testimonio"
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: '#fff', border: `1px solid ${dahila.border}`, borderRadius: 999,
                width: 36, height: 36, cursor: 'pointer', color: dahila.ink700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Icon name="caret-right" size={14} />
            </button>

            {/* Dot indicators */}
            <div style={{
              display: 'flex', gap: 6, justifyContent: 'center', marginTop: 24,
            }}>
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrent(i); resetTimer() }}
                  aria-label={`Ver testimonio ${i + 1}`}
                  style={{
                    width: i === current ? 18 : 7, height: 7, borderRadius: 999,
                    background: i === current ? dahila.ink900 : dahila.ink300,
                    border: 'none', cursor: 'pointer', padding: 0,
                    transition: 'all 220ms ease',
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
