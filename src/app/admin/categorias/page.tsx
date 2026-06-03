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
          <p>Organiza las colecciones de prendas del catálogo</p>
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
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Nueva Categoría</h3>
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
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Categorías Registradas</h3>
          
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
                            >
                              ✏️
                            </button>
                            <button 
                              className="admin-btn-icon danger" 
                              onClick={() => handleDelete(cat.id)}
                              title="Eliminar"
                            >
                              🗑️
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
