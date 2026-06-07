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

  if (pathname.startsWith('/admin')) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
      style={{
        position: 'fixed', right: 18, bottom: 18, zIndex: 40,
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
