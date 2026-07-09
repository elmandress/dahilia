'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CustomOrder } from '@/lib/types'
import { updateEncargoStatus } from './actions'

const STATUS_TABS: Array<{ key: string; label: string }> = [
  { key: 'all',         label: 'Todos' },
  { key: 'new',         label: 'Nuevos' },
  { key: 'replied',     label: 'Respondidos' },
  { key: 'in_progress', label: 'En proceso' },
  { key: 'done',        label: 'Completados' },
  { key: 'cancelled',   label: 'Cancelados' },
  { key: 'archived',    label: 'Papelera' },
]

const STATUS_OPTIONS: Array<{ value: CustomOrder['status']; label: string }> = [
  { value: 'new',         label: 'Nuevo' },
  { value: 'replied',     label: 'Respondido' },
  { value: 'in_progress', label: 'En proceso' },
  { value: 'done',        label: 'Completado' },
  { value: 'cancelled',   label: 'Cancelado' },
]

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// When the archive migration (schema-archive-orders.sql) hasn't been run yet,
// Postgres reports an undefined-column error. We detect it to show a helpful
// message instead of a generic failure.
function isMissingArchiveColumn(err: unknown): boolean {
  const msg = (err as { message?: string } | null)?.message
  return typeof msg === 'string' && /archived_at/.test(msg)
}

function whatsappLinkFromOrder(order: CustomOrder): string | null {
  const raw = (order.whatsapp || '').trim()
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  // Already has country code (11+ digits or starts with +)
  if (raw.startsWith('+') || digits.length >= 11) return `https://wa.me/${digits}`
  // 8-9 digits with leading 0 → strip 0 and assume Uruguay (+598)
  if (digits.startsWith('0')) return `https://wa.me/598${digits.replace(/^0+/, '')}`
  // 8-9 digits without leading 0 → assume Uruguay (+598)
  return `https://wa.me/598${digits}`
}

