'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from './CartProvider'
import { useScrollLock } from '@/lib/scroll-lock'
import { dahila, Icon } from './ui/Primitives'
import {
  getPrimaryPhoto, getEffectivePrice, getFinalPrice, formatPrice, BLUR_DATA_URL,
} from '@/lib/types'

/**
 * Mini-cart drawer — slides in when an item is added (immediate feedback) or
 * when the cart icon is tapped. Lets the shopper review/edit without leaving the
 * page; the WhatsApp checkout sits at the bottom (thumb zone on mobile). Calm,
 * on-brand: no countdowns or aggressive upsell.
 */
export function CartDrawer() {
  const {
    items, cartTotal, drawerOpen, closeDrawer, updateQty, removeFromCart,
  } = useCart()
  const pathname = usePathname()
  const router = useRouter()

  // Never over the admin, and close on route change.
  useEffect(() => { closeDrawer() }, [pathname, closeDrawer])

  // Shared, ref-counted scroll lock (coexists safely with other overlays).
  useScrollLock(drawerOpen)

  // Esc closes.
  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDrawer() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, closeDrawer])

  if (pathname.startsWith('/admin')) return null

  const visibleItems = items.filter((i) => !!i.product)

  return (
    <>
      {/* Scrim */}
      <div
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
        style={{
          position: 'fixed', inset: 0, zIndex: 90,
          background: 'rgba(20,16,17,0.4)',
          opacity: drawerOpen ? 1 : 0,
          pointerEvents: drawerOpen ? 'auto' : 'none',
          transition: 'opacity 220ms cubic-bezier(0.22,0.61,0.36,1)',
        }}
      />

      {/* Panel. `inert` when closed removes its buttons/links from the tab order
          and the a11y tree — without it, keyboard users would tab into the
          off-screen (translated) cart controls. */}
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Tu carrito"
        inert={!drawerOpen}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 91,
          width: 'min(420px, 100vw)',
          background: '#fff',
          display: 'flex', flexDirection: 'column',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.22,0.61,0.36,1)',
          boxShadow: drawerOpen ? '-20px 0 50px -30px rgba(31,26,27,0.4)' : 'none',
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
            Tu carrito{visibleItems.length > 0 ? ` (${visibleItems.reduce((s, i) => s + i.qty, 0)})` : ''}
          </span>
          <button onClick={closeDrawer} aria-label="Cerrar carrito" style={{
            background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900,
            width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Body */}
        {visibleItems.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', gap: 14, padding: 24, textAlign: 'center',
          }}>
            <span style={{ color: dahila.ink300 }}><Icon name="shopping-bag" size={40} /></span>
            <p style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700, margin: 0 }}>
              Tu carrito está vacío.
            </p>
            <button
              onClick={() => { closeDrawer(); router.push('/tienda') }}
              style={{
                marginTop: 4, background: dahila.ink900, color: '#fff', border: 'none',
                borderRadius: 10, padding: '12px 22px', cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 12, letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Ver la tienda
            </button>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px' }}>
              {visibleItems.map((item) => {
                const photo = getPrimaryPhoto(item.product)
                const list = getEffectivePrice(item.product, item.size)
                const price = getFinalPrice(item.product, item.size)
                const discounted = price < list
                return (
                  <div key={item.id} style={{
                    display: 'flex', gap: 14, padding: '16px 0',
                    borderBottom: `1px solid ${dahila.border}`,
                  }}>
                    <button
                      onClick={() => { closeDrawer(); router.push(`/tienda/${item.product.slug}`) }}
                      aria-label={`Ver ${item.product.name}`}
                      style={{
                        position: 'relative', width: 64, height: 78, flexShrink: 0,
                        borderRadius: 8, overflow: 'hidden', background: dahila.cream50,
                        border: 'none', padding: 0, cursor: 'pointer',
                      }}
                    >
                      <Image src={photo} alt={item.product.name} fill sizes="64px" placeholder="blur" blurDataURL={BLUR_DATA_URL} style={{ objectFit: 'cover' }} />
                    </button>

                    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ fontFamily: dahila.fontDisplay, fontSize: 15, color: dahila.ink900, lineHeight: 1.2 }}>
                        {item.product.name}
                      </div>
                      <div style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500 }}>Talle: {item.size}</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontFamily: dahila.fontSans, fontSize: 13, color: discounted ? '#B6314A' : dahila.ink900, fontWeight: discounted ? 500 : 400 }}>{formatPrice(price)}</span>
                        {discounted && <span style={{ fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500, textDecoration: 'line-through' }}>{formatPrice(list)}</span>}
                      </div>

                      {/* Qty + remove */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${dahila.borderStrong}`, borderRadius: 999, padding: '4px 10px' }}>
                          <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Restar" style={qtyBtn}><Icon name="minus" size={11} /></button>
                          <span style={{ fontFamily: dahila.fontSans, fontSize: 13, minWidth: 12, textAlign: 'center' }}>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Sumar" style={qtyBtn}><Icon name="plus" size={11} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} aria-label="Quitar" style={{
                          background: 'transparent', border: 'none', cursor: 'pointer',
                          fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500,
                          textDecoration: 'underline', padding: 0,
                        }}>Quitar</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer / checkout */}
            <div style={{
              padding: '16px 20px calc(env(safe-area-inset-bottom, 0px) + 16px)',
              borderTop: `1px solid ${dahila.border}`,
              display: 'flex', flexDirection: 'column', gap: 12,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total</span>
                <span style={{ fontFamily: dahila.fontDisplay, fontSize: 22, color: dahila.ink900 }}>{formatPrice(cartTotal)}</span>
              </div>
              <p style={{ fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500, margin: 0 }}>
                Coordinás envío y pago con Anush por WhatsApp.
              </p>
              <button
                onClick={() => { closeDrawer(); router.push('/carrito') }}
                style={{
                  background: dahila.ink900, color: '#fff', border: 'none',
                  borderRadius: 12, padding: '15px', cursor: 'pointer',
                  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                }}
              >
                Ver carrito y coordinar
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

const qtyBtn: React.CSSProperties = {
  background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900,
  padding: 0, width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
}
