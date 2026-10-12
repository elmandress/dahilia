'use client'

import { useState } from 'react'
import { useFavorites } from './FavoritesProvider'
import { dahila, Icon } from './ui/Primitives'

/**
 * Heart toggle for saving a piece to the wishlist. Two looks:
 *   - `overlay` (default): a round white chip for the corner of a product card.
 *   - `inline`: a text+heart row for the product page.
 * The fill + colour flip is optimistic (see FavoritesProvider).
 */
export function FavoriteButton({
  productId,
  variant = 'overlay',
  size = 18,
}: {
  productId: string
  variant?: 'overlay' | 'inline'
  size?: number
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
          background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 0',
          fontFamily: dahila.fontSans, fontSize: 13, fontWeight: 400,
          color: active ? '#B6314A' : dahila.ink700,
          transition: `color 140ms ${dahila.ease}`,
        }}
      >
        <span key={active ? 'on' : 'off'} className={active && touched ? 'fav-pop' : undefined} style={{ display: 'inline-flex' }}><Icon name="heart" size={size} weight={active ? 'fill' : 'light'} color={active ? '#B6314A' : dahila.ink700} /></span>
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
        // el mismo problema que ya se arregló en el stepper del carrito.
        width: 44, height: 44, minWidth: 44, minHeight: 44, borderRadius: 999,
        background: 'rgba(255,255,255,0.94)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: active ? '#B6314A' : dahila.ink700,
        boxShadow: dahila.shadowSm,
        transition: `color 140ms ${dahila.ease}, transform 140ms ${dahila.ease}`,
      }}
    >
      <span key={active ? 'on' : 'off'} className={active && touched ? 'fav-pop' : undefined} style={{ display: 'inline-flex' }}><Icon name="heart" size={size} weight={active ? 'fill' : 'light'} color={active ? '#B6314A' : dahila.ink700} /></span>
    </button>
  )
}
