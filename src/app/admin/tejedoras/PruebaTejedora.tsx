'use client'

// Ficha de la muestra pagada de una tejedora (12/10/2026). Anush prueba a
// muchas para delegar muchos pedidos: con el mismo formulario para todas, el
// panel compara horas, calidad y si la cuenta de delegación cierra.

import { useState } from 'react'
import { delegationCheck, formatUyu, HOURLY_FLOOR_UYU, DELEGATION_MAX_SHARE } from '@/lib/pricing'
import { parseNum } from '@/lib/product-costs'
import type { WeaverApplication } from '@/lib/types'

export interface SampleProduct {
  id: string
  name: string
  /** Precio de referencia (base, o el talle más barato). */
  price: number
  /** Costo de materiales (product_costs), si está cargado. */
  materials: number | null
}

export interface SampleValues {
  sample_product_id: string | null
  sample_hours: number | null
  sample_quality: number | null
  sample_rate_uyu: number | null
}

/** Resultado de delegación para una postulación ya guardada (para el ranking). */
export function delegationFor(a: WeaverApplication, products: SampleProduct[]) {
  const p = products.find((x) => x.id === a.sample_product_id)
  const hours = Number(a.sample_hours)
  if (!p || !(hours > 0)) return null
  return delegationCheck({ hours, rate: a.sample_rate_uyu ?? HOURLY_FLOOR_UYU, materials: p.materials ?? 0, price: p.price })
}

export function PruebaTejedora({ app, products, onSave }: {
  app: WeaverApplication
  products: SampleProduct[]
  onSave: (values: SampleValues) => Promise<boolean>
}) {
  const [productId, setProductId] = useState(app.sample_product_id ?? '')
  const [hours, setHours] = useState(app.sample_hours != null ? String(Number(app.sample_hours)) : '')
  const [quality, setQuality] = useState<number | null>(app.sample_quality ?? null)
  const [rate, setRate] = useState(String(app.sample_rate_uyu ?? HOURLY_FLOOR_UYU))
  const [saving, setSaving] = useState(false)

  const product = products.find((p) => p.id === productId)
  const h = parseNum(hours)
  const r = parseNum(rate)
  const check = product && h && r != null
    ? delegationCheck({ hours: h, rate: r, materials: product.materials ?? 0, price: product.price })
    : null

  const save = async () => {
    setSaving(true)
    await onSave({
      sample_product_id: productId || null,
      sample_hours: h != null && h > 0 ? Math.round(h * 10) / 10 : null,
      sample_quality: quality,
      sample_rate_uyu: r != null && r > 0 ? Math.round(r) : null,
    })
    setSaving(false)
  }

  const input: React.CSSProperties = { padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(31,26,27,0.18)', fontSize: '0.85rem', width: '100%' }
  const label: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: '0.8rem', color: '#4A4143' }

  return (
    <details style={{ margin: '0 0 0.75rem', border: '1px solid #EDE6DE', borderRadius: 10, padding: '10px 12px', background: '#FCFAF6' }}
      open={app.status === 'sample'}>
      <summary style={{ cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, color: '#1F1A1B' }}>
        Muestra cronometrada {check ? (check.ok ? '· ✓ delegable' : '· ✗ no cierra') : ''}
      </summary>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 10 }}>
        <label style={label}>
          Modelo que tejió
          <select value={productId} onChange={(e) => setProductId(e.target.value)} style={input}>
            <option value="">— Elegir —</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <label style={label}>
          Horas que le llevó
          <input type="number" inputMode="decimal" min={0} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Ej. 9,5" style={input} />
        </label>
        <label style={label}>
          Tarifa por hora ($)
          <input type="number" inputMode="numeric" min={0} value={rate} onChange={(e) => setRate(e.target.value)} style={input} />
        </label>
      </div>

      <div style={{ marginTop: 10 }}>
        <span style={{ fontSize: '0.8rem', color: '#4A4143' }}>Calidad (tensión pareja, terminaciones, medidas)</span>
        <div role="radiogroup" aria-label="Calidad de la muestra" style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={quality === n}
              onClick={() => setQuality(quality === n ? null : n)}
              style={{
                width: 40, height: 36, borderRadius: 8, cursor: 'pointer', fontSize: 14,
                border: `1px solid ${quality === n ? '#8F3B53' : 'rgba(31,26,27,0.18)'}`,
                background: quality != null && n <= quality ? '#8F3B53' : '#fff',
                color: quality != null && n <= quality ? '#fff' : '#4A4143',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {check && product && (
        <div style={{
          marginTop: 10, padding: '10px 12px', borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.6,
          background: check.ok ? 'rgba(30,132,73,0.08)' : 'rgba(182,49,74,0.07)',
          color: check.ok ? '#1E5E3A' : '#7a1e2f',
        }}>
          <strong>{check.ok ? 'Se puede delegar' : 'Así no cierra'}</strong>: {product.name} se vende a {formatUyu(product.price)}.
          Le pagás {formatUyu(check.pay)} ({h} h × {formatUyu(r ?? 0)})
          {product.materials != null ? ` + ${formatUyu(product.materials)} de materiales` : ' (materiales sin cargar)'}
          {' '}= {formatUyu(check.cost)}, contra un tope de {formatUyu(check.limit)} ({Math.round(DELEGATION_MAX_SHARE * 100)}% del precio).
          {' '}A Dahila le quedan {formatUyu(Math.max(0, check.brandKeeps))} ({Math.max(0, check.brandPct)}%).
          {!check.ok && check.maxRate != null && <> La tarifa más alta que cierra para este modelo es {formatUyu(check.maxRate)}/h.</>}
        </div>
      )}

      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" style={{ marginTop: 10 }} onClick={save} disabled={saving}>
        {saving ? 'Guardando…' : 'Guardar muestra'}
      </button>
    </details>
  )
}
