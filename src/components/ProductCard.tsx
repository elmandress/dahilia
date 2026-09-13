'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Product, Discount } from '@/lib/types'
import {
  getEffectivePrice, getFinalPrice, resolveDiscountPercent, getPrimaryPhoto, getScarcity, BLUR_DATA_URL,
  getPrimaryPhotoAlt, getListingSize, hasPriceRange, isReadyToShip,
} from '@/lib/types'
import { useCart } from './CartProvider'
import { FavoriteButton } from './FavoriteButton'
import { dahila, Badge } from './ui/Primitives'
import { PriceBlock } from './ui/PriceBlock'

export function ProductCard({
  product,
  discounts,
  onQuickView,
  priority = false,
}: {
  product: Product
  discounts?: Discount[]
  onQuickView?: () => void
  // La foto de las primeras tarjetas de una grilla sin hero (/tienda,
  // /tienda/[categoría]) ES el LCP real de esa página — auditoría 03/09/2026.
  // Next 16 deprecó `priority`; fetchPriority="high" + loading="eager" es el
  // reemplazo, mismo patrón que ProductGallery/HomeClient/colecciones/[slug].
  priority?: boolean
}) {
  const { addToCart, queueNote } = useCart()
  const [hover, setHover] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  const photo = getPrimaryPhoto(product)
  // Precio "desde": el del talle disponible más barato. Es el mismo número que
  // muestran /ig, el buscador y el JSON-LD (getListingSize en lib/types);
  // antes cada superficie usaba uno distinto (auditoría 12/09/2026).
  const listingSize = getListingSize(product)
  const listPrice = getEffectivePrice(product, listingSize)
  const discountPct = resolveDiscountPercent(product, discounts)
  const finalPrice = getFinalPrice(product, listingSize, discounts)
  const priceFrom = hasPriceRange(product)
  const hasDiscount = discountPct > 0 && listPrice > 0
  const purchasable = product.status !== 'soldout' && !product.is_custom_only
  const scarcity = getScarcity(product)
  const readyNow = isReadyToShip(product)
  const availableSizeCount = (product.sizes ?? []).filter((s) => s.available !== false).length
  // Con más de un talle disponible hay que elegir. Sin vista rápida (home,
  // relacionados) la acción lleva a la ficha en vez de sumar un talle que la
  // clienta no eligió: los talles preseleccionados pasan inadvertidos.
  const needsSize = availableSizeCount > 1
  // Tiene talles pero ninguno disponible: no hay nada que sumar de un toque.
  const allSizesOut = (product.sizes?.length ?? 0) > 0 && availableSizeCount === 0
  // A subtle set of colour swatches gives variety at a glance (like ASOS/Zara
  // cards) without opening the product. Cap at five so the row never wraps.
  const swatches = (product.colors ?? []).slice(0, 5)

  const handleAction = async (e: React.MouseEvent) => {
    // If a quick-view handler is provided (store grid), open it so the shopper
    // can choose a size.
    if (onQuickView) {
      e.stopPropagation()
      e.preventDefault()
      onQuickView()
      return
    }
    // Sin vista rápida y con talles para elegir: el click sigue hasta el <Link>
    // de la tarjeta y abre la ficha.
    if (needsSize) return
    e.stopPropagation()
    e.preventDefault()
    if (!purchasable || allSizesOut) return
    setIsAdding(true)
    await addToCart(product, listingSize ?? 'Único', 1)
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    // <Link> wraps the whole card so it works with Ctrl+click, middle-click,
    // and crawlers. The inner FavoriteButton and quick-add use e.stopPropagation()
    // so they don't trigger navigation.
    <Link
      href={`/tienda/${product.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textDecoration: 'none', color: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 10,
        // minWidth: 0 — sin esto, una tarjeta con contenido que no puede
        // achicarse (precio en una sola línea, badges) queda con su ancho
        // mínimo fijado por ese contenido, y como es un ítem de grilla eso
        // puede forzar a la columna entera a crecer más de lo disponible.
        minWidth: 0,
      }}>

      <div style={{
        position: 'relative',
        aspectRatio: '3 / 4',
        borderRadius: 12, overflow: 'hidden',
        background: dahila.cream50,
      }}>
        <Image
          src={photo}
          alt={getPrimaryPhotoAlt(product)}
          fill
          quality={82}
          {...(priority ? { fetchPriority: 'high' as const, loading: 'eager' as const } : {})}
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
            {isAdding ? '✓ Agregado' : onQuickView ? 'Vista rápida' : needsSize ? 'Elegir talle' : 'Agregar al carrito'}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline',
        gap: '4px 12px', padding: '0 2px',
      }}>
        <span style={{
          fontFamily: dahila.fontDisplay, fontWeight: 300, fontSize: 16,
          color: dahila.ink900, lineHeight: 1.2,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', minWidth: 0, flex: '1 1 140px',
        }}>{product.name}</span>
        <PriceBlock list={listPrice} final={finalPrice} size="sm" align="end" from={priceFrom} />
      </div>

      {/* Colour swatches + lead time in one row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2px', marginTop: -2, gap: 8 }}>
        {swatches.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
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
        {/* Con lista de espera activa el plazo del producto queda corto (la cola
            manda), así que la etiqueta se oculta: mismo criterio que el PDP
            (ProductDetailsClient) y el carrito. Sin este guard la grilla
            prometía "1–2 sem." al lado del cartel que dice otra cosa. */}
        {/* Pieza ya tejida: se dice en la tarjeta. Antes solo se enteraba quien
            entraba por el filtro "En stock" del menú; en la grilla se veía
            igual que una que tarda semanas. */}
        {readyNow ? (
          <span style={{
            fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 500, color: dahila.wine600,
            letterSpacing: '0.02em', whiteSpace: 'nowrap', marginLeft: 'auto',
          }}>
            En stock
          </span>
        ) : !queueNote.trim() && product.lead_time_weeks_min > 0 && product.status !== 'soldout' && (
          <span style={{
            fontFamily: dahila.fontSans, fontSize: 10, color: dahila.ink500,
            letterSpacing: '0.02em', whiteSpace: 'nowrap', marginLeft: 'auto',
          }}>
            {product.lead_time_weeks_min === product.lead_time_weeks_max
              ? `${product.lead_time_weeks_min} sem.`
              : `${product.lead_time_weeks_min}–${product.lead_time_weeks_max} sem.`}
          </span>
        )}
      </div>

      {/* Material tag — tiny pill, solo si el producto lo tiene cargado */}
      {product.material && (
        <div style={{ padding: '0 2px', marginTop: 2 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontFamily: dahila.fontSans, fontSize: 10, fontWeight: 400,
            color: dahila.ink500, letterSpacing: '0.04em',
            background: dahila.cream100,
            borderRadius: 999, padding: '3px 8px',
            border: `1px solid ${dahila.border}`,
          }}>
            {product.material}
          </span>
        </div>
      )}
    </Link>
  )
}
