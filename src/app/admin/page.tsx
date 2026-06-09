'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product, CustomOrder } from '@/lib/types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    onOfferProducts: 0,
    newOrders: 0,
    totalOrders: 0,
    activeCarts: 0,
    totalCollections: 0,
  })
  const [recentOrders, setRecentOrders] = useState<CustomOrder[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    const supabase = createClient()

    const [productsRes, ordersRes, countRes, newCountRes, cartsRes, collectionsRes] = await Promise.all([
      supabase.from('products').select('id, status, discount_active, discount_percent'),
      supabase.from('custom_orders').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('custom_orders').select('*', { count: 'exact', head: true }),
      supabase.from('custom_orders').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      // Active carts: created in the last 7 days with at least one item
      supabase.from('cart_items').select('cart_id', { count: 'exact', head: true }),
      // Collections (graceful — table may not exist yet)
      Promise.resolve(
        supabase.from('collections').select('id', { count: 'exact', head: true }).eq('published', true)
      ).catch(() => ({ count: 0 })),
    ])

    const products = (productsRes.data ?? []) as Array<
      Pick<Product, 'id' | 'status' | 'discount_active' | 'discount_percent'>
    >
    const orders = (ordersRes.data ?? []) as CustomOrder[]

    setStats({
      totalProducts: products.length,
      activeProducts: products.filter((p) => p.status === 'active').length,
      draftProducts: products.filter((p) => p.status === 'draft').length,
      onOfferProducts: products.filter((p) => p.discount_active && (p.discount_percent ?? 0) > 0).length,
      newOrders: newCountRes.count ?? orders.filter((o) => o.status === 'new').length,
      totalOrders: countRes.count ?? orders.length,
      activeCarts: cartsRes.count ?? 0,
      totalCollections: (collectionsRes as { count: number | null }).count ?? 0,
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

      {/* New-orders alert — only when there are unanswered orders */}
      {stats.newOrders > 0 && (
        <Link
          href="/admin/encargos"
          style={{
            display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none',
            background: '#FAF1DF', border: '1px solid rgba(143,59,83,0.25)',
            borderRadius: 12, padding: '14px 18px', marginBottom: '1.25rem',
          }}
        >
          <span style={{
            background: '#8F3B53', color: '#fff', borderRadius: 999,
            minWidth: 26, height: 26, display: 'inline-flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 13, fontWeight: 600,
          }}>{stats.newOrders}</span>
          <span style={{ color: '#1F1A1B', fontSize: '0.95rem' }}>
            {stats.newOrders === 1 ? 'Tenés 1 encargo nuevo sin responder' : `Tenés ${stats.newOrders} encargos nuevos sin responder`}
          </span>
          <span style={{ marginLeft: 'auto', color: '#8F3B53', fontSize: '0.85rem' }}>Ver →</span>
        </Link>
      )}

      {/* Stats */}
      <div className="admin-stats-grid">
        <Link href="/admin/productos" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-label">Productos activos</div>
          <div className="stat-value">{stats.activeProducts}</div>
          <div className="stat-sub">{stats.totalProducts} en total{stats.draftProducts ? ` · ${stats.draftProducts} en borrador` : ''}</div>
        </Link>
        <Link href="/admin/descuentos" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-label">En oferta</div>
          <div className="stat-value">{stats.onOfferProducts}</div>
          <div className="stat-sub">Productos con descuento</div>
        </Link>
        <Link href="/admin/encargos" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-label">Encargos nuevos</div>
          <div className="stat-value">{stats.newOrders}</div>
          <div className="stat-sub">Sin responder</div>
        </Link>
        <Link href="/admin/encargos" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-label">Total encargos</div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-sub">Histórico</div>
        </Link>
        <Link href="/admin/carritos" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="stat-label">Carritos con ítems</div>
          <div className="stat-value">{stats.activeCarts}</div>
          <div className="stat-sub">Potenciales consultas</div>
        </Link>
        {stats.totalCollections > 0 && (
          <Link href="/admin/colecciones" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="stat-label">Colecciones publicadas</div>
            <div className="stat-value">{stats.totalCollections}</div>
            <div className="stat-sub">Lookbook activo</div>
          </Link>
        )}
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
          <Link href="/admin/encargos" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
            Ver encargos
          </Link>
          <Link href="/admin/testimonios" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            Testimonios
          </Link>
          <Link href="/admin/descuentos" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            </svg>
            Descuentos
          </Link>
          <Link href="/admin/colores" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
            </svg>
            Colores de lana
          </Link>
          <Link href="/admin/colecciones" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            Colecciones
          </Link>
          <Link href="/admin/categorias" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Categorías
          </Link>
          <Link href="/admin/configuracion" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            </svg>
            Configuración
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-quick-action">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Ver tienda pública
          </a>
        </div>
      </div>
    </>
  )
}
