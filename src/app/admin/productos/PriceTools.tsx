'use client'

// Herramientas de precio del editor de productos (nuevo y editar) — 08/10/2026.
//
// - SameSizePrice: un solo precio para todos los talles de una vez, en vez de
//   escribirlo talle por talle.
// - CalculadoraPrecio: la misma cuenta de /admin/estrategia (calcPrice en
//   lib/pricing.ts), pero dentro de la prenda, con sus horas y materiales, y
//   con botones para pasar el resultado al precio. "Usar" solo completa los
//   campos: nada cambia en la tienda hasta tocar Guardar.

import { useState } from 'react'
import { calcPrice, formatUyu } from '@/lib/pricing'

function num(s: string): number {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isNaN(n) || n < 0 ? 0 : n
}

const boxStyle: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 8,
  background: '#FAF7F5', border: '1px solid #E8E0DC', borderRadius: 10,
  padding: '10px 12px', marginBottom: 12,
}

export function SameSizePrice({
  basePrice,
  onApply,
  onUseBase,
}: {
  /** Precio base actual, para precargar el campo. */
  basePrice: string
  /** Pone `price` como precio de cada talle. */
  onApply: (price: string) => void
  /** Vacía el precio de cada talle: todos pasan a usar el precio base. */
  onUseBase: () => void
}) {
  const [value, setValue] = useState('')
  const price = value.trim() || basePrice.trim()
  return (
    <div style={boxStyle}>
      <div className="admin-field" style={{ flex: '1 1 160px', margin: 0 }}>
        <label htmlFor="same-size-price">Mismo precio para todos los talles</label>
        <input
          id="same-size-price"
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={basePrice ? `Ej. ${basePrice}` : 'Ej. 3450'}
        />
      </div>
      <button
        type="button"
        className="admin-btn admin-btn-secondary admin-btn-sm"
        disabled={!price || num(price) <= 0}
        onClick={() => { onApply(String(Math.round(num(price)))); setValue('') }}
      >
        Poner en todos
      </button>
      <button
        type="button"
        className="admin-btn admin-btn-secondary admin-btn-sm"
        onClick={onUseBase}
        title="Borra el precio de cada talle: todos se venden al precio base"
      >
        Todos al precio base
      </button>
    </div>
  )
}

