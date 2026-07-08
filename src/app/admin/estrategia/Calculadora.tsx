'use client'

// Calculadora de precios — herramienta interna para decidir el precio de una
// pieza nueva (o revisar una existente) sin hacer cuentas a mano.
//
// Fórmula (la estándar del pricing artesanal, transparente):
//   costos   = materiales + packaging + otros
//   trabajo  = horas × tarifa por hora
//   base     = costos + trabajo
//   c/margen = base × (1 + margen%)          ← margen de marca: reinversión, fotos, muestras
//   precio   = c/margen ÷ (1 − comisión%)    ← así la comisión no se come tu margen
// Redondeado hacia arriba a la decena.

import { useState } from 'react'
import { PRICE_TABLE, contribPerHour } from './data'

interface Props {
  /** Precios vivos de la tienda, por slug (para comparar contra el actual). */
  livePrices: Record<string, number | null>
}

const money = (n: number) => `$${n.toLocaleString('es-UY')}`

function num(s: string): number {
  const n = parseFloat(s.replace(',', '.'))
  return isNaN(n) || n < 0 ? 0 : n
}

export default function Calculadora({ livePrices }: Props) {
  const [productSlug, setProductSlug] = useState('')
  const [hours, setHours] = useState('12')
  const [materials, setMaterials] = useState('300')
  const [packaging, setPackaging] = useState('40')
  const [others, setOthers] = useState('0')
  const [rate, setRate] = useState('150')
  const [margin, setMargin] = useState('15')
  const [commission, setCommission] = useState('0')

  const product = PRICE_TABLE.find((r) => r.slug === productSlug) ?? null
  const currentPrice = product ? (livePrices[product.slug] ?? product.today ?? product.before) : null

  const pickProduct = (slug: string) => {
    setProductSlug(slug)
    const row = PRICE_TABLE.find((r) => r.slug === slug)
    if (row) {
      if (row.hours != null) setHours(String(row.hours))
      if (row.materials != null) setMaterials(String(row.materials))
    }
  }

  const h = num(hours)
  const costs = num(materials) + num(packaging) + num(others)
  const labour = h * num(rate)
  const base = costs + labour
  const withMargin = base * (1 + num(margin) / 100)
  const commissionPct = Math.min(30, num(commission))
  const raw = commissionPct > 0 ? withMargin / (1 - commissionPct / 100) : withMargin
  const recommended = Math.ceil(raw / 10) * 10

  const commissionAmount = Math.round(recommended * (commissionPct / 100))
  const youKeep = recommended - commissionAmount - costs
  const perHour = h > 0 ? Math.round(youKeep / h) : null

  const currentPerHour = product && currentPrice != null && product.hours && product.materials != null
    ? contribPerHour(product, currentPrice)
    : null

  const diff = currentPrice != null ? recommended - currentPrice : null

  const inputRow = (
    id: string, label: string, value: string, set: (v: string) => void, suffix: string, hint?: string
  ) => (
    <div className="est-calc-field">
      <label htmlFor={id}>{label}</label>
      <div className="wrap">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          onChange={(e) => set(e.target.value)}
        />
        <span className="suffix">{suffix}</span>
      </div>
      {hint && <span className="hint">{hint}</span>}
    </div>
  )

  return (
    <div className="est-calc">
      <div className="est-calc-form">
        <div className="est-calc-field" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="calc-product">Precargar desde un producto (opcional)</label>
          <div className="wrap">
            <select id="calc-product" value={productSlug} onChange={(e) => pickProduct(e.target.value)}>
              <option value="">Pieza nueva — completo yo los datos</option>
              {PRICE_TABLE.filter((r) => r.hours != null).map((r) => (
                <option key={r.slug} value={r.slug}>{r.name}</option>
              ))}
            </select>
          </div>
          <span className="hint">Trae las horas y materiales estimados de la tabla, y compara con el precio actual de la tienda.</span>
        </div>

        {inputRow('calc-hours', 'Horas de tejido', hours, setHours, 'h')}
        {inputRow('calc-materials', 'Materiales (lana, botones…)', materials, setMaterials, '$')}
        {inputRow('calc-packaging', 'Packaging', packaging, setPackaging, '$', 'Bolsa, papel de seda, tarjeta.')}
        {inputRow('calc-others', 'Otros costos', others, setOthers, '$', 'Envío que absorbés, feria, etc.')}
        {inputRow('calc-rate', 'Tu tarifa por hora', rate, setRate, '$/h', 'Referencia: $150–250. El mínimo nacional es ~$110.')}
        {inputRow('calc-margin', 'Margen de marca', margin, setMargin, '%', 'Para reinvertir: fotos, lana de muestra, packaging mejor.')}
        {inputRow('calc-commission', 'Comisión de cobro', commission, setCommission, '%', 'Mercado Pago ~6%. Transferencia o efectivo: 0.')}
      </div>

      <div className="est-calc-result">
        <div className="big">
          <span className="lbl">Precio recomendado</span>
          <span className="price">{h > 0 ? money(recommended) : '—'}</span>
        </div>

        {h > 0 && (
          <>
            <ul className="breakdown">
              <li><span>Materiales y costos</span><span>{money(Math.round(costs))}</span></li>
              <li><span>Tu trabajo ({h} h × {money(num(rate))})</span><span>{money(Math.round(labour))}</span></li>
              <li><span>Margen de marca ({num(margin)}%)</span><span>{money(Math.round(withMargin - base))}</span></li>
              {commissionPct > 0 && <li><span>Comisión ({commissionPct}%)</span><span>{money(commissionAmount)}</span></li>}
            </ul>
            <p className="keep">
              A ese precio te quedan <strong>{money(Math.max(0, Math.round(youKeep)))}</strong> limpios por pieza
              {perHour != null && <> — <strong>{money(perHour)} por hora</strong> de trabajo</>}.
            </p>
          </>
        )}

        {product && currentPrice != null && h > 0 && (
          <div className="compare">
            <div className="row">
              <span>Precio actual en la tienda</span>
              <span>{money(currentPrice)}{currentPerHour != null && <em> · {money(currentPerHour)}/h</em>}</span>
            </div>
            {product.target != null && (
              <div className="row">
                <span>Meta a 12 meses</span>
                <span>{money(product.target)}</span>
              </div>
            )}
            {diff != null && diff !== 0 && (
              <p className={`verdict ${diff > 0 ? 'under' : 'over'}`}>
                {diff > 0
                  ? `El precio actual está ${money(diff)} por debajo de lo que recomienda esta cuenta. No hace falta corregirlo de golpe: es el argumento para el próximo paso de la tabla.`
                  : `El precio actual ya está ${money(-diff)} por encima de esta cuenta — bien: significa que la marca ya paga tu trabajo con margen.`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
