'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Product, Discount } from '@/lib/types'
import {
  getEffectivePrice, getFinalPrice, resolveDiscountPercent,
  getPrimaryPhoto, BLUR_DATA_URL,
} from '@/lib/types'
import { useCart } from './CartProvider'
import { useScrollLock } from '@/lib/scroll-lock'
import { dahila, Button, Icon } from './ui/Primitives'
import { PriceBlock } from './ui/PriceBlock'

/**
 * Quick-view: a focused product preview the shopper can open from the grid
 * without losing their place. Deliberately simple — one photo, price, size,
 * add-to-cart, and a link to the full page. Big targets, plain language.
 */
export function QuickViewModal({
  product,
  discounts = [],
  onClose,
}: {
  product: Product
  discounts?: Discount[]
  onClose: () => void
}) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [talle, setTalle] = useState<string>(product.sizes?.[0]?.size || 'Único')

  const photo = getPrimaryPhoto(product)
  const listPrice = getEffectivePrice(product, talle)
  const finalPrice = getFinalPrice(product, talle, discounts)
  const discountPct = resolveDiscountPercent(product, discounts)
  const hasDiscount = discountPct > 0 && listPrice > 0
  const isSoldOut = product.status === 'soldout'
  const canBuy = !isSoldOut && !product.is_custom_only

  useScrollLock(true)

  // Esc to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleAdd = async () => {
    await addToCart(product, talle, 1)
    // addToCart opens the mini-cart drawer; close this modal so we don't stack
    // two dialogs on top of each other.
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Vista rápida: ${product.name}`}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 120,
        background: 'rgba(20,16,17,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        className="quickview-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, overflow: 'hidden',
          width: '100%', maxWidth: 760, maxHeight: '90vh',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          boxShadow: dahila.shadowMd,
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: 'absolute', top: 12, right: 12, zIndex: 2,
            width: 38, height: 38, borderRadius: 999,
            background: 'rgba(255,255,255,0.92)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: dahila.ink900, boxShadow: dahila.shadowSm,
          }}
        >
          <Icon name="x" size={18} />
        </button>

        {/* Image */}
        <div className="quickview-img" style={{ position: 'relative', aspectRatio: '4/5', background: dahila.cream50 }}>
          <Image
            src={photo}
            alt={product.name}
            fill
            quality={90}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            sizes="(max-width: 760px) 100vw, 380px"
            style={{ objectFit: 'cover' }}
          />
          {hasDiscount && (
            <span style={{
              position: 'absolute', top: 12, left: 12,
              background: '#B6314A', color: '#fff',
              fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.06em', padding: '5px 10px', borderRadius: 999,
            }}>−{discountPct}%</span>
          )}
        </div>

        {/* Details */}
        <div className="quickview-body" style={{
          padding: '28px 26px', display: 'flex', flexDirection: 'column', gap: 16,
          overflowY: 'auto',
        }}>
          <div>
            <h2 style={{
              fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 26,
              color: dahila.ink900, margin: '0 0 8px', lineHeight: 1.15,
            }}>{product.name}</h2>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <PriceBlock list={listPrice} final={finalPrice} size="md" soldOut={isSoldOut} />
            </div>
          </div>

          {product.description && (
            <p style={{
              fontFamily: dahila.fontSans, fontSize: 14, fontWeight: 300, lineHeight: 1.65,
              color: dahila.ink700, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{product.description}</p>
          )}

          {/* Sizes */}
          {canBuy && product.sizes && product.sizes.length > 0 && (
            <div>
              <div style={{ fontFamily: dahila.fontSans, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: dahila.ink500, marginBottom: 8 }}>
                Talle
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {product.sizes.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setTalle(s.size)}
                    disabled={!s.available}
                    style={{
                      minWidth: 44, height: 44, padding: '0 12px', borderRadius: 8,
                      fontFamily: dahila.fontSans, fontSize: 13,
                      border: `1px solid ${talle === s.size ? dahila.ink900 : dahila.borderStrong}`,
                      background: talle === s.size ? dahila.ink900 : '#fff',
                      color: talle === s.size ? '#fff' : dahila.ink900,
                      cursor: s.available ? 'pointer' : 'not-allowed',
                      opacity: s.available ? 1 : 0.5,
                      textDecoration: s.available ? 'none' : 'line-through',
                    }}
                  >{s.size}</button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {canBuy ? (
              <Button variant="primary" size="lg" full onClick={handleAdd}>
                Agregar al carrito
              </Button>
            ) : product.is_custom_only ? (
              <Button variant="primary" size="lg" full onClick={() => router.push('/encargo')}>
                Pedir a medida
              </Button>
            ) : (
              <Button variant="secondary" size="lg" full disabled>Agotado</Button>
            )}
            <button
              onClick={() => router.push(`/tienda/${product.slug}`)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontFamily: dahila.fontSans, fontSize: 13, color: dahila.ink700,
                textDecoration: 'underline', padding: '4px 0',
              }}
            >
              Ver todos los detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