export function CalculadoraPrecio({
  hours, setHours,
  materials, setMaterials,
  showHours, setShowHours,
  currentPrice,
  hasSizes,
  onUseBase,
  onUseAllSizes,
}: {
  hours: string
  setHours: (v: string) => void
  materials: string
  setMaterials: (v: string) => void
  /** Si las horas se muestran en la ficha pública (columna knit_hours). */
  showHours: boolean
  setShowHours: (v: boolean) => void
  /** Precio base actual, para comparar. */
  currentPrice: number | null
  hasSizes: boolean
  onUseBase: (price: number) => void
  onUseAllSizes: (price: number) => void
}) {
  // Los supuestos generales viven solo en la pantalla (como en la Calculadora
  // de estrategia): lo que se guarda por prenda son horas y materiales.
  const [packaging, setPackaging] = useState('40')
  const [others, setOthers] = useState('0')
  const [rate, setRate] = useState('150')
  const [margin, setMargin] = useState('15')
  const [commission, setCommission] = useState('0')

  const h = num(hours)
  const r = calcPrice({
    hours: h, materials: num(materials), packaging: num(packaging), others: num(others),
    rate: num(rate), margin: num(margin), commission: num(commission),
  })
  const diff = currentPrice != null && currentPrice > 0 && h > 0 ? r.recommended - currentPrice : null

  const field = (id: string, label: string, value: string, set: (v: string) => void, hint?: string) => (
    <div className="admin-field" style={{ margin: 0 }}>
      <label htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="decimal" min={0} value={value} onChange={(e) => set(e.target.value)} />
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div className="admin-form-grid">
        {field('calc-hours', 'Horas de tejido', hours, setHours, 'Lo ideal: cronometrar una pieza real.')}
        {field('calc-materials', 'Materiales ($)', materials, setMaterials, 'Lana, botones, forro.')}
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={showHours}
          onChange={(e) => setShowHours(e.target.checked)}
          disabled={h <= 0}
          style={{ accentColor: '#8F3B53', width: 18, height: 18, marginTop: 1 }}
        />
        <span style={{ fontSize: '0.88rem', color: '#4A4143' }}>
          Mostrar las horas en la ficha
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#8C8285', marginTop: 2 }}>
            {h > 0
              ? <>Va a decir: “Lleva unas {h.toLocaleString('es-UY')} horas de tejido a mano, punto por punto.” Marcalo solo si el número es real, no una estimación.</>
              : 'Cargá las horas para poder mostrarlas.'}
            {' '}Los materiales nunca se muestran.
          </span>
        </span>
      </label>

      <details>
        <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#8F3B53' }}>
          Supuestos de la cuenta (tarifa, margen, comisión…)
        </summary>
        <div className="admin-form-grid" style={{ marginTop: 10 }}>
          {field('calc-rate', 'Tarifa por hora ($)', rate, setRate, 'Mínimo nacional ~$127. Referencia: $150–250.')}
          {field('calc-margin', 'Margen de marca (%)', margin, setMargin, 'Para reinvertir: fotos, muestras, packaging.')}
          {field('calc-packaging', 'Packaging ($)', packaging, setPackaging)}
          {field('calc-others', 'Otros costos ($)', others, setOthers, 'Envío que absorbés, feria…')}
          {field('calc-commission', 'Comisión de cobro (%)', commission, setCommission, 'Mercado Pago ~6%. Transferencia: 0.')}
        </div>
      </details>

      <div style={{ borderRadius: 10, border: '1px solid rgba(143,59,83,0.25)', background: 'rgba(143,59,83,0.05)', padding: '14px 16px' }}>
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8C8285' }}>Precio que da la cuenta</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300, color: '#1F1A1B', margin: '2px 0 8px' }}>
          {h > 0 ? formatUyu(r.recommended) : '—'}
        </div>
        {h > 0 ? (
          <>
            <ul style={{ margin: '0 0 8px', paddingLeft: 18, fontSize: 13, lineHeight: 1.6, color: '#4A4043' }}>
              <li>Materiales y costos: {formatUyu(r.costs)}</li>
              <li>Trabajo: {h.toLocaleString('es-UY')} h × {formatUyu(num(rate))} = {formatUyu(r.labour)}</li>
              <li>Margen de marca ({num(margin)}%): {formatUyu(r.marginAmount)}</li>
              {r.commissionPct > 0 && <li>Comisión ({r.commissionPct}%): {formatUyu(r.commissionAmount)}</li>}
            </ul>
            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#4A4043' }}>
              A ese precio te quedan <strong>{formatUyu(Math.max(0, r.youKeep))}</strong> limpios
              {r.perHour != null && <> — <strong>{formatUyu(r.perHour)} por hora</strong></>}.
              {diff != null && diff !== 0 && (
                <> El precio base de hoy ({formatUyu(currentPrice as number)}) está {formatUyu(Math.abs(diff))} {diff > 0 ? 'por debajo' : 'por encima'}.</>
              )}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onUseBase(r.recommended)}>
                Usar {formatUyu(r.recommended)} como precio base
              </button>
              {hasSizes && (
                <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onUseAllSizes(r.recommended)}>
                  Ponerlo en todos los talles
                </button>
              )}
            </div>
            <p style={{ margin: '8px 0 0', fontSize: 11.5, color: '#8C8285' }}>
              Solo completa el campo: se aplica en la tienda cuando tocás Guardar.
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: 13, color: '#8C8285' }}>Cargá las horas de tejido para calcular.</p>
        )}
      </div>
    </div>
  )
}
