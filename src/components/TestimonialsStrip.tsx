'use client'

import { useState, useEffect, useRef } from 'react'
import { dahila, Eyebrow, Icon } from '@/components/ui/Primitives'
import { CarouselControls, useSwipe } from '@/components/ui/CarouselControls'

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

  // Auto-advance every 5s; pause on manual interaction. Pero en touch no
  // existe "mouseenter" — nadie puede pausarlo tocando la tarjeta, así que en
  // dispositivos sin hover real (la inmensa mayoría del tráfico) el
  // auto-avance directamente no arranca: queda solo la navegación manual
  // (flechas/puntos), que sí resetea el timer si el dispositivo puede pausar.
  const canAutoAdvance = () =>
    typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(hover: hover)').matches

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!canAutoAdvance()) return
    timerRef.current = setTimeout(() => setCurrent((c) => (c + 1) % count), 5000)
  }
  // Con el cursor encima, la rotación se pausa: que el texto cambie mientras
  // se está leyendo es el anti-patrón clásico de los carruseles automáticos.
  const pauseTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
  }

  useEffect(() => {
    if (count > 1) resetTimer()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, count])

  const swipe = useSwipe(() => { next(); resetTimer() }, () => { prev(); resetTimer() })

  if (count === 0) return null

  const item = items[current]

  return (
    <section className="home-section" style={{ maxWidth: 880, margin: '88px auto 0', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <Eyebrow>Lo que dicen</Eyebrow>
      </div>

      <div
        onMouseEnter={pauseTimer}
        onMouseLeave={() => { if (count > 1) resetTimer() }}
        {...(count > 1 ? swipe : {})}
        style={{
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

        {/* Text — fade transition via key change. Comillas tipográficas y el
            texto recortado: con un espacio al final (así viene "amé su trabajo
            ❤️ "), la comilla de cierre quedaba sola en la línea de abajo. */}
        <blockquote key={item.id} style={{
          fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
          fontSize: 'clamp(16px, 2.5vw, 20px)', lineHeight: 1.65,
          color: dahila.ink900, margin: '0 0 24px',
          maxWidth: 640, marginLeft: 'auto', marginRight: 'auto',
        }}>
          “{item.text.trim()}”
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

      </div>

      {/* Flechas y puntitos debajo de la tarjeta (ver CarouselControls). */}
      <div style={{ marginTop: 16 }}>
        <CarouselControls
          total={count}
          actual={current}
          onAnterior={() => { prev(); resetTimer() }}
          onSiguiente={() => { next(); resetTimer() }}
          onIr={(i) => { setCurrent(i); resetTimer() }}
          labels={{ anterior: 'Testimonio anterior', siguiente: 'Testimonio siguiente', ir: (n) => `Ver testimonio ${n}` }}
        />
      </div>
    </section>
  )
}