export default function EncargosPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const loadOrders = useCallback(async () => {
    const supabase = createClient()
    const { data, error: loadError } = await supabase
      .from('custom_orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (loadError) {
      setError('No se pudieron cargar los encargos. Probá recargar la página.')
    }
    setOrders((data ?? []) as CustomOrder[])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders()
  }, [loadOrders])

  const updateStatus = async (id: string, newStatus: CustomOrder['status']) => {
    setError(null)
    setNotice(null)
    // Goes through a server action so the customer status email is sent
    // server-side (the Resend key never reaches the browser).
    const res = await updateEncargoStatus(id, newStatus)
    if (!res.ok) {
      setError('No se pudo cambiar el estado. Revisá tu conexión e intentá de nuevo.')
      return
    }
    setOrders((curr) => curr.map((o) => (o.id === id ? { ...o, status: newStatus } : o)))
    setNotice('Estado actualizado.')
  }

  const updateNotes = async (id: string, notes: string) => {
    setError(null)
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('custom_orders')
      .update({ admin_notes: notes })
      .eq('id', id)

    if (updateError) {
      setError('No se pudieron guardar las notas. Intentá de nuevo.')
      return
    }
    setOrders((curr) => curr.map((o) => (o.id === id ? { ...o, admin_notes: notes } : o)))
    setNotice('Notas guardadas.')
  }

  const setArchived = async (id: string, archived: boolean) => {
    setError(null)
    setNotice(null)
    const supabase = createClient()
    const archived_at = archived ? new Date().toISOString() : null
    const { error: updateError } = await supabase
      .from('custom_orders')
      .update({ archived_at })
      .eq('id', id)

    if (updateError) {
      if (isMissingArchiveColumn(updateError)) {
        setError('La papelera necesita la migración: corré database/schema-archive-orders.sql en Supabase.')
      } else {
        setError('No se pudo actualizar la papelera. Intentá de nuevo.')
      }
      return
    }
    setOrders((curr) => curr.map((o) => (o.id === id ? { ...o, archived_at } : o)))
    setNotice(archived ? 'Encargo movido a la papelera.' : 'Encargo restaurado.')
  }

  const archiveOldCancelled = async () => {
    setError(null)
    setNotice(null)
    const cutoff = Date.now() - THIRTY_DAYS_MS
    const eligible = orders.filter(
      (o) => o.status === 'cancelled' && !o.archived_at && new Date(o.created_at).getTime() < cutoff
    )
    if (eligible.length === 0) {
      setNotice('No hay cancelados de más de 30 días para archivar.')
      return
    }
    const supabase = createClient()
    const archived_at = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('custom_orders')
      .update({ archived_at })
      .in('id', eligible.map((o) => o.id))

    if (updateError) {
      if (isMissingArchiveColumn(updateError)) {
        setError('La papelera necesita la migración: corré database/schema-archive-orders.sql en Supabase.')
      } else {
        setError('No se pudieron archivar. Intentá de nuevo.')
      }
      return
    }
    const ids = new Set(eligible.map((o) => o.id))
    setOrders((curr) => curr.map((o) => (ids.has(o.id) ? { ...o, archived_at } : o)))
    setNotice(`${eligible.length} ${eligible.length === 1 ? 'encargo archivado' : 'encargos archivados'}.`)
  }

  const deleteForever = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar definitivamente el encargo de ${name}? Esta acción no se puede deshacer.`)) {
      return
    }
    setError(null)
    setNotice(null)
    const supabase = createClient()
    const { error: deleteError } = await supabase
      .from('custom_orders')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setError('No se pudo eliminar el encargo. Intentá de nuevo.')
      return
    }
    setOrders((curr) => curr.filter((o) => o.id !== id))
    setNotice('Encargo eliminado definitivamente.')
  }

  const notArchived = orders.filter((o) => !o.archived_at)
  const archivedOrders = orders.filter((o) => !!o.archived_at)

  const filteredOrders =
    filterStatus === 'all'
      ? notArchived
      : filterStatus === 'archived'
        ? archivedOrders
        : notArchived.filter((o) => o.status === filterStatus)

  const exportCSV = () => {
    const rows = filteredOrders.map((o) => ({
      Fecha: new Date(o.created_at).toLocaleDateString('es-UY'),
      Nombre: o.customer_name,
      WhatsApp: o.whatsapp || '',
      Email: o.customer_email,
      Prenda: o.garment_type,
      Talle: o.size || '',
      Estado: o.status,
      'Código de seguimiento': o.tracking_code || '',
      Notas: (o.admin_notes || '').replace(/\n/g, ' '),
      Mensaje: (o.message || '').replace(/\n/g, ' '),
    }))
    const header = Object.keys(rows[0] ?? {}).join(',')
    const body = rows.map((r) =>
      Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
    ).join('\n')
    const csv = `﻿${header}\n${body}` // BOM for Excel UTF-8
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `encargos-dahila-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusCounts: Record<string, number> = {
    all: notArchived.length,
    new: notArchived.filter((o) => o.status === 'new').length,
    replied: notArchived.filter((o) => o.status === 'replied').length,
    in_progress: notArchived.filter((o) => o.status === 'in_progress').length,
    done: notArchived.filter((o) => o.status === 'done').length,
    cancelled: notArchived.filter((o) => o.status === 'cancelled').length,
    archived: archivedOrders.length,
  }

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Encargos a medida</h2>
          <p>Gestioná los pedidos personalizados.</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {filterStatus === 'cancelled' && statusCounts.cancelled > 0 && (
            <button
              onClick={archiveOldCancelled}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="Mueve a la papelera los encargos cancelados de más de 30 días"
            >
              Archivar cancelados +30 días
            </button>
          )}
          {filteredOrders.length > 0 && (
            <button
              onClick={exportCSV}
              className="admin-btn admin-btn-secondary admin-btn-sm"
              title="Exportar la lista actual como CSV (abre en Excel)"
            >
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" style={{ marginRight: 6 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar CSV
            </button>
          )}
        </div>
      </div>

      {error && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
          display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center',
        }}>
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Cerrar aviso" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7a1e2f', fontSize: 16 }}>×</button>
        </div>
      )}
      {notice && (
        <div role="status" style={{
          background: 'rgba(56,142,60,0.08)', border: '1px solid rgba(56,142,60,0.28)',
          color: '#2e6b32', padding: '10px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
          display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center',
        }}>
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} aria-label="Cerrar aviso" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2e6b32', fontSize: 16 }}>×</button>
        </div>
      )}

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
          <p>{filterStatus === 'archived' ? 'La papelera está vacía.' : 'No hay encargos en este estado.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredOrders.map((order) => {
            const waLink = whatsappLinkFromOrder(order)
            const isArchived = !!order.archived_at
            const canArchive = order.status === 'cancelled' || order.status === 'done'
            return (
              <article key={order.id} className="admin-card encargo-card" style={isArchived ? { opacity: 0.85 } : undefined}>
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

                  {isArchived ? (
                    <div style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <button
                        onClick={() => setArchived(order.id, false)}
                        className="admin-btn admin-btn-secondary admin-btn-sm"
                      >
                        Restaurar
                      </button>
                      <button
                        onClick={() => deleteForever(order.id, order.customer_name)}
                        className="admin-btn admin-btn-sm"
                        style={{ background: '#B6314A', color: '#fff', border: 'none' }}
                      >
                        Eliminar definitivamente
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginLeft: 'auto', display: 'inline-flex', gap: 10, alignItems: 'center' }}>
                      {canArchive && (
                        <button
                          onClick={() => setArchived(order.id, true)}
                          className="admin-btn admin-btn-secondary admin-btn-sm"
                          title="Mover a la papelera"
                        >
                          Archivar
                        </button>
                      )}
                      <label
                        style={{
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
                  )}
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
