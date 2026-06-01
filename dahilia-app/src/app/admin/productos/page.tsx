'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category } from '@/lib/types'
import { formatPrice, getPrimaryPhoto } from '@/lib/types'

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const supabase = createClient()

    const [productsRes, categoriesRes] = await Promise.all([
      supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          media:product_media(*),
          sizes:product_sizes(*)
        `)
        .order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order'),
    ])

    let loadedProducts = productsRes.data || []
    
    // FALLBACK PREVIEW MODE
    if (loadedProducts.length === 0) {
      loadedProducts = [
        { id: '1', name: 'Top Lourdes', category: { name: 'tops' }, slug: 'top-lourdes', base_price_uyu: 3450, status: 'active', badge: 'Nuevo', media: [{ url: '/photos/top-lace-parque.png' }] },
        { id: '2', name: 'Bolero Pétalo', category: { name: 'cardigans' }, slug: 'bolero-petalo', base_price_uyu: 4890, status: 'active', badge: 'A medida', media: [{ url: '/photos/bolero-marron.png' }] },
        { id: '3', name: 'Bufanda Frutilla', category: { name: 'accesorios' }, slug: 'bufanda-frutilla', base_price_uyu: 1890, status: 'soldout', badge: null, media: [{ url: '/photos/bufanda-rosa.jpg' }] },
        { id: '4', name: 'Wrap Negro', category: { name: 'tops' }, slug: 'wrap-negro', base_price_uyu: 5200, status: 'active', badge: null, media: [{ url: '/photos/wrap-negro.png' }] },
        { id: '5', name: 'Set Cobre', category: { name: 'sets' }, slug: 'set-cobre', base_price_uyu: 7890, status: 'draft', badge: 'Edición Limitada', media: [{ url: '/photos/set-marron.jpg' }] },
      ] as any
    }

    setProducts(loadedProducts as any)
    setCategories(categoriesRes.data || [
      { id: '1', name: 'Tops' }, { id: '2', name: 'Cardigans' }, { id: '3', name: 'Accesorios' }, { id: '4', name: 'Sets' }
    ] as any)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()

    // Delete related data first
    await Promise.all([
      supabase.from('product_media').delete().eq('product_id', id),
      supabase.from('product_sizes').delete().eq('product_id', id),
      supabase.from('product_colors').delete().eq('product_id', id),
    ])

    const { error } = await supabase.from('products').delete().eq('id', id)

    if (!error) {
      setProducts(products.filter(p => p.id !== id))
    }
    setDeleteId(null)
  }

  const filteredProducts = products.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false
    return true
  })

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Productos</h2>
          <p>{products.length} productos en total</p>
        </div>
        <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-primary">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="draft">Borrador</option>
          <option value="soldout">Agotado</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="admin-card">
        {filteredProducts.length === 0 ? (
          <div className="admin-empty">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <h3>No hay productos</h3>
            <p>Creá tu primer producto para empezar</p>
            <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-primary">
              Crear producto
            </Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 60 }}></th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getPrimaryPhoto(product)}
                        alt={product.name}
                        className="product-thumb"
                      />
                    </td>
                    <td>
                      <Link href={`/admin/productos/${product.id}`} style={{ color: '#1F1A1B', textDecoration: 'none', fontWeight: 500 }}>
                        {product.name}
                      </Link>
                      {product.badge && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#FAF1DF', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#8F3B53' }}>
                          {product.badge}
                        </span>
                      )}
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>/{product.slug}</span>
                    </td>
                    <td>{product.category?.name || '—'}</td>
                    <td>{product.base_price_uyu ? formatPrice(product.base_price_uyu) : '—'}</td>
                    <td>
                      <span className={`admin-badge ${product.status}`}>
                        {product.status === 'active' && 'Activo'}
                        {product.status === 'draft' && 'Borrador'}
                        {product.status === 'soldout' && 'Agotado'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link href={`/admin/productos/${product.id}`} className="admin-btn-icon" title="Editar">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button className="admin-btn-icon danger" title="Eliminar" onClick={() => setDeleteId(product.id)}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar producto?</h3>
            <p>Esta acción no se puede deshacer. Se eliminarán también las fotos, tallas y colores asociados.</p>
            <div className="modal-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>
                Cancelar
              </button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(deleteId)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
