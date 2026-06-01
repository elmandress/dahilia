'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CustomOrder } from '@/lib/types'

export default function EncargosPage() {
  const [orders, setOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('custom_orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    let loadedOrders = data || []
    
    // FALLBACK PREVIEW MODE
    if (loadedOrders.length === 0) {
      loadedOrders = [
        { id: '1', customer_name: 'Analia Perez', customer_email: 'analia@gmail.com', whatsapp: '+59899123456', garment_type: 'Top', size: 'M', message: 'Lo quiero para un casamiento.', color_preference: 'Blanco', status: 'new', created_at: new Date().toISOString() },
        { id: '2', customer_name: 'Sofia Martinez', customer_email: 'sofi.m@outlook.com', whatsapp: '+59899321456', garment_type: 'Cardigan', size: 'L', message: 'Tengo un modelo visto de pinterest.', color_preference: 'Rosa', status: 'replied', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', customer_name: 'Camila Silva', customer_email: 'camila123@yahoo.com', whatsapp: '+59898121212', garment_type: 'Set', size: 'XS', message: '', color_preference: 'Beige', status: 'in_progress', created_at: new Date(Date.now() - 86400000*3).toISOString() },
        { id: '4', customer_name: 'Lucia Gimenez', customer_email: 'lu.gimenez@gmail.com', whatsapp: '+59892111111', garment_type: 'Otro', size: 'A medida', message: 'Bufanda extra larga', color_preference: 'Verde', status: 'done', created_at: new Date(Date.now() - 86400000*12).toISOString() }
      ]
    }
    
    setOrders(loadedOrders as CustomOrder[])
    setLoading(false)
  }

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

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Encargos a Medida</h2>
          <p>Gestioná los pedidos personalizados de tus clientes</p>
        </div>
      </div>

      <div className="admin-filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="new">Nuevos</option>
          <option value="replied">Respondidos</option>
          <option value="in_progress">En proceso</option>
          <option value="done">Completados</option>
          <option value="cancelled">Cancelados</option>
        </select>
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
