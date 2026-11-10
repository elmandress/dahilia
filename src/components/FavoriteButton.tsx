'use client'

import { useState } from 'react'
import { useFavorites } from './FavoritesProvider'
import { track, gaCommerce } from '@/lib/analytics'
import { dahila, Icon } from './ui/Primitives'

/** Lo que la medición necesita de la prenda guardada. */
export interface FavoriteProduct {
  slug: string
  name: string
  /** El precio que se ve (el de la tarjeta). */
  price: number
  /** Slug de la categoría, como en el resto de los eventos de GA4. */
  category?: string
  /** Va como grupo de variantes en el feed (tieneVariantes). */
  variantes?: boolean
}

/**
 * Heart toggle for saving a piece to the wishlist. Two looks:
 *   - `overlay` (default): a round white chip for the corner of a product card.
 *   - `inline`: a text+heart row for the product page.
 * The fill + colour flip is optimistic (see FavoritesProvider).
 */
export function FavoriteButton({
  productId,
  variant = 'overlay',
  size,
  product,
}: {
  productId: string
  variant?: 'overlay' | 'inline'
  /** Tamaño del ícono: 18 en la ficha, 16 sobre la foto de la tarjeta. */
  size?: number
  /** La prenda, para que GA4 y Meta sepan cuál se guardó (TRK-04). */
  product?: FavoriteProduct
}) {
  const { isFavorite, toggle, hasMounted } = useFavorites()
  const active = hasMounted && isFavorite(productId)
  const label = active ? 'Quitar de favoritos' : 'Guardar en favoritos'
  // El pulso solo cuando la persona toca (no al cargar una página donde ya
  // estaba guardado, que haría latir todos los corazones a la vez).
  const [touched, setTouched] = useState(false)

  const onClick = (e: React.MouseEvent) => {
    // Cards are clickable buttons themselves — don't navigate when hearting.
    e.stopPropagation()
    e.preventDefault()
    setTouched(true)
    // Guardar (no quitar) es una señal de interés: GA4 y Meta la reciben con
    // su nombre estándar (add_to_wishlist → AddToWishlist). Con la prenda
    // (TRK-04, 04/11/2026): antes AddToWishlist llegaba a Meta sin
    // content_ids, y GA4 deja afuera de e-commerce un add_to_wishlist sin items.
    if (!active) {
      track('wishlist_add', { product: productId }, {
        name: 'add_to_wishlist',
        ...(product
          ? {
              params: {
                ...gaCommerce([{ item_id: product.slug, item_name: product.name, price: product.price, item_category: product.category }]),
                meta_group: product.variantes === true,
              },
            }
          : {}),
      })
    }
    void toggle(productId)
  }

  if (variant === 'inline') {
    return (
      <button
        onClick={onClick}
        aria-pressed={active}
        aria-label={label}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          // Mismo molde que Compartir y Pinterest: antes era texto suelto
          // al lado de dos píldoras con borde y la fila se leía desprolija.
          background: 'transparent', border: `1px solid ${dahila.borderStrong}`, borderRadius: 999,
          cursor: 'pointer', padding: '7px 14px',
          fontFamily: dahila.fontSans, fontSize: 12, fontWeight: 400,
          color: active ? '#B6314A' : dahila.ink900,
          transition: `color 140ms ${dahila.ease}`,
        }}
      >
        <span key={active ? 'on' : 'off'} className={active && touched ? 'fav-pop' : undefined} style={{ display: 'inline-flex' }}><Icon name="heart" size={size ?? 18} weight={active ? 'fill' : 'light'} color={active ? '#B6314A' : dahila.ink700} /></span>
        {active ? 'Guardado en favoritos' : 'Guardar en favoritos'}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className="card-fav"
      style={{
        // 44px: mínimo de touch target táctil (WCAG/Apple/Google) — antes 34px,
        // el mismo problema que ya se arregló en el stepper del carrito. El
        // área es transparente y lo que se ve es un círculo de 32 (VIS-07): el
        // de 44 blanco tapaba demasiada foto en una tarjeta de 164 px.
        width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: 999,
        background: 'transparent', padding: 0,
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? '#B6314A' : dahila.ink700,
        transition: `color 140ms ${dahila.ease}, transform 140ms ${dahila.ease}`,
      }}
    >
      <span aria-hidden="true" style={{
        width: 32, height: 32, borderRadius: 999,
        background: 'rgba(255,255,255,0.85)', boxShadow: dahila.shadowSm,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span key={active ? 'on' : 'off'} className={active && touched ? 'fav-pop' : undefined} style={{ display: 'inline-flex' }}><Icon name="heart" size={size ?? 16} weight={active ? 'fill' : 'light'} color={active ? '#B6314A' : dahila.ink700} /></span>
      </span>
    </button>
  )
}
