'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCart } from './CartProvider'
import { useScrollLock } from '@/lib/scroll-lock'
import { useFocusTrap } from '@/lib/focus-trap'
import { dahila, Icon } from './ui/Primitives'
import { cargarContenidoCajon, contenidoCajonListo } from './cart-drawer-carga'

/**
 * Mini-cart drawer — slides in when an item is added (immediate feedback) or
 * when the cart icon is tapped. Lets the shopper review/edit without leaving the
 * page; the WhatsApp checkout sits at the bottom (thumb zone on mobile). Calm,
 * on-brand: no countdowns or aggressive upsell.
 *
 * Esto es el armazón: panel, título y cerrar. Lo de adentro (las piezas y el
 * pedido, CartDrawerContenido) baja aparte cuando hace falta (INT-2,
 * cart-drawer-carga). El panel recién se abre cuando el contenido llegó, así
 * no se ve vacío; si tarda (red muy lenta), se abre igual a los 0,7 s con un
 * esqueleto y el contenido aparece al llegar.
 */
export function CartDrawer() {
  const { cartCount, items, hasMounted, drawerOpen, closeDrawer } = useCart()
  const pathname = usePathname()

  const [Contenido, setContenido] = useState<ComponentType | null>(contenidoCajonListo)
  const [fallo, setFallo] = useState(false)
  const [esperaLarga, setEsperaLarga] = useState(false)
  const conPiezas = hasMounted && items.length > 0 && !pathname.startsWith('/admin')

  // Bajar el contenido: ya, si piden abrir el cajón; en un momento libre, si
  // el carrito tiene piezas (es probable que lo abra).
  useEffect(() => {
    if (Contenido || (!drawerOpen && !conPiezas)) return
    let vivo = true
    const cargar = () => {
      cargarContenidoCajon().then(
        (C) => { if (vivo) { setContenido(() => C); setFallo(false) } },
        () => { if (vivo && drawerOpen) setFallo(true) },
      )
    }
    if (drawerOpen) {
      cargar()
      return () => { vivo = false }
    }
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(cargar, { timeout: 3000 })
      return () => { vivo = false; w.cancelIdleCallback?.(id) }
    }
    const t = window.setTimeout(cargar, 1500)
    return () => { vivo = false; window.clearTimeout(t) }
  }, [Contenido, drawerOpen, conPiezas])

  // Si el contenido tarda, el cajón se abre igual con un esqueleto: tocar el
  // carrito nunca puede quedar sin respuesta.
  useEffect(() => {
    if (!drawerOpen || Contenido) return
    const t = window.setTimeout(() => setEsperaLarga(true), 700)
    return () => window.clearTimeout(t)
  }, [drawerOpen, Contenido])

  const abierto = drawerOpen && (!!Contenido || fallo || esperaLarga)

  // Never over the admin, and close on route change.
  useEffect(() => { closeDrawer() }, [pathname, closeDrawer])

  // Shared, ref-counted scroll lock (coexists safely with other overlays).
  useScrollLock(abierto)

  // Keyboard users shouldn't be able to Tab past the drawer into the page
  // behind the scrim — trap focus inside while open, restore it on close.
  const panelRef = useRef<HTMLElement>(null)
  useFocusTrap(panelRef, abierto)

  // Esc closes.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, closeDrawer])

  if (pathname.startsWith('/admin')) return null

  return (
    <>
      {/* Scrim */}
      <div
        onClick={closeDrawer}
        aria-hidden={!abierto}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(20,16,17,0.4)',
          opacity: abierto ? 1 : 0,
          pointerEvents: abierto ? 'auto' : 'none',
          transition: 'opacity 220ms cubic-bezier(0.22,0.61,0.36,1)',
        }}
      />

      {/* Panel. `inert` when closed removes its buttons/links from the tab order
          and the a11y tree — without it, keyboard users would tab into the
          off-screen (translated) cart controls. */}
      <aside
        ref={panelRef}
        tabIndex={-1}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        inert={!abierto}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 91,
          width: 'min(420px, 100vw)',
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          transform: abierto ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.22,0.61,0.36,1)',
          boxShadow: abierto ? '-20px 0 50px -30px rgba(31,26,27,0.4)' : 'none',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px', borderBottom: `1px solid ${dahila.border}`,
        }}>
          <span style={{
            fontFamily: dahila.fontSans, fontSize: 12, letterSpacing: '0.16em',
            textTransform: 'uppercase', color: dahila.ink900,
          }}>
            Tu carrito{cartCount > 0 ? ` (${cartCount})` : ''}
          </span>
          <button onClick={closeDrawer} aria-label="Cerrar carrito" style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900,
            width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {Contenido ? (
          <Contenido />
        ) : fallo ? (
          // Sin red para bajar el contenido: /carrito es una página entera y
          // anda por su cuenta.
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center',
          }}>
            <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700, margin: 0 }}>
              No pudimos mostrar tu carrito acá.
            </p>
            <Link href="/carrito" onClick={closeDrawer} style={{
              background: dahila.ink900, color: '#fff', borderRadius: 10, padding: '0 22px', minHeight: 44,
              display: 'inline-flex', alignItems: 'center',
              fontFamily: dahila.fontSans, fontSize: 12, letterSpacing: '0.06em',
              textTransform: 'uppercase', textDecoration: 'none',
            }}>
              Ver el carrito
            </Link>
          </div>
        ) : drawerOpen ? (
          <div role="status" aria-label="Cargando" style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', gap: 14 }}>
                <div className="sk-shimmer" style={{ width: 64, height: 78, borderRadius: 8 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
                  <div className="sk-shimmer" style={{ width: '70%', height: 14, borderRadius: 4 }} />
                  <div className="sk-shimmer" style={{ width: '35%', height: 11, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </aside>
    </>
  )
}
