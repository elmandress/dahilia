'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function CategoriasAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState('1')

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editSortOrder, setEditSortOrder] = useState('1')

  const loadCategories = useCallback(async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })

      if (err) throw err
      setCategories((data ?? []) as Category[])
    } catch (e) {
      console.error('Error cargando categorías', e)
      setError('No se pudieron cargar las categorías desde la base de datos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Initial fetch on mount; setState happens inside the async helper, which
    // is the standard load-once pattern and acceptable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories()
  }, [loadCategories])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalSlug = slug || slugify(name)
    if (!name || !finalSlug) return

    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('categories').insert([{
        name,
        slug: finalSlug,
        description: description || null,
        sort_order: parseInt(sortOrder) || 1,
      }])
      if (err) throw err
      await loadCategories()
      setName('')
      setSlug('')
      setDescription('')
      setSortOrder(String(categories.length + 2))
    } catch (e) {
      console.error('Error creando categoría', e)
      setError('No se pudo crear la categoría. Verificá que el slug no esté repetido.')
    }
  }

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setEditDescription(cat.description || '')
    setEditSortOrder(String(cat.sort_order))
  }

  const handleSaveEdit = async (id: string) => {
    const finalSlug = editSlug || slugify(editName)
    if (!editName || !finalSlug) return

    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('categories')
        .update({
          name: editName,
          slug: finalSlug,
          description: editDescription || null,
          sort_order: parseInt(editSortOrder) || 1,
        })
        .eq('id', id)
      if (err) throw err
      await loadCategories()
      setEditingId(null)
    } catch (e) {
      console.error('Error guardando categoría', e)
      setError('No se pudieron guardar los cambios.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Las prendas vinculadas quedarán sin categoría.')) return

    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('categories').delete().eq('id', id)
      if (err) throw err
      await loadCategories()
    } catch (e) {
      console.error('Error eliminando categoría', e)
      setError('No se pudo eliminar la categoría.')
    }
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= categories.length) return

    const a = categories[index]
    const b = categories[targetIndex]

    setError(null)
    try {
      const supabase = createClient()
      const [r1, r2] = await Promise.all([
        supabase.from('categories').update({ sort_order: b.sort_order }).eq('id', a.id),
        supabase.from('categories').update({ sort_order: a.sort_order }).eq('id', b.id),
      ])
      if (r1.error || r2.error) throw r1.error ?? r2.error
      await loadCategories()
    } catch (e) {
      console.error('Error reordenando categorías', e)
      setError('No se pudo reordenar.')
    }
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Categorías</h2>
          <p>Ordená las secciones de la tienda (tops, bolsos, bufandas…). Cada producto pertenece a una.</p>
        </div>
      </div>

      {error && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)',
          border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f',
          padding: '12px 14px',
          borderRadius: 8,
          marginBottom: 18,
          fontSize: 13,
        }}>
          {error}
        </div>
      )}

      <div className="admin-form-grid" style={{ alignItems: 'start' }}>
        {/* Create Form */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Nueva categoría</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="admin-field">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const v = e.target.value
                  setName(v)
                  setSlug(slugify(v))
                }}
                placeholder="Ej. Sacos y Cardigans"
                required
              />
            </div>

            <div className="admin-field">
              <label>Slug (automático)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Ej. sacos-y-cardigans"
                required
              />
            </div>

            <div className="admin-field">
              <label>Descripción</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Breve descripción para el público..." 
              />
            </div>

            <div className="admin-field">
              <label>Orden de visualización</label>
              <input 
                type="number" 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)} 
                placeholder="Ej. 1" 
                required 
              />
            </div>

            <button type="submit" className="admin-btn admin-btn-primary" style={{ marginTop: '0.5rem' }}>
              Crear Categoría
            </button>
          </form>
        </div>

        {/* Categories List */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Categorías</h3>
          
          {categories.length === 0 ? (
            <div className="admin-empty">
              <h3>Sin categorías</h3>
              <p>Crea una nueva categoría para organizar tus productos.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Categoría</th>
                    <th>Descripción</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, i) => (
                    <tr key={cat.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ minWidth: '16px', textAlign: 'center' }}>{cat.sort_order}</span>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <button 
                              onClick={() => moveOrder(i, 'up')} 
                              disabled={i === 0}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '10px', color: '#888' }}
                              title="Subir"
                            >
                              ▲
                            </button>
                            <button 
                              onClick={() => moveOrder(i, 'down')} 
                              disabled={i === categories.length - 1}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '10px', color: '#888' }}
                              title="Bajar"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        {editingId === cat.id ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => {
                                const v = e.target.value
                                setEditName(v)
                                setEditSlug(slugify(v))
                              }}
                              style={{ padding: '4px 8px', fontSize: '0.85rem' }}
                              required
                            />
                            <input 
                              type="text" 
                              value={editSlug} 
                              onChange={(e) => setEditSlug(e.target.value)} 
                              style={{ padding: '4px 8px', fontSize: '0.8rem', color: '#666' }} 
                              required 
                            />
                          </div>
                        ) : (
                          <div>
                            <strong>{cat.name}</strong><br/>
                            <span style={{ fontSize: '0.75rem', color: '#888' }}>/{cat.slug}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        {editingId === cat.id ? (
                          <textarea 
                            value={editDescription} 
                            onChange={(e) => setEditDescription(e.target.value)} 
                            style={{ padding: '4px 8px', fontSize: '0.85rem', width: '100%', minHeight: '60px' }} 
                          />
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: '#666' }}>{cat.description || '-'}</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {editingId === cat.id ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button 
                              className="admin-btn admin-btn-primary admin-btn-sm" 
                              onClick={() => handleSaveEdit(cat.id)}
                            >
                              Guardar
                            </button>
                            <button 
                              className="admin-btn admin-btn-secondary admin-btn-sm" 
                              onClick={() => setEditingId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button
                              className="admin-btn-icon"
                              onClick={() => handleStartEdit(cat)}
                              title="Editar"
                              aria-label={`Editar ${cat.name}`}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              className="admin-btn-icon danger"
                              onClick={() => handleDelete(cat.id)}
                              title="Eliminar"
                              aria-label={`Eliminar ${cat.name}`}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
