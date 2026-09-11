'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { dahila, Icon } from './ui/Primitives'

/**
 * A small "back to top" button that appears after the visitor scrolls down a
 * long page. Hidden on admin. Subtle and on-brand.
 */
export function BackToTop() {
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname.startsWith('/admin') || pathname === '/ig') return null

  // El guard global de prefers-reduced-motion (globals.css) anula animaciones
  // y transiciones CSS, pero scrollTo({behavior:'smooth'}) es una API nativa
  // del navegador — no la cubre ningún media query CSS, hay que chequearla acá.
  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Volver arriba"
      style={{
        // bottom: 92 apila el botón arriba de WhatsAppFloat (bottom:28, 52px
        // de alto → borde superior en 80) con margen — antes ambos competían
        // por el mismo rincón (bottom:18/44px) y WhatsApp tapaba ~70% de este
        // botón al montarse después en el DOM con el mismo z-index.
        position: 'fixed', right: 18, bottom: 92, zIndex: 40,
        width: 44, height: 44, borderRadius: 999,
        background: 'rgba(255,255,255,0.96)', color: dahila.ink900,
        border: `1px solid ${dahila.border}`, boxShadow: dahila.shadowMd,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        opacity: show ? 1 : 0,
        transform: show ? 'translateY(0)' : 'translateY(10px)',
        pointerEvents: show ? 'auto' : 'none',
        transition: `opacity 200ms ${dahila.ease}, transform 200ms ${dahila.ease}`,
      }}
    >
      <Icon name="caret-up" size={18} />
    </button>
  )
}
