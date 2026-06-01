'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'tops', slug: 'tops', name: 'Tops', description: 'Tops y chalecos tejidos a mano', sort_order: 1, created_at: new Date().toISOString() },
  { id: 'accesorios', slug: 'accesorios', name: 'Accesorios', description: 'Bufandas, bolsos y más', sort_order: 2, created_at: new Date().toISOString() },
  { id: 'cardigans', slug: 'cardigans', name: 'Cardigans', description: 'Sacos y prendas de abrigo', sort_order: 3, created_at: new Date().toISOString() },
  { id: 'sets', slug: 'sets', name: 'Sets', description: 'Conjuntos combinados de edición limitada', sort_order: 4, created_at: new Date().toISOString() },
]

export default function CategoriasAdminPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    // Auto-generate slug from name
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  }, [name])

  useEffect(() => {
    // Auto-generate slug for edit form
    setEditSlug(editName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  }, [editName])

  const loadCategories = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error

      if (data && data.length > 0) {
        setCategories(data as Category[])
      } else {
        // Fallback or localStorage check
        const local = localStorage.getItem('dahila_admin_categories')
        if (local) {
          setCategories(JSON.parse(local))
        } else {
          setCategories(DEFAULT_CATEGORIES)
          localStorage.setItem('dahila_admin_categories', JSON.stringify(DEFAULT_CATEGORIES))
        }
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local categories fallback', e)
      const local = localStorage.getItem('dahila_admin_categories')
      if (local) {
        setCategories(JSON.parse(local))
      } else {
        setCategories(DEFAULT_CATEGORIES)
        localStorage.setItem('dahila_admin_categories', JSON.stringify(DEFAULT_CATEGORIES))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const saveLocal = (newCats: Category[]) => {
    setCategories(newCats)
    localStorage.setItem('dahila_admin_categories', JSON.stringify(newCats))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !slug) return

    const newCategory: Category = {
      id: slug, // or dynamic id
      name,
      slug,
      description: description || null,
      sort_order: parseInt(sortOrder) || 1,
      created_at: new Date().toISOString()
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('categories').insert([newCategory])
      if (error) throw error
      await loadCategories()
    } catch (e) {
      console.warn('Creating in Supabase failed, saving locally', e)
      const updated = [...categories, newCategory].sort((a,b) => a.sort_order - b.sort_order)
      saveLocal(updated)
    }

    // Reset form
    setName('')
    setSlug('')
    setDescription('')
    setSortOrder(String(categories.length + 2))
  }

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setEditDescription(cat.description || '')
    setEditSortOrder(String(cat.sort_order))
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName || !editSlug) return

    const updatedCat = {
      name: editName,
      slug: editSlug,
      description: editDescription || null,
      sort_order: parseInt(editSortOrder) || 1
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('categories').update(updatedCat).eq('id', id)
      if (error) throw error
      await loadCategories()
    } catch (e) {
      console.warn('Updating in Supabase failed, updating locally', e)
      const updated = categories.map(c => c.id === id ? { ...c, ...updatedCat } : c).sort((a,b) => a.sort_order - b.sort_order)
      saveLocal(updated)
    }
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría? Las prendas vinculadas quedarán sin categoría.')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('categories').delete().eq('id', id)
      if (error) throw error
      await loadCategories()
    } catch (e) {
      console.warn('Deleting in Supabase failed, deleting locally', e)
      const updated = categories.filter(c => c.id !== id)
      saveLocal(updated)
    }
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const updated = [...categories]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= updated.length) return

    // Swap sort_order values
    const tempOrder = updated[index].sort_order
    updated[index].sort_order = updated[targetIndex].sort_order
    updated[targetIndex].sort_order = tempOrder

    // Swap indices in array
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp

    saveLocal(updated)

    // Attempt to update Supabase
    try {
      const supabase = createClient()
      await supabase.from('categories').update({ sort_order: updated[index].sort_order }).eq('id', updated[index].id)
      await supabase.from('categories').update({ sort_order: updated[targetIndex].sort_order }).eq('id', updated[targetIndex].id)
    } catch (e) {
      console.warn('Reorder in Supabase failed, saved locally', e)
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
                onChange={(e) => setName(e.target.value)} 
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
                              onChange={(e) => setEditName(e.target.value)} 
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
