'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { dahila, Icon } from './ui/Primitives'

/**
 * Invitación discreta a la red de tejedoras.
 *
 * Diseño según la investigación NN/g sobre popups: NO es un modal — es una
 * tarjeta no-bloqueante abajo a la izquierda (WhatsAppFloat vive a la derecha),
 * aparece recién tras 25 s en el sitio o 60% de scroll (lo que ocurra primero),
 * tiene una X clara, y al cerrarla no vuelve a aparecer por 30 días.
 * Visitar /tejedoras también la silencia (el mensaje ya llegó).
 */
const STORAGE_KEY = 'dahila_weaver_cta'
const SNOOZE_DAYS = 30
const DELAY_MS = 25_000
const SCROLL_TRIGGER = 0.6

function isSnoozed(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false
    const ts = parseInt(raw, 10)
    if (isNaN(ts)) return true
    return Date.now() - ts < SNOOZE_DAYS * 86_400_000
  } catch {
    return true
  }
}

export function WeaverCallout() {
  const pathname = usePathname()
  const router = useRouter()
  const [show, setShow] = useState(false)

  const snooze = () => {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())) } catch { /* modo incógnito */ }
  }

  // Visitar la página de postulación silencia la invitación de forma duradera.
  useEffect(() => {
    if (pathname === '/tejedoras') snooze()
  }, [pathname])

  useEffect(() => {
    if (isSnoozed()) return
    let shown = false
    const reveal = () => {
      if (shown) return
      shown = true
      setShow(true)
    }
    const timer = setTimeout(reveal, DELAY_MS)
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= SCROLL_TRIGGER) reveal()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Solo en la vidriera: nunca en admin, carrito, encargo ni en la propia página.
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/carrito') ||
    pathname.startsWith('/encargo') ||
    pathname.startsWith('/tejedoras')
  ) return null

  if (!show) return null

  const dismiss = () => {
    snooze()
    setShow(false)
  }

  return (
    <aside
      aria-label="Invitación a la red de tejedoras"
      className="weaver-callout"
      style={{
        position: 'fixed', left: 16, bottom: 16, zIndex: 45,
        maxWidth: 300,
        background: '#fff',
        border: `1px solid ${dahila.border}`,
        borderRadius: 14,
        boxShadow: dahila.shadowMd,
        padding: '16px 18px',
      }}
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Cerrar invitación"
        style={{
          position: 'absolute', top: 6, right: 6,
          width: 32, height: 32,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: dahila.ink500, borderRadius: 8,
        }}
      >
        <Icon name="x" size={14} />
      </button>
      <div style={{
        fontFamily: dahila.fontSans, fontSize: 10, letterSpacing: '0.2em',
        textTransform: 'uppercase', color: dahila.wine600, marginBottom: 6,
      }}>
        Tejé con Dahila
      </div>
      <p style={{
        fontFamily: dahila.fontSerif, fontStyle: 'italic', fontWeight: 300,
        fontSize: 15, lineHeight: 1.5, color: dahila.ink900, margin: '0 0 12px',
        paddingRight: 16,
      }}>
        ¿Te apasiona el crochet? Estamos sumando tejedoras a nuestra red.
      </p>
      <button
        type="button"
        onClick={() => { snooze(); router.push('/tejedoras') }}
        style={{
          fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          background: dahila.ink900, color: '#fff', border: 'none',
          borderRadius: 8, padding: '11px 16px', cursor: 'pointer',
          minHeight: 40,
        }}
      >
        Quiero postularme
      </button>
    </aside>
  )
}
