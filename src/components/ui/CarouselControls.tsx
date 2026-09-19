'use client'

import { useRef } from 'react'
import type { TouchEvent } from 'react'
import { dahila, Icon } from '@/components/ui/Primitives'

// Controles compartidos de los carruseles de la home: reseñas de Google y
// testimonios. Una sola fila debajo de la tarjeta: [‹] puntitos [›].
//
// Por qué así (19/09/2026). En el celular, globals.css le da a todo botón un
// mínimo táctil de 44×44 px. Los puntitos eran botones con fondo de color, así
// que se volvían círculos grises de 44 px: con los 10 testimonios, la fila medía
// 494 px en una pantalla de 390 y se salía por los dos costados. Y las flechas,
// montadas sobre la tarjeta, tapaban el principio y el final de cada línea.
//
// - El área táctil de cada puntito es de 24×24 px, el mínimo de WCAG 2.5.8; el
//   punto que se ve va adentro, así el tamaño táctil no cambia el dibujo.
// - Con más de MAX_TOCABLES ítems, los puntitos solo indican la posición y se
//   navega con las flechas (44 px en el celular): diez áreas de 24 px no entran
//   en la pantalla más angosta sin apretarse.
// - Las flechas van a los costados de los puntitos, fuera del texto.
const MAX_TOCABLES = 5
const PUNTO = 7
const PUNTO_ACTIVO = 18

interface Props {
  total: number
  actual: number
  onAnterior: () => void
  onSiguiente: () => void
  onIr: (i: number) => void
  /** Etiquetas accesibles, con el sustantivo de cada carrusel. */
  labels: { anterior: string; siguiente: string; ir: (n: number) => string }
}

function Flecha({ dir, label, onClick }: { dir: 'left' | 'right'; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label={label}
      style={{
        flexShrink: 0, width: 40, height: 40, borderRadius: 999, cursor: 'pointer',
        background: '#fff', border: `1px solid ${dahila.border}`, color: dahila.ink700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      }}>
      <Icon name={dir === 'left' ? 'caret-left' : 'caret-right'} size={14} />
    </button>
  )
}

function Punto({ activo }: { activo: boolean }) {
  return (
    <span aria-hidden style={{
      display: 'block', width: activo ? PUNTO_ACTIVO : PUNTO, height: PUNTO, borderRadius: 999,
      background: activo ? dahila.ink900 : dahila.ink300,
      transition: 'width 220ms ease, background-color 220ms ease',
    }} />
  )
}

export function CarouselControls({ total, actual, onAnterior, onSiguiente, onIr, labels }: Props) {
  if (total <= 1) return null
  const tocables = total <= MAX_TOCABLES
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Flecha dir="left" label={labels.anterior} onClick={onAnterior} />
      <div style={{ display: 'flex', alignItems: 'center', gap: tocables ? 0 : 6 }}>
        {Array.from({ length: total }, (_, i) =>
          tocables ? (
            <button key={i} type="button" className="carousel-dot" onClick={() => onIr(i)}
              aria-label={labels.ir(i + 1)} aria-current={i === actual ? 'true' : undefined}
              style={{
                width: 24, height: 24, padding: 0, border: 'none', background: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
              <Punto activo={i === actual} />
            </button>
          ) : (
            <Punto key={i} activo={i === actual} />
          ),
        )}
      </div>
      <Flecha dir="right" label={labels.siguiente} onClick={onSiguiente} />
    </div>
  )
}

/** Deslizar con el dedo: a la izquierda avanza, a la derecha vuelve. Un toque
 *  o un scroll vertical no cuentan (el gesto tiene que ser claramente lateral). */
export function useSwipe(onSiguiente: () => void, onAnterior: () => void) {
  const inicio = useRef<{ x: number; y: number } | null>(null)
  return {
    onTouchStart: (e: TouchEvent) => {
      const t = e.touches[0]
      inicio.current = t ? { x: t.clientX, y: t.clientY } : null
    },
    onTouchEnd: (e: TouchEvent) => {
      const s = inicio.current
      inicio.current = null
      const t = e.changedTouches[0]
      if (!s || !t) return
      const dx = t.clientX - s.x
      const dy = t.clientY - s.y
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5) return
      if (dx < 0) onSiguiente()
      else onAnterior()
    },
  }
}
