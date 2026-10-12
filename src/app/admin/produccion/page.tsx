'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/types'
import { ORDER_STAGES, type OrderStage } from '@/lib/order-tracking'

/**
 * Producción (12/10/2026). La idea de Mati: delegar muchos pedidos en la red
 * de tejedoras para que Anush teja lo más difícil y haga más videos. Para eso
 * hace falta ver de un vistazo qué se está tejiendo, quién lo teje, en qué
 * etapa está y cuánto se le debe a cada una. Antes vivía en WhatsApp.
 *
 * Fuente: la tabla `orders` (pedidos de la tienda), con las columnas de
 * database/seguimiento-pedidos-2026-10.sql. Se edita desde /admin/pedidos.
 * Solo pedidos vendidos o sin marcar (los "no se concretó" no se producen).
 */

interface Row {
  id: string
  created_at: string
  tracking_code: string | null
  status: string | null
  stage: OrderStage | null
  stage_updated_at: string | null
  weaver_id: string | null
  weaver_pay_uyu: number | null
  weaver_paid: boolean | null
  items: Array<{ name: string; size: string; qty: number }> | null
}

const COLUMNS: OrderStage[] = ['confirmado', 'tejiendo', 'terminado', 'enviado']

export default function ProduccionPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [weavers, setWeavers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [now, setNow] = useState(0)

  const load = useCallback(async () => {
    const supabase = createClient()
    const since = new Date(Date.now() - 60 * 86_400_000).toISOString()
    const [{ data, error }, { data: ws }] = await Promise.all([
      supabase.from('orders')
        .select('id, created_at, tracking_code, status, stage, stage_updated_at, weaver_id, weaver_pay_uyu, weaver_paid, items')
        .neq('status', 'no_concreto')
        .gte('created_at', since)
        .order('created_at', { ascending: true }),
      supabase.from('weaver_applications').select('id, name'),
    ])
    if (error) setMissing(/stage|weaver|tracking|status/.test(error.message ?? '') || error.code === 'PGRST204' || error.code === '42703')
    setRows((data ?? []) as Row[])
    setWeavers(Object.fromEntries(((ws ?? []) as Array<{ id: string; name: string }>).map((w) => [w.id, w.name])))
    setNow(Date.now())
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  const days = (iso: string | null) => (iso && now ? Math.max(0, Math.floor((now - new Date(iso).getTime()) / 86_400_000)) : null)
  const byStage = (st: OrderStage) => rows.filter((r) => (r.stage ?? 'recibido') === st)
  const pendingConfirm = byStage('recibido').filter((r) => r.status === 'vendido')

  // Lo que se le debe a cada tejedora: pedidos terminados o enviados, sin pagar.
  const owed = new Map<string, { count: number; total: number; inProgress: number }>()
  for (const r of rows) {
    if (!r.weaver_id) continue
    const o = owed.get(r.weaver_id) ?? { count: 0, total: 0, inProgress: 0 }
    if ((r.stage === 'terminado' || r.stage === 'enviado') && !r.weaver_paid) { o.count += 1; o.total += r.weaver_pay_uyu ?? 0 }
    if (r.stage === 'confirmado' || r.stage === 'tejiendo') o.inProgress += 1
    owed.set(r.weaver_id, o)
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Producción</h2>
          <p>Qué se está tejiendo, quién lo teje y cuánto se le debe a cada tejedora. Se actualiza desde <Link href="/admin/pedidos" style={{ color: '#8F3B53' }}>Pedidos</Link>.</p>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setLoading(true); load() }}>Actualizar</button>
      </div>

      {missing && (
        <div className="admin-card" style={{ marginBottom: 16, fontSize: 13, color: '#7a1e2f' }}>
          Para usar este tablero falta correr <code>database/seguimiento-pedidos-2026-10.sql</code> en el SQL Editor de Supabase.
        </div>
      )}

      {pendingConfirm.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 16, fontSize: 13.5, color: '#4A4143' }}>
          {pendingConfirm.length === 1 ? 'Hay 1 pedido vendido' : `Hay ${pendingConfirm.length} pedidos vendidos`} todavía en &quot;Recibido&quot;: pasalos a
          {' '}&quot;Confirmado&quot; en <Link href="/admin/pedidos" style={{ color: '#8F3B53' }}>Pedidos</Link> para que entren al tablero (y la clienta lo vea).
        </div>
      )}

      {owed.size > 0 && (
        <div className="admin-card" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '1rem' }}>Tejedoras</h3>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Tejedora</th><th>Tejiendo ahora</th><th>Terminados sin pagar</th><th>A pagar</th></tr></thead>
              <tbody>
                {[...owed.entries()].map(([id, o]) => (
                  <tr key={id}>
                    <td>{weavers[id] ?? '—'}</td>
                    <td>{o.inProgress}</td>
                    <td>{o.count}</td>
                    <td style={{ fontWeight: 600 }}>{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, alignItems: 'start' }}>
        {COLUMNS.map((st) => {
          const list = byStage(st)
          const meta = ORDER_STAGES.find((s) => s.key === st)!
          return (
            <section key={st} aria-label={meta.label} style={{ background: '#FAF7F3', border: '1px solid #EDE6DE', borderRadius: 12, padding: 10 }}>
              <h3 style={{ margin: '2px 4px 10px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                {meta.label} <span style={{ color: '#8C8285', fontWeight: 400 }}>{list.length}</span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {list.length === 0 && <p style={{ margin: '4px', fontSize: 12.5, color: '#8C8285' }}>Nada acá.</p>}
                {list.map((r) => {
                  const d = days(r.stage_updated_at ?? r.created_at)
                  return (
                    <div key={r.id} style={{ background: '#fff', border: '1px solid #EDE6DE', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: '#4A4143' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <code>{r.tracking_code ?? 'sin código'}</code>
                        {d != null && <span style={{ color: d > 14 && st !== 'enviado' ? '#B6314A' : '#8C8285' }}>{d === 0 ? 'hoy' : `hace ${d} d`}</span>}
                      </div>
                      <ul style={{ margin: '6px 0', paddingLeft: 16 }}>
                        {(r.items ?? []).map((it, i) => <li key={i}>{it.name} · {it.size}{it.qty > 1 ? ` ×${it.qty}` : ''}</li>)}
                      </ul>
                      <div style={{ color: '#1F1A1B' }}>
                        {r.weaver_id ? weavers[r.weaver_id] ?? 'Tejedora' : 'Anush'}
                        {r.weaver_id && r.weaver_pay_uyu != null && <span style={{ color: '#8C8285' }}> · {formatPrice(r.weaver_pay_uyu)}{r.weaver_paid ? ' (pagado)' : ''}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
      <p style={{ marginTop: 14, fontSize: 12, color: '#8C8285' }}>
        Muestra los pedidos de los últimos 60 días. En rojo, los que llevan más de 2 semanas en la misma etapa.
      </p>
    </>
  )
}
