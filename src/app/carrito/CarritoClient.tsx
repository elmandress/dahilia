'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { dahila, Eyebrow, Button, Icon } from '@/components/ui/Primitives'
import { getPrimaryPhoto, formatPrice, getEffectivePrice } from '@/lib/types'
import Image from 'next/image'

export default function CarritoClient() {
  const { items, removeFromCart, updateQty, isLoading } = useCart()
  const router = useRouter()

  const total = items.reduce((acc, item) => acc + (getEffectivePrice(item.product, item.size) * item.qty), 0)

  if (isLoading) {
    return (
      <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div className="sk-shimmer" style={{ width: 60, height: 11, borderRadius: 4 }} />
        <div className="sk-shimmer" style={{ width: 200, height: 44, borderRadius: 6, marginTop: 12, marginBottom: 40 }} />
        {[1, 2].map((i) => (
          <div key={i} style={{ display: 'flex', gap: 24, paddingBottom: 24, marginBottom: 24, borderBottom: `1px solid ${dahila.border}` }}>
            <div className="sk-shimmer" style={{ width: 100, height: 120, borderRadius: 8 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="sk-shimmer" style={{ width: '60%', height: 18, borderRadius: 4 }} />
              <div className="sk-shimmer" style={{ width: '30%', height: 12, borderRadius: 4 }} />
              <div className="sk-shimmer" style={{ width: '40%', height: 14, borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main style={{ maxWidth: 560, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
        <div style={{ marginBottom: 24, color: dahila.ink300 }}>
          <Icon name="shopping-bag" size={48} />
        </div>
        <Eyebrow>Tu carrito</Eyebrow>
        <h1 style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300,
          fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.1, letterSpacing: '-0.02em',
          color: dahila.ink900, margin: '14px 0 16px',
        }}>Está vacío.</h1>
        <p style={{ fontFamily: dahila.fontSans, fontWeight: 300, fontSize: 15, color: dahila.ink700, marginBottom: 32 }}>
          Llenalo con algunas de las piezas de la nueva colección.
        </p>
        <Button variant="primary" onClick={() => router.push('/tienda')}>Ir a la tienda</Button>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 80px' }}>
      <Eyebrow>Checkout</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '12px 0 40px',
      }}>Tu carrito</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {items.filter((i) => !!i.product).map((item) => {
          const photo = getPrimaryPhoto(item.product)
          const price = getEffectivePrice(item.product, item.size)
          return (
            <div key={item.id} className="cart-row" style={{
              display: 'flex', gap: 24, paddingBottom: 24,
              borderBottom: `1px solid ${dahila.border}`,
              alignItems: 'center'
            }}>
              <div style={{
                width: 90, height: 108, borderRadius: 8, overflow: 'hidden',
                background: dahila.cream50, position: 'relative', flexShrink: 0
              }}>
                <Image src={photo} alt={item.product.name} fill sizes="90px" style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontFamily: dahila.fontDisplay, fontSize: 18, color: dahila.ink900, lineHeight: 1.2 }}>
                  {item.product.name}
                </div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700 }}>
                  Talle: {item.size}
                </div>
                <div style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink900, marginTop: 4 }}>
                  {formatPrice(price)}
                </div>
              </div>

              <div className="cart-row-controls" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  border: `1px solid ${dahila.borderStrong}`, borderRadius: 999, padding: '6px 12px'
                }}>
                  <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Restar" style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900, padding: 0,
                    width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name="minus" size={12} /></button>
                  <span style={{ fontFamily: dahila.fontSans, fontSize: 14, minWidth: 14, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Sumar" style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink900, padding: 0,
                    width: 22, height: 22, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}><Icon name="plus" size={12} /></button>
                </div>

                <button onClick={() => removeFromCart(item.id)} style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', color: dahila.ink500, padding: 8,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }} aria-label="Eliminar">
                  <Icon name="x" size={18} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="cart-subtotal" style={{ marginTop: 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 20 }}>
        <div style={{ display: 'flex', gap: 48, alignItems: 'baseline' }}>
          <span style={{ fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Subtotal</span>
          <span style={{ fontFamily: dahila.fontDisplay, fontSize: 24, color: dahila.ink900 }}>{formatPrice(total)}</span>
        </div>
        <p style={{ fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500, margin: 0, marginTop: -12 }}>
          El costo de envío se calcula en el próximo paso.
        </p>
        <Button variant="primary" size="lg" style={{ minWidth: 280 }}>Proceder al pago</Button>
      </div>
    </main>
  )
}
