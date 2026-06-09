'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/components/CartProvider'
import { dahila, Eyebrow, Button, Icon } from '@/components/ui/Primitives'
import { getPrimaryPhoto, formatPrice, getEffectivePrice, getFinalPrice } from '@/lib/types'
import { PriceBlock } from '@/components/ui/PriceBlock'
import Image from 'next/image'
import { SITE_URL } from '@/lib/env'

interface Props {
  whatsappUrl: string
  whatsappLabel: string
}

/** Build a clean, multi-line WhatsApp message from the cart contents. */
function buildWhatsAppMessage(
  items: ReturnType<typeof useCart>['items'],
  discounts: ReturnType<typeof useCart>['discounts'],
  total: number,
  giftNote?: string
): string {
  const lines: string[] = []
  lines.push('Hola Anush! Quiero coordinar este pedido:')
  lines.push('')

  items
    .filter((i) => !!i.product)
    .forEach((item, idx) => {
      const list = getEffectivePrice(item.product, item.size)
      const unit = getFinalPrice(item.product, item.size, discounts)
      const subtotal = unit * item.qty
      const slug = item.product.slug
      const discounted = unit < list
      lines.push(`${idx + 1}. ${item.product.name}`)
      lines.push(`   • Talle: ${item.size}`)
      lines.push(`   • Cantidad: ${item.qty}`)
      if (discounted) {
        lines.push(`   • Precio unitario: ${formatPrice(unit)} (antes ${formatPrice(list)})`)
      }
      lines.push(`   • Subtotal: ${formatPrice(subtotal)}`)
      lines.push(`   ${SITE_URL}/tienda/${slug}`)
      lines.push('')
    })

  lines.push(`Total: ${formatPrice(total)}`)
  if (giftNote) {
    lines.push('')
    lines.push(`🎁 Nota de regalo: "${giftNote}"`)
  }
  lines.push('')
  lines.push('¿Me confirmás stock, plazos y forma de pago? ¡Gracias!')

  return lines.join('\n')
}

export default function CarritoClient({ whatsappUrl, whatsappLabel }: Props) {
  const { items, removeFromCart, updateQty, isLoading, discounts, shippingEstimate } = useCart()
  const router = useRouter()
  const [giftNote, setGiftNote] = useState('')
  const [showGiftNote, setShowGiftNote] = useState(false)

  const total = items.reduce(
    (acc, item) => acc + (getFinalPrice(item.product, item.size, discounts) * item.qty),
    0
  )

  const handleCheckout = () => {
    if (typeof window === 'undefined') return
    const message = buildWhatsAppMessage(items, discounts, total, giftNote.trim())
    // wa.me supports `?text=` query param. encodeURIComponent handles the rest.
    // Strip any trailing slash from the base URL so we can append cleanly.
    const base = whatsappUrl.replace(/\/+$/, '')
    const url = `${base}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

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
          Llenalo con algunas de las piezas de la colección.
        </p>
        <Button variant="primary" onClick={() => router.push('/tienda')}>Ir a la tienda</Button>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px 80px' }}>
      <Eyebrow>Tu pedido</Eyebrow>
      <h1 style={{
        fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 'clamp(32px, 5vw, 48px)',
        lineHeight: 1.05, letterSpacing: '-0.02em', color: dahila.ink900, margin: '12px 0 40px',
      }}>Tu carrito</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {items.filter((i) => !!i.product).map((item) => {
          const photo = getPrimaryPhoto(item.product)
          const listPrice = getEffectivePrice(item.product, item.size)
          const price = getFinalPrice(item.product, item.size, discounts)
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                  <PriceBlock list={listPrice} final={price} size="md" />
                </div>
                {/* Lead time — shown only when the product has real data, never invented */}
                {(item.product.lead_time_weeks_min > 0 || item.product.lead_time_weeks_max > 0) && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 2,
                    fontFamily: 'var(--font-sans)', fontSize: 11, color: '#8C8285',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
                      <path d="M8 4.5V8l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    </svg>
                    {item.product.lead_time_weeks_min && item.product.lead_time_weeks_max
                      ? `Se teje en ${item.product.lead_time_weeks_min}–${item.product.lead_time_weeks_max} semanas`
                      : item.product.lead_time_weeks_max
                        ? `Se teje en hasta ${item.product.lead_time_weeks_max} semanas`
                        : `Se teje en ${item.product.lead_time_weeks_min} semana`}
                  </div>
                )}
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

      {/* Reassurance strip */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 18,
        marginTop: 28, paddingTop: 20, borderTop: `1px solid ${dahila.border}`,
        justifyContent: 'center',
      }}>
        {[
          ['truck', shippingEstimate.trim() || 'Envío a todo Uruguay'],
          ['hand-heart', 'Hecho a mano'],
          ['chat-circle', 'Atención personal por WhatsApp'],
        ].map(([icon, txt]) => (
          <span key={txt} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500,
          }}>
            <Icon name={icon} size={15} color={dahila.ink500} /> {txt}
          </span>
        ))}
      </div>

      <div
        className="cart-subtotal"
        style={{
          marginTop: 28,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14,
        }}
      >
        <div style={{ display: 'flex', gap: 48, alignItems: 'baseline' }}>
          <span style={{
            fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink700,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Total
          </span>
          <span style={{ fontFamily: dahila.fontDisplay, fontSize: 24, color: dahila.ink900 }}>
            {formatPrice(total)}
          </span>
        </div>

        <p style={{
          fontFamily: dahila.fontSans, fontSize: 12, color: dahila.ink500,
          margin: 0, maxWidth: 360, textAlign: 'right',
        }}>
          Coordinás stock, envío y pago directo con Anush por WhatsApp.
        </p>

        {/* Gift note toggle — opens a small textarea; content goes into WA message */}
        <div style={{ width: '100%', maxWidth: 420, alignSelf: 'flex-end' }}>
          {!showGiftNote ? (
            <button
              type="button"
              onClick={() => setShowGiftNote(true)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink500,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                textDecoration: 'underline',
              }}
            >
              <Icon name="gift" size={14} color={dahila.ink500} />
              Es un regalo — agregar nota
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label style={{ fontFamily: dahila.fontSans, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: dahila.ink500 }}>
                Nota de regalo
              </label>
              <textarea
                rows={2}
                maxLength={200}
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                placeholder='Ej: "Con cariño para vos 🧶"'
                style={{
                  fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 300, color: dahila.ink900,
                  background: dahila.cream50, border: `1px solid ${dahila.borderStrong}`,
                  borderRadius: 8, padding: '10px 12px', resize: 'none', outline: 'none',
                  width: '100%', boxSizing: 'border-box',
                }}
              />
              <button
                type="button"
                onClick={() => { setShowGiftNote(false); setGiftNote('') }}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500, alignSelf: 'flex-start',
                  textDecoration: 'underline',
                }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <button
          onClick={handleCheckout}
          aria-label={`Coordinar pedido por WhatsApp con ${whatsappLabel}`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            background: '#25D366',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 28px',
            fontFamily: dahila.fontSans,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            minWidth: 280,
            boxShadow: '0 8px 22px -10px rgba(37,211,102,0.6)',
            transition: 'transform 160ms cubic-bezier(0.22,0.61,0.36,1), box-shadow 160ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 12px 28px -10px rgba(37,211,102,0.7)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 8px 22px -10px rgba(37,211,102,0.6)'
          }}
        >
          <Icon name="whatsapp-logo" weight="fill" size={20} color="#fff" />
          Coordinar por WhatsApp
        </button>
      </div>
    </main>
  )
}
