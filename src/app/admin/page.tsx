'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product, CustomOrder } from '@/lib/types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    pendingOrders: 0,
    totalOrders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    const supabase = createClient()

    const [productsRes, ordersRes, countRes] = await Promise.all([
      supabase.from('products').select('id, status'),
      supabase.from('custom_orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('custom_orders').select('*', { count: 'exact', head: true }),
    ])

    const products = (productsRes.data ?? []) as Pick<Product, 'id' | 'status'>[]
    const orders = (ordersRes.data ?? []) as CustomOrder[]

    setStats({
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === 'active').length,
      pendingOrders: orders.filter((o) => o.status === 'new' || o.status === 'replied').length,
      totalOrders: countRes.count ?? orders.length,
    })
    setRecentOrders(orders)
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard()
  }, [loadDashboard])

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    )
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Resumen de tu tienda</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="stat-label">Total productos</div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Productos activos</div>
          <div className="stat-value">{stats.activeProducts}</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Encargos pendientes</div>
          <div className="stat-value">{stats.pendingOrders}</div>
          <div className="stat-sub">Nuevos y respondidos</div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-label">Total encargos</div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>Encargos recientes</h3>
          <Link href="/admin/encargos" className="admin-btn admin-btn-secondary admin-btn-sm">
            Ver todos
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="admin-empty">
            <p>No hay encargos aún</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.customer_name}</strong>
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>{order.customer_email}</span>
                    </td>
                    <td>{order.garment_type}</td>
                    <td>
                      <span className={`admin-badge ${order.status}`}>
                        {order.status === 'new' && 'Nuevo'}
                        {order.status === 'replied' && 'Respondido'}
                        {order.status === 'in_progress' && 'En proceso'}
                        {order.status === 'done' && 'Completado'}
                        {order.status === 'cancelled' && 'Cancelado'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#888' }}>
                      {new Date(order.created_at).toLocaleDateString('es-UY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 500 }}>Acciones rápidas</h3>
        <div className="admin-quick-actions">
          <Link href="/admin/productos/nuevo" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo producto
          </Link>
          <Link href="/admin/categorias" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            </svg>
            Gestionar categorías
          </Link>
          <Link href="/admin/encargos" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859" />
            </svg>
            Ver encargos
          </Link>
          <Link href="/admin/configuracion" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            </svg>
            Configuración del sitio
          </Link>
        </div>
      </div>
    </>
  )
}
