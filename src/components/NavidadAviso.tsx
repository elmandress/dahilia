'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { dahila, Icon } from './ui/Primitives'
import { formatDay, navidadForProduct, parseDay } from '@/lib/navidad'

/**
 * Aviso "llega para Navidad" — ver lib/navidad.ts. Se decide en el cliente:
 * el HTML de la tienda está cacheado hasta 1 h y la fecha de corte no puede
 * depender de cuándo se generó la página. Hasta montar, no dibuja nada.
 */
function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    // Leer el reloj real al montar es justamente el caso de uso de un efecto.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date())
  }, [])
  return now
}

/** Las fechas viajan como texto ("2026-12-05"): un Date no cruza al cliente. */
export function NavidadFicha({ encargoHasta, stockHasta, readyNow, leadMaxWeeks }: {
  encargoHasta?: string
  stockHasta?: string
  readyNow: boolean
  leadMaxWeeks: number
}) {
  const now = useNow()
  if (!now) return null
  const text = navidadForProduct(
    { encargoHasta: parseDay(encargoHasta), stockHasta: parseDay(stockHasta) },
    { readyNow, leadMaxWeeks, now },
  )
  if (!text) return null
  return (
    <p style={{
      display: 'flex', alignItems: 'flex-start', gap: 8, margin: 0,
      padding: '10px 12px', borderRadius: 10,
      background: 'rgba(143,59,83,0.06)', border: '1px solid rgba(143,59,83,0.18)',
      fontFamily: dahila.fontSans, fontSize: 13, lineHeight: 1.5, color: dahila.ink900,
    }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}><Icon name="gift" size={16} color={dahila.wine600} /></span>
      <span>{text}</span>
    </p>
  )
}

/** Franja de la home: las dos fechas y los caminos para regalar. */
export function NavidadHome({ encargoHasta, stockHasta, hasReadyToShip, giftEnabled }: {
  encargoHasta?: string
  stockHasta?: string
  hasReadyToShip: boolean
  giftEnabled: boolean
}) {
  const now = useNow()
  if (!now) return null
  const xmas = new Date(now.getFullYear(), 11, 24, 23, 59, 59)
  if (now > xmas) return null
  const enc = parseDay(encargoHasta)
  const stock = parseDay(stockHasta)
  const parts: string[] = []
  if (enc && now <= enc) parts.push(`encargos a medida hasta el ${formatDay(enc)}`)
  if (stock && now <= stock && hasReadyToShip) parts.push(`piezas ya tejidas hasta el ${formatDay(stock)}`)
  if (parts.length === 0) return null

  const linkStyle: React.CSSProperties = {
    color: dahila.wine600, textDecoration: 'underline', textUnderlineOffset: 3,
    fontFamily: dahila.fontSans, fontSize: 13, whiteSpace: 'nowrap',
  }
  return (
    <section aria-label="Regalos para Navidad" style={{ maxWidth: 1280, margin: '24px auto 0', padding: '0 24px' }}>
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px 18px',
        padding: '14px 18px', borderRadius: 14,
        background: dahila.cream100, border: `1px solid ${dahila.border}`,
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: dahila.fontSans, fontSize: 14, color: dahila.ink900 }}>
          <Icon name="gift" size={18} color={dahila.wine600} />
          <span><strong style={{ fontWeight: 500 }}>Para que llegue en Navidad:</strong> {parts.join(' · ')}.</span>
        </span>
        <span style={{ display: 'inline-flex', gap: 16, flexWrap: 'wrap' }}>
          {hasReadyToShip && <Link href="/tienda?ya=1" style={linkStyle}>Ver lo que está en stock</Link>}
          {giftEnabled && <Link href="/regalo" style={linkStyle}>¿No sabés el talle? Regalá una tarjeta</Link>}
        </span>
      </div>
    </section>
  )
}
