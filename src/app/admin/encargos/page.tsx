'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CustomOrder } from '@/lib/types'

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: 'all',         label: 'Todos' },
  { key: 'new',         label: 'Nuevos' },
  { key: 'replied',     label: 'Respondidos' },
  { key: 'in_progress', label: 'En proceso' },
  { key: 'done',        label: 'Completados' },
  { key: 'cancelled',   label: 'Cancelados' },
]

const STATUS_OPTIONS: Array<{ value: CustomOrder['status']; label: string }> = [
  { value: 'new',         label: 'Nuevo' },
  { value: 'replied',     label: 'Respondido' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'done',        label: 'Completado' },
  { value: 'cancelled',   label: 'Cancelado' },
]

function whatsappLinkFromOrder(order: CustomOrder): string | null {
  const candidate = order.whatsapp || ''
  const digits = candidate.replace(/\D/g, '')
  // Heuristic: assume Uruguay if only 8-9 digits and no country code.
  if (!digits) return null
  if (digits.length >= 11) return `https://wa.me/${digits}`
  return `https://wa.me/598${digits.replace(/^0+/, '')}`
}

export default function EncargosPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const loadOrders = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('custom_orders')
      .select('*')
      .order('created_at', { ascending: false })

    setOrders((data ?? []) as CustomOrder[])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders()
  }, [loadOrders])

  const updateStatus = async (id: string, newStatus: CustomOrder['status']) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('custom_orders')
      .update({ status: newStatus })
      .eq('id', id)

    if (!error) {
      setOrders((curr) => curr.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    }
  }

  const updateNotes = async (id: string, notes: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('custom_orders')
      .update({ admin_notes: notes })
      .eq('id', id)

    if (!error) {
      setOrders((curr) => curr.map((o) => (o.id === id ? { ...o, admin_notes: notes } : o)))
    }
  }

  const filteredOrders =
    filterStatus === 'all' ? orders : orders.filter((o) => o.status === filterStatus)

  const statusCounts: Record<string, number> = {
    all: orders.length,
    new: orders.filter((o) => o.status === 'new').length,
    replied: orders.filter((o) => o.status === 'replied').length,
    in_progress: orders.filter((o) => o.status === 'in_progress').length,
    done: orders.filter((o) => o.status === 'done').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Encargos a medida</h2>
          <p>Gestioná los pedidos personalizados.</p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filtrar encargos por estado"
        className="admin-status-tabs"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {STATUS_TABS.map((tab) => {
          const active = filterStatus === tab.key
          const count = statusCounts[tab.key] || 0
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilterStatus(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 14px',
                borderRadius: 999,
                fontFamily: 'var(--font-sans)',
                fontSize: 12,
                fontWeight: 500,
                letterSpacing: '0.04em',
                background: active ? '#1F1A1B' : '#fff',
                color: active ? '#fff' : '#4A4143',
                border: `1px solid ${active ? '#1F1A1B' : 'rgba(31,26,27,0.18)'}`,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 999,
                  background: active ? 'rgba(255,255,255,0.18)' : 'rgba(31,26,27,0.08)',
                }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="admin-card admin-empty">
          <p>No hay encargos en este estado.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredOrders.map((order) => {
            const waLink = whatsappLinkFromOrder(order)
            return (
              <article key={order.id} className="admin-card encargo-card">
                <header
                  style={{
                    display: 'flex', flexWrap: 'wrap', gap: 12,
                    justifyContent: 'space-between', alignItems: 'baseline',
                    paddingBottom: 10, borderBottom: '1px solid #eee', marginBottom: 12,
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '1rem', color: '#1F1A1B' }}>{order.customer_name}</strong>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 2, letterSpacing: '0.02em' }}>
                      {new Date(order.created_at).toLocaleDateString('es-UY', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                      {order.tracking_code && (
                        <> · <span style={{ fontFamily: 'monospace', color: '#555' }}>{order.tracking_code}</span></>
                      )}
                    </div>
                  </div>
                  <span className={`admin-badge ${order.status}`}>
                    {STATUS_OPTIONS.find((s) => s.value === order.status)?.label || order.status}
                  </span>
                </header>

                <dl style={{
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr',
                  rowGap: 6, columnGap: 14,
                  margin: 0, fontSize: '0.88rem',
                }}>
                  <dt style={{ color: '#888', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em' }}>Pedido</dt>
                  <dd style={{ margin: 0 }}>
                    <strong>{order.garment_type}</strong>
                    {order.size && <> · Talle <strong>{order.size}</strong></>}
                  </dd>

                  {order.color_preference && (
                    <>
                      <dt style={{ color: '#888', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em' }}>Color</dt>
                      <dd style={{ margin: 0 }}>{order.color_preference}</dd>
                    </>
                  )}

                  {order.message && (
                    <>
                      <dt style={{ color: '#888', textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.08em' }}>Mensaje</dt>
                      <dd style={{
                        margin: 0, background: '#FAF1DF', padding: '8px 10px',
                        borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.55,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {order.message}
                      </dd>
                    </>
                  )}
                </dl>

                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: 8,
                  marginTop: 14, paddingTop: 12, borderTop: '1px solid #eee',
                  alignItems: 'center',
                }}>
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn-secondary admin-btn-sm"
                      style={{ color: '#1F1A1B' }}
                    >
                      WhatsApp
                    </a>
                  )}
                  {order.customer_email && (
                    <span style={{ fontSize: '0.75rem', color: '#888' }} title={order.customer_email}>
                      {order.customer_email}
                    </span>
                  )}

                  <label
                    style={{
                      marginLeft: 'auto',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: '0.78rem', color: '#666',
                    }}
                  >
                    Estado
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as CustomOrder['status'])}
                      style={{
                        padding: '6px 10px', fontSize: '0.85rem',
                        borderRadius: 8, border: '1px solid #ddd',
                      }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <details style={{ marginTop: 12 }}>
                  <summary style={{ cursor: 'pointer', fontSize: '0.78rem', color: '#666' }}>
                    Notas internas {order.admin_notes ? '(•)' : ''}
                  </summary>
                  <textarea
                    defaultValue={order.admin_notes || ''}
                    onBlur={(e) => updateNotes(order.id, e.target.value)}
                    placeholder="Notas internas (sólo vos las ves)"
                    rows={3}
                    style={{
                      width: '100%', marginTop: 8,
                      padding: 10, fontSize: '0.85rem',
                      border: '1px solid #ddd', borderRadius: 8,
                      resize: 'vertical',
                    }}
                  />
                </details>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
