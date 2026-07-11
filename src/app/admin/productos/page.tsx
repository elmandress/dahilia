'use client'

import { useEffect, useState, useCallback } from 'react'
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
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)

  const loadData = useCallback(async () => {
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

    setProducts((productsRes.data ?? []) as Product[])
    setCategories((categoriesRes.data ?? []) as Category[])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

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
    } else {
      console.error('delete product failed', error)
      alert('No se pudo eliminar el producto. Probá de nuevo en un momento.')
    }
    setDeleteId(null)
  }

  // Duplicate a product (as a draft) with its sizes and media. The copy gets a
  // unique slug and "(copia)" in the name so the owner can tweak it from scratch.
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id)
    try {
      const supabase = createClient()
      const { data: orig, error: fetchErr } = await supabase
        .from('products')
        .select('*, sizes:product_sizes(*), media:product_media(*), colors:product_colors(*)')
        .eq('id', id)
        .single()
      if (fetchErr || !orig) throw fetchErr || new Error('No encontrado')

      // Strip keys we must not copy verbatim.
      const omit = (obj: Record<string, unknown>, keys: string[]) => {
        const out: Record<string, unknown> = {}
        for (const k of Object.keys(obj)) if (!keys.includes(k)) out[k] = obj[k]
        return out
      }

      const suffix = Math.random().toString(36).slice(2, 6)
      const productRow = orig as Record<string, unknown> & {
        name: string; slug: string
        sizes?: Array<Record<string, unknown>>
        media?: Array<Record<string, unknown>>
        colors?: Array<Record<string, unknown>>
      }
      const insertBody = {
        ...omit(productRow, ['id', 'created_at', 'updated_at', 'sizes', 'media', 'colors']),
        name: `${productRow.name} (copia)`,
        slug: `${productRow.slug}-copia-${suffix}`,
        status: 'draft' as const,
      }
      const { data: created, error: insErr } = await supabase
        .from('products')
        .insert(insertBody)
        .select()
        .single()
      if (insErr || !created) throw insErr || new Error('No se pudo duplicar')

      const newId = created.id
      if (productRow.sizes?.length) {
        await supabase.from('product_sizes').insert(
          productRow.sizes.map((s) => ({ ...omit(s, ['id', 'product_id']), product_id: newId }))
        )
      }
      if (productRow.media?.length) {
        await supabase.from('product_media').insert(
          productRow.media.map((m) => ({ ...omit(m, ['id', 'product_id', 'created_at']), product_id: newId }))
        )
      }
      if (productRow.colors?.length) {
        await supabase.from('product_colors').insert(
          productRow.colors.map((c) => ({ ...omit(c, ['product_id']), product_id: newId }))
        )
      }
      await loadData()
    } catch (e) {
      console.error('duplicate failed', e)
      alert('No se pudo duplicar el producto.')
    } finally {
      setDuplicatingId(null)
    }
  }

  // Quick publish/unpublish toggle straight from the list (active ⇄ draft).
  const toggleStatus = async (p: Product) => {
    const next = p.status === 'active' ? 'draft' : 'active'
    const supabase = createClient()
    // Optimistic update.
    setProducts((curr) => curr.map((x) => (x.id === p.id ? { ...x, status: next } : x)))
    const { error } = await supabase.from('products').update({ status: next }).eq('id', p.id)
    if (error) {
      // Revert on failure.
      setProducts((curr) => curr.map((x) => (x.id === p.id ? { ...x, status: p.status } : x)))
    }
  }

  const term = searchTerm.trim().toLowerCase()
  const filteredProducts = products.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false
    if (term && !p.name.toLowerCase().includes(term) && !p.slug.toLowerCase().includes(term)) return false
    return true
  })

  // Drag-to-reorder is only meaningful on the full, unfiltered list (sort_order
  // is a single global order). Disable it while any filter/search is active.
  const reorderEnabled = filterStatus === 'all' && filterCategory === 'all' && !term

  const handleDrop = async (targetId: string) => {
    if (!dragId || dragId === targetId) { setDragId(null); return }
    const list = [...products]
    const from = list.findIndex((p) => p.id === dragId)
    const to = list.findIndex((p) => p.id === targetId)
    if (from === -1 || to === -1) { setDragId(null); return }
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved)
    // Reassign sort_order sequentially and persist only the rows that changed.
    const reindexed = list.map((p, i) => ({ ...p, sort_order: i }))
    setProducts(reindexed)
    setDragId(null)
    setSavingOrder(true)
    try {
      const supabase = createClient()
      const changed = reindexed.filter((p, i) => products[i]?.id !== p.id || products[i]?.sort_order !== p.sort_order)
      await Promise.all(
        changed.map((p) => supabase.from('products').update({ sort_order: p.sort_order }).eq('id', p.id))
      )
    } finally {
      setSavingOrder(false)
    }
  }

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

      {/* Filters + search */}
      <div className="admin-filters" style={{ flexWrap: 'wrap', gap: 10 }}>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o slug..."
          aria-label="Buscar productos"
          style={{ flex: '1 1 220px', minWidth: 0 }}
        />
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

      <p style={{ fontSize: '0.8rem', color: '#8C8285', margin: '0 0 12px' }}>
        {reorderEnabled
          ? `Arrastrá las filas para cambiar el orden en la tienda.${savingOrder ? ' Guardando…' : ''}`
          : 'Quitá los filtros para poder reordenar.'}
        {' '}Mostrando {filteredProducts.length} de {products.length}.
      </p>

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
                  <th className="col-hide-mobile">Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    draggable={reorderEnabled}
                    onDragStart={() => reorderEnabled && setDragId(product.id)}
                    onDragOver={(e) => { if (reorderEnabled) e.preventDefault() }}
                    onDrop={() => reorderEnabled && handleDrop(product.id)}
                    style={{
                      cursor: reorderEnabled ? 'grab' : 'default',
                      opacity: dragId === product.id ? 0.5 : 1,
                    }}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {reorderEnabled && (
                          <span aria-hidden style={{ color: '#bbb', fontSize: 16, lineHeight: 1, cursor: 'grab' }} title="Arrastrar para reordenar">⠿</span>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getPrimaryPhoto(product)}
                          alt={product.name}
                          className="product-thumb"
                        />
                      </div>
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
                      {product.discount_active && (product.discount_percent ?? 0) > 0 && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#B6314A', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#fff', fontWeight: 600 }}>
                          −{product.discount_percent}%
                        </span>
                      )}
                      {product.status === 'active' && !(product.description ?? '').trim() && (
                        <span
                          title="Esta ficha no tiene descripción: es lo que más frena la venta y el SEO"
                          style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'rgba(182,49,74,0.08)', border: '1px solid rgba(182,49,74,0.25)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#B6314A' }}
                        >
                          sin descripción
                        </span>
                      )}
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#8C8285' }}>/{product.slug}</span>
                    </td>
                    <td className="col-hide-mobile">{product.category?.name || '—'}</td>
                    <td>{product.base_price_uyu ? formatPrice(product.base_price_uyu) : '—'}</td>
                    <td>
                      {product.status === 'soldout' ? (
                        <span className="admin-badge soldout">Agotado</span>
                      ) : (
                        <button
                          onClick={() => toggleStatus(product)}
                          title={product.status === 'active' ? 'Tocar para ocultar de la tienda' : 'Tocar para publicar'}
                          aria-label={product.status === 'active' ? 'Despublicar' : 'Publicar'}
                          style={{
                            cursor: 'pointer', border: 'none', borderRadius: 999,
                            padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 500,
                            background: product.status === 'active' ? '#e8f5e9' : '#f0f0f0',
                            color: product.status === 'active' ? '#2e7d32' : '#8C8285',
                          }}
                        >
                          {product.status === 'active' ? 'Activo' : 'Borrador'}
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link href={`/admin/productos/${product.id}`} className="admin-btn-icon" title="Editar">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button
                          className="admin-btn-icon"
                          title="Duplicar"
                          aria-label="Duplicar producto"
                          disabled={duplicatingId === product.id}
                          onClick={() => handleDuplicate(product.id)}
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                        </button>
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
