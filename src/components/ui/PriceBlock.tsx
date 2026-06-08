import { dahila } from './Primitives'
import { formatPrice } from '@/lib/types'

const SALE = '#B6314A'

// One source of truth for how a price renders across the store: final price,
// struck-through list price when discounted, consistent colour + weight. Sizes
// map to where it's used so the visual rhythm stays identical card→PDP→cart.
const SIZES = {
  sm: { final: 13, list: 11 }, // product card / cart drawer line
  md: { final: 16, list: 14 }, // PDP / quick-view
  lg: { final: 18, list: 14 }, // emphasis
} as const

export function PriceBlock({
  list,
  final,
  size = 'sm',
  align = 'start',
  soldOut = false,
}: {
  /** List (pre-discount) price. */
  list: number
  /** Final price the customer pays. */
  final: number
  size?: keyof typeof SIZES
  align?: 'start' | 'end'
  /** When true, show "Agotado" instead of a price. */
  soldOut?: boolean
}) {
  const s = SIZES[size]
  const discounted = final < list && list > 0

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
        {formatPrice(final)}
      </span>
    )
  }

  // Discounted: final in sale red + struck list price. Inline when end-aligned
  // (PDP/cart), stacked when start-aligned compact (card).
  const stacked = align === 'end'
  return (
    <span style={{
      display: 'inline-flex',
      flexDirection: stacked ? 'column' : 'row',
      alignItems: stacked ? 'flex-end' : 'baseline',
      gap: stacked ? 0 : 8,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontFamily: dahila.fontSans, fontSize: s.final, fontWeight: 500, color: SALE }}>
        {formatPrice(final)}
      </span>
      <span style={{ fontFamily: dahila.fontSans, fontSize: s.list, color: dahila.ink500, textDecoration: 'line-through' }}>
        {formatPrice(list)}
      </span>
    </span>
  )
}
