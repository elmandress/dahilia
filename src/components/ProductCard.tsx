'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Product, Discount } from '@/lib/types'
import { getEffectivePrice, getFinalPrice, resolveDiscountPercent, formatPrice, getPrimaryPhoto, BLUR_DATA_URL } from '@/lib/types'
import { useCart } from './CartProvider'
import { dahila, Badge } from './ui/Primitives'

export function ProductCard({
  product,
  discounts,
  onQuickView,
}: {
  product: Product
  discounts?: Discount[]
  onQuickView?: () => void
}) {
  const router = useRouter()
  const { addToCart } = useCart()
  const [hover, setHover] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const photo = getPrimaryPhoto(product)
  const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0].size : 'Único'
  const listPrice = getEffectivePrice(product, defaultSize)
  const discountPct = resolveDiscountPercent(product, discounts)
  const finalPrice = getFinalPrice(product, defaultSize, discounts)
  const hasDiscount = discountPct > 0 && listPrice > 0
  const purchasable = product.status !== 'soldout' && !product.is_custom_only

  const handleAction = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    // If a quick-view handler is provided (store grid), open it so the shopper
    // can choose a size. Otherwise (home grid) fall back to quick-add.
    if (onQuickView) { onQuickView(); return }
    if (!purchasable) return
    setIsAdding(true)
    await addToCart(product, defaultSize, 1)
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <button
      onClick={() => router.push(`/tienda/${product.slug}`)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'transparent', border: 'none', padding: 0, textAlign: 'left',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10,
      }}>

      <div style={{
        position: 'relative',
        aspectRatio: '3 / 4',
        borderRadius: 12, overflow: 'hidden',
        background: dahila.cream50,
      }}>
        <Image
          src={photo}
          alt={product.name}
          fill
          quality={82}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          sizes="(max-width: 480px) 50vw, (max-width: 720px) 50vw, (max-width: 1280px) 25vw, 280px"
          style={{
            objectFit: 'cover',
            transition: `transform 600ms ${dahila.ease}`,
            transform: hover ? 'scale(1.03)' : 'scale(1)',
          }}
        />

        {/* Badge stack — discount wins, then soldout/badge/custom */}
        {hasDiscount && product.status !== 'soldout' ? (
          <span style={{ position: 'absolute', top: 10, left: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#B6314A', color: '#fff',
              fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.06em', padding: '5px 10px', borderRadius: 999,
            }}>−{discountPct}%</span>
          </span>
        ) : product.status === 'soldout' ? (
          <span style={{ position: 'absolute', top: 10, left: 10 }}><Badge tone="sold">Agotado</Badge></span>
        ) : product.badge ? (
          <span style={{ position: 'absolute', top: 10, left: 10 }}><Badge tone="white">{product.badge}</Badge></span>
        ) : product.is_custom_only ? (
          <span style={{ position: 'absolute', top: 10, left: 10 }}><Badge tone="cream">A medida</Badge></span>
        ) : null}

        {/* Action bar. On desktop it reveals on hover; on touch devices (where
            there is no hover) it stays visible so the action is always reachable. */}
        {purchasable && (
          <div
            className="card-action"
            onClick={handleAction}
            style={{
              position: 'absolute', left: 10, right: 10, bottom: 10,
              background: 'rgba(255,255,255,0.96)',
              borderRadius: 8,
              padding: '11px 12px',
              fontFamily: dahila.fontSans, fontSize: 11, fontWeight: 500,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: dahila.ink900, textAlign: 'center',
              boxShadow: dahila.shadowSm,
              opacity: hover ? 1 : 0,
              transform: hover ? 'translateY(0)' : 'translateY(8px)',
              transition: `all 220ms ${dahila.ease}`,
              pointerEvents: hover ? 'auto' : 'none',
            }}>
            {isAdding ? '✓ Añadido' : (onQuickView ? 'Vista rápida' : 'Agregar al carrito')}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        gap: 12, padding: '0 2px',
      }}>
        <span style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 16,
          color: dahila.ink900, lineHeight: 1.2,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{product.name}</span>
        {hasDiscount ? (
          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', whiteSpace: 'nowrap' }}>
            <span style={{ fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 500, color: '#B6314A' }}>
              {formatPrice(finalPrice)}
            </span>
            <span style={{ fontFamily: dahila.fontSans, fontSize: 11, color: dahila.ink500, textDecoration: 'line-through' }}>
              {formatPrice(listPrice)}
            </span>
          </span>
        ) : (
          <span style={{
            fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400, color: dahila.ink900,
            whiteSpace: 'nowrap',
          }}>{formatPrice(finalPrice)}</span>
        )}
      </div>
    </button>
  )
}
