import { dahila } from './tokens'
import { formatPrice } from '@/lib/types'

const SALE = '#B6314A'

// One source of truth for how a price renders across the store: final price,
// struck-through list price when discounted, consistent colour + weight. Sizes
// map to where it's used so the visual rhythm stays identical card→PDP→cart.
const SIZES = {
  // product card / cart drawer line / barra fija. 14/12 y no 13/11: el
  // tachado de 11 px en gris no se leía en el celular (VIS-09, 04/11/2026).
  sm: { final: 14, list: 12 },
  md: { final: 16, list: 14 }, // PDP / quick-view
  lg: { final: 18, list: 14 }, // emphasis
} as const

export function PriceBlock({
  list,
  final,
  size = 'sm',
  align = 'start',
  soldOut = false,
  from = false,
}: {
  /** List (pre-discount) price. */
  list: number
  /** Final price the customer pays. */
  final: number
  size?: keyof typeof SIZES
  /** 'responsive': apilado a la derecha en escritorio y en fila en el celular
   *  (.price-block--responsive en globals.css; la tarjeta de producto). */
  align?: 'start' | 'end' | 'responsive'
  /** When true, show "Agotado" instead of a price. */
  soldOut?: boolean
  /** El precio cambia según el talle y se muestra el más bajo: antepone
   *  "Desde" para que la ficha no "suba" el precio por sorpresa. */
  from?: boolean
}) {
  const s = SIZES[size]
  const discounted = final < list && list > 0
  const fromLabel = from ? (
    <span style={{ fontFamily: dahila.fontSans, fontSize: s.list, fontWeight: 400, color: dahila.ink700, marginRight: 4 }}>
      Desde
    </span>
  ) : null

  if (soldOut) {
    return (
      <span style={{ fontFamily: dahila.fontSans, fontSize: s.final, fontWeight: 400, color: dahila.ink500 }}>
        Agotado
      </span>
    )
  }

  if (!discounted) {
    return (
      <span style={{ fontFamily: dahila.fontSans, fontSize: s.final, fontWeight: 400, color: dahila.ink900, whiteSpace: 'nowrap' }}>
        {fromLabel}{formatPrice(final)}
      </span>
    )
  }

  // Discounted: final in sale red + struck list price. Stacked when
  // end-aligned, inline when start-aligned (PDP/cart). 'responsive' leaves the
  // direction to the CSS class, so the media query can switch it (an inline
  // flexDirection would always win).
  const stacked = align === 'end'
  const responsive = align === 'responsive'
  return (
    <span className={responsive ? 'price-block--responsive' : undefined} style={{
      display: 'inline-flex',
      ...(responsive ? {} : {
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'flex-end' : 'baseline',
        gap: stacked ? 0 : 8,
      }),
      whiteSpace: 'nowrap',
    }}>
      {/* Quien no ve el tachado oía dos precios sin saber cuál paga (RSAM-5,
          WCAG 1.3.1): "Con descuento: UYU 1.360, antes UYU 1.600". */}
      <span style={{ whiteSpace: 'nowrap' }}>
        <span className="sr-only">Con descuento: </span>
        {fromLabel}
        <span style={{ fontFamily: dahila.fontSans, fontSize: s.final, fontWeight: 500, color: SALE }}>
          {formatPrice(final)}
        </span>
      </span>
      <span className="sr-only">, antes </span>
      <span style={{ fontFamily: dahila.fontSans, fontSize: s.list, color: dahila.ink500, textDecoration: 'line-through' }}>
        {formatPrice(list)}
      </span>
    </span>
  )
}
