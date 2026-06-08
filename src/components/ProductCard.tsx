'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Product, Discount } from '@/lib/types'
import { getEffectivePrice, getFinalPrice, resolveDiscountPercent, formatPrice, getPrimaryPhoto, getScarcity, BLUR_DATA_URL } from '@/lib/types'
import { useCart } from './CartProvider'
import { FavoriteButton } from './FavoriteButton'
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
  const scarcity = getScarcity(product)
  // A subtle set of colour swatches gives variety at a glance (like ASOS/Zara
  // cards) without opening the product. Cap at five so the row never wraps.
  const swatches = (product.colors ?? []).slice(0, 5)

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
    // Whole card is clickable, but it hosts its own buttons (heart, quick-add),
    // so it can't be a <button> (no nested buttons). A focusable div with a
    // keyboard handler keeps it accessible.
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/tienda/${product.slug}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(`/tienda/${product.slug}`) }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={product.name}
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

        {/* Sold-out scrim so it reads as unavailable at a glance */}
        {product.status === 'soldout' && (
          <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)' }} />
        )}

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

        {/* Top-right stack: heart (always) + honest scarcity tag below it, so
            neither collides with the discount/soldout badge (top-left) nor the
            hover action (bottom). Only the "last one" level shows on the card. */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6,
        }}>
          <FavoriteButton productId={product.id} />
          {scarcity?.level === 'last' && product.status !== 'soldout' && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.94)', color: '#B6314A',
              fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 600,
              letterSpacing: '0.04em', padding: '4px 9px', borderRadius: 999,
              boxShadow: dahila.shadowSm,
            }}>{scarcity.short}</span>
          )}
        </div>

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

      {/* Colour swatches — a glance at the palette without opening the piece. */}
      {swatches.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 2px', marginTop: -2 }}>
          {swatches.map((c) => (
            <span
              key={c.id}
              title={c.name}
              aria-hidden
              style={{
                width: 11, height: 11, borderRadius: 999,
                background: c.hex || dahila.cream200,
                boxShadow: 'inset 0 0 0 1px rgba(31,26,27,0.18)',
              }}
            />
          ))}
          {(product.colors?.length ?? 0) > swatches.length && (
            <span style={{ fontFamily: dahila.fontSans, fontSize: 10, color: dahila.ink500 }}>
              +{(product.colors!.length) - swatches.length}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
