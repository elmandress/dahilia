'use client'

// Controles de seguimiento y producción de un pedido (12/10/2026): etapa que
// ve la clienta en /pedido, tejedora asignada, pago y si ya se le pagó.
// Requiere database/seguimiento-pedidos-2026-10.sql.

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ORDER_STAGES, type OrderStage } from '@/lib/order-tracking'
import { SITE_URL } from '@/lib/env'

export interface ProductionFields {
  id: string
  tracking_code?: string | null
  stage?: OrderStage | null
  weaver_id?: string | null
  weaver_pay_uyu?: number | null
  weaver_paid?: boolean | null
}

export interface WeaverOption { id: string; name: string }

const inputStyle: React.CSSProperties = { fontSize: 12.5, padding: '6px 8px', borderRadius: 6, border: '1px solid rgba(31,26,27,0.18)', background: '#fff' }

export function ProduccionControls({ order, weavers, onChange }: {
  order: ProductionFields
  weavers: WeaverOption[]
  onChange: (patch: Partial<ProductionFields>) => void
}) {
  const [pay, setPay] = useState(order.weaver_pay_uyu != null ? String(order.weaver_pay_uyu) : '')
  const [msg, setMsg] = useState<string | null>(null)

  const save = async (patch: Record<string, unknown>) => {
    setMsg(null)
    const { data, error } = await createClient().from('orders').update(patch).eq('id', order.id).select('id')
    if (error || !data || data.length === 0) {
      setMsg(/stage|weaver|tracking/.test(error?.message ?? '')
        ? 'Falta correr database/seguimiento-pedidos-2026-10.sql en Supabase.'
        : 'No se pudo guardar. Probá de nuevo.')
      return false
    }
    onChange(patch as Partial<ProductionFields>)
    return true
  }

  const copyTracking = async () => {
    if (!order.tracking_code) return
    const host = SITE_URL.replace(/^https?:\/\//, '')
    const text = `¡Hola! Tu pedido ${order.tracking_code} ya está en marcha. Podés seguirlo acá: ${host}/pedido?codigo=${order.tracking_code}`
    try {
      await navigator.clipboard.writeText(text)
      setMsg('Mensaje copiado: pegalo en el chat de la clienta.')
    } catch {
      window.prompt('Copiá este mensaje:', text)
    }
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed rgba(31,26,27,0.14)', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', fontSize: 12.5, color: '#4A4143' }}>
        {order.tracking_code && <code style={{ fontSize: 12.5, background: '#F3EEE9', padding: '3px 7px', borderRadius: 6 }}>{order.tracking_code}</code>}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Etapa
          <select
            value={order.stage ?? 'recibido'}
            onChange={(e) => save({ stage: e.target.value, stage_updated_at: new Date().toISOString() })}
            style={inputStyle}
          >
            {ORDER_STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          Tejedora
          <select value={order.weaver_id ?? ''} onChange={(e) => save({ weaver_id: e.target.value || null })} style={inputStyle}>
            <option value="">Anush</option>
            {weavers.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>
        {order.weaver_id && (
          <>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              Pago $
              <input
                type="number" inputMode="numeric" min={0} value={pay}
                onChange={(e) => setPay(e.target.value)}
                onBlur={() => { const n = parseInt(pay); save({ weaver_pay_uyu: Number.isFinite(n) && n >= 0 ? n : null }) }}
                style={{ ...inputStyle, width: 90 }}
              />
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={!!order.weaver_paid} onChange={(e) => save({ weaver_paid: e.target.checked })} />
              Pagado
            </label>
          </>
        )}
        {order.tracking_code && (
          <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={copyTracking}>
            Copiar mensaje de seguimiento
          </button>
        )}
      </div>
      {msg && <span role="status" style={{ fontSize: 12.5, color: /Falta|No se pudo/.test(msg) ? '#7a1e2f' : '#2e7d32' }}>{msg}</span>}
    </div>
  )
}
