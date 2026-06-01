'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Color } from '@/lib/types'

const DEFAULT_COLORS: Color[] = [
  { id: '1', name: 'Blanco Crudo', hex: '#FAF9F6', sort_order: 1 },
  { id: '2', name: 'Negro Profundo', hex: '#111111', sort_order: 2 },
  { id: '3', name: 'Verde Musgo', hex: '#6A8456', sort_order: 3 },
  { id: '4', name: 'Rosa Pétalo', hex: '#ECC0CB', sort_order: 4 },
  { id: '5', name: 'Cobre Sparkle', hex: '#A37B53', sort_order: 5 },
]

export default function ColoresAdminPage() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [hex, setHex] = useState('#8F3B53')
  const [sortOrder, setSortOrder] = useState('1')
  
  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editHex, setEditHex] = useState('#8F3B53')
  const [editSortOrder, setEditSortOrder] = useState('1')

  const loadColors = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('colors')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error

      if (data && data.length > 0) {
        setColors(data as Color[])
      } else {
        const local = localStorage.getItem('dahila_admin_colors')
        if (local) {
          setColors(JSON.parse(local))
        } else {
          setColors(DEFAULT_COLORS)
          localStorage.setItem('dahila_admin_colors', JSON.stringify(DEFAULT_COLORS))
        }
      }
    } catch (e) {
      console.warn('Supabase fetch failed, using local colors fallback', e)
      const local = localStorage.getItem('dahila_admin_colors')
      if (local) {
        setColors(JSON.parse(local))
      } else {
        setColors(DEFAULT_COLORS)
        localStorage.setItem('dahila_admin_colors', JSON.stringify(DEFAULT_COLORS))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadColors()
  }, [])

  const saveLocal = (newColors: Color[]) => {
    setColors(newColors)
    localStorage.setItem('dahila_admin_colors', JSON.stringify(newColors))
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !hex) return

    const newColor: Color = {
      id: Math.random().toString(36).substr(2, 9), // temp random ID
      name,
      hex,
      sort_order: parseInt(sortOrder) || 1
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('colors').insert([{
        name,
        hex,
        sort_order: newColor.sort_order
      }])
      if (error) throw error
      await loadColors()
    } catch (e) {
      console.warn('Creating in Supabase failed, saving locally', e)
      const updated = [...colors, newColor].sort((a,b) => a.sort_order - b.sort_order)
      saveLocal(updated)
    }

    setName('')
    setHex('#8F3B53')
    setSortOrder(String(colors.length + 2))
  }

  const handleStartEdit = (col: Color) => {
    setEditingId(col.id)
    setEditName(col.name)
    setEditHex(col.hex)
    setEditSortOrder(String(col.sort_order))
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName || !editHex) return

    const updatedColor = {
      name: editName,
      hex: editHex,
      sort_order: parseInt(editSortOrder) || 1
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.from('colors').update(updatedColor).eq('id', id)
      if (error) throw error
      await loadColors()
    } catch (e) {
      console.warn('Updating in Supabase failed, updating locally', e)
      const updated = colors.map(c => c.id === id ? { ...c, ...updatedColor } : c).sort((a,b) => a.sort_order - b.sort_order)
      saveLocal(updated)
    }
    setEditingId(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este color? Las prendas vinculadas ya no tendrán este swatch.')) return

    try {
      const supabase = createClient()
      const { error } = await supabase.from('colors').delete().eq('id', id)
      if (error) throw error
      await loadColors()
    } catch (e) {
      console.warn('Deleting in Supabase failed, deleting locally', e)
      const updated = colors.filter(c => c.id !== id)
      saveLocal(updated)
    }
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const updated = [...colors]
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
      await supabase.from('colors').update({ sort_order: updated[index].sort_order }).eq('id', updated[index].id)
      await supabase.from('colors').update({ sort_order: updated[targetIndex].sort_order }).eq('id', updated[targetIndex].id)
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
          <h2>Colores</h2>
          <p>Configura la paleta de colores para las colecciones</p>
        </div>
      </div>

      <div className="admin-form-grid" style={{ alignItems: 'start' }}>
        {/* Create Form */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Nuevo Color</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="admin-field">
              <label>Nombre del Color</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Ej. Terracota" 
                required 
              />
            </div>
            
            <div className="admin-field">
              <label>Color (Selector Hex)</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input 
                  type="color" 
                  value={hex} 
                  onChange={(e) => setHex(e.target.value)} 
                  style={{ width: '48px', height: '38px', padding: '0', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                />
                <input 
                  type="text" 
                  value={hex} 
                  onChange={(e) => setHex(e.target.value)} 
                  placeholder="#000000" 
                  style={{ flex: 1 }}
                  required 
                />
              </div>
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
              Crear Color
            </button>
          </form>
        </div>

        {/* Colors List */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Colores Registrados</h3>
          
          {colors.length === 0 ? (
            <div className="admin-empty">
              <h3>Sin colores</h3>
              <p>Crea un nuevo color para asociarlo a tus prendas.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Orden</th>
                    <th>Color</th>
                    <th>Hex</th>
                    <th style={{ textAlign: 'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {colors.map((col, i) => (
                    <tr key={col.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ minWidth: '16px', textAlign: 'center' }}>{col.sort_order}</span>
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
                              disabled={i === colors.length - 1}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '10px', color: '#888' }}
                              title="Bajar"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {editingId === col.id ? (
                            <input 
                              type="text" 
                              value={editName} 
                              onChange={(e) => setEditName(e.target.value)} 
                              style={{ padding: '4px 8px', fontSize: '0.85rem' }} 
                              required 
                            />
                          ) : (
                            <>
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: col.hex, border: '1px solid rgba(0,0,0,0.15)' }} />
                              <strong>{col.name}</strong>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        {editingId === col.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input 
                              type="color" 
                              value={editHex} 
                              onChange={(e) => setEditHex(e.target.value)} 
                              style={{ width: '32px', height: '24px', padding: 0, border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
                            />
                            <input 
                              type="text" 
                              value={editHex} 
                              onChange={(e) => setEditHex(e.target.value)} 
                              style={{ padding: '4px 8px', fontSize: '0.85rem', width: '80px' }} 
                              required 
                            />
                          </div>
                        ) : (
                          <code style={{ fontSize: '0.85rem', background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>{col.hex}</code>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {editingId === col.id ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button 
                              className="admin-btn admin-btn-primary admin-btn-sm" 
                              onClick={() => handleSaveEdit(col.id)}
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
                              onClick={() => handleStartEdit(col)}
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button 
                              className="admin-btn-icon danger" 
                              onClick={() => handleDelete(col.id)}
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
