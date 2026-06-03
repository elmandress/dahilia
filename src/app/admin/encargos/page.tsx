'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CustomOrder } from '@/lib/types'

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
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o))
    }
  }

  const updateNotes = async (id: string, notes: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('custom_orders')
      .update({ admin_notes: notes })
      .eq('id', id)
      
    if (!error) {
      setOrders(orders.map(o => o.id === id ? { ...o, admin_notes: notes } : o))
    }
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(o => o.status === filterStatus)

  const statusCounts: Record<string, number> = {
    all: orders.length,
    new: orders.filter((o) => o.status === 'new').length,
    replied: orders.filter((o) => o.status === 'replied').length,
    in_progress: orders.filter((o) => o.status === 'in_progress').length,
    done: orders.filter((o) => o.status === 'done').length,
    cancelled: orders.filter((o) => o.status === 'cancelled').length,
  }

  const STATUS_TABS: Array<{ key: string; label: string }> = [
    { key: 'all',         label: 'Todos' },
    { key: 'new',         label: 'Nuevos' },
    { key: 'replied',     label: 'Respondidos' },
    { key: 'in_progress', label: 'En proceso' },
    { key: 'done',        label: 'Completados' },
    { key: 'cancelled',   label: 'Cancelados' },
  ]

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Encargos a Medida</h2>
          <p>Gestioná los pedidos personalizados de tus clientes</p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Filtrar encargos por estado"
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

      <div className="admin-card">
        {filteredOrders.length === 0 ? (
          <div className="admin-empty">
            <p>No hay encargos en este estado.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Pedido</th>
                  <th>Estado</th>
                  <th>Acciones / Notas</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id} style={{ verticalAlign: 'top' }}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(order.created_at).toLocaleDateString('es-UY')}
                    </td>
                    <td>
                      <strong>{order.customer_name}</strong><br/>
                      <a href={`mailto:${order.customer_email}`} style={{ fontSize: '0.85rem' }}>{order.customer_email}</a>
                      {order.whatsapp && (
                        <>
                          <br/>
                          <a href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.85rem', color: '#25D366' }}>WhatsApp: {order.whatsapp}</a>
                        </>
                      )}
                    </td>
                    <td style={{ minWidth: '250px' }}>
                      <strong>{order.garment_type}</strong> (Talle: {order.size || 'A medida'})<br/>
                      <span style={{ fontSize: '0.85rem', color: '#666' }}>Color: {order.color_preference || '-'}</span><br/>
                      <p style={{ fontSize: '0.85rem', marginTop: '4px', background: '#f5f5f5', padding: '6px', borderRadius: '4px' }}>
                        {order.message}
                      </p>
                    </td>
                    <td>
                      <select 
                        value={order.status} 
                        onChange={(e) => updateStatus(order.id, e.target.value as CustomOrder['status'])}
                        style={{ padding: '4px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #ddd' }}
                      >
                        <option value="new">Nuevo</option>
                        <option value="replied">Respondido</option>
                        <option value="in_progress">En proceso</option>
                        <option value="done">Completado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td>
                      <textarea
                        defaultValue={order.admin_notes || ''}
                        onBlur={(e) => updateNotes(order.id, e.target.value)}
                        placeholder="Agregar notas internas..."
                        style={{ width: '100%', minHeight: '60px', padding: '6px', fontSize: '0.85rem', border: '1px solid #ddd', borderRadius: '4px' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
