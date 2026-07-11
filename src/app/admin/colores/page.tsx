'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Color } from '@/lib/types'

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export default function ColoresAdminPage() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [hex, setHex] = useState('#8F3B53')
  const [sortOrder, setSortOrder] = useState('1')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editHex, setEditHex] = useState('#8F3B53')
  const [editSortOrder, setEditSortOrder] = useState('1')

  const loadColors = useCallback(async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase
        .from('colors')
        .select('*')
        .order('sort_order', { ascending: true })

      if (err) throw err
      setColors((data ?? []) as Color[])
    } catch (e) {
      console.error('Error cargando colores', e)
      setError('No se pudieron cargar los colores desde la base de datos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadColors()
  }, [loadColors])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !HEX_RE.test(hex)) {
      setError('Verificá el nombre y que el hex tenga formato #RRGGBB.')
      return
    }
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('colors').insert([{
        name,
        hex,
        sort_order: parseInt(sortOrder) || 1,
      }])
      if (err) throw err
      await loadColors()
      setName('')
      setHex('#8F3B53')
      setSortOrder(String(colors.length + 2))
    } catch (e) {
      console.error('Error creando color', e)
      setError('No se pudo crear el color.')
    }
  }

  const handleStartEdit = (col: Color) => {
    setEditingId(col.id)
    setEditName(col.name)
    setEditHex(col.hex)
    setEditSortOrder(String(col.sort_order))
  }

  const handleSaveEdit = async (id: string) => {
    if (!editName || !HEX_RE.test(editHex)) {
      setError('Verificá el nombre y que el hex tenga formato #RRGGBB.')
      return
    }
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase
        .from('colors')
        .update({
          name: editName,
          hex: editHex,
          sort_order: parseInt(editSortOrder) || 1,
        })
        .eq('id', id)
      if (err) throw err
      await loadColors()
      setEditingId(null)
    } catch (e) {
      console.error('Error guardando color', e)
      setError('No se pudieron guardar los cambios.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este color? Las prendas vinculadas ya no tendrán este swatch.')) return
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('colors').delete().eq('id', id)
      if (err) throw err
      await loadColors()
    } catch (e) {
      console.error('Error eliminando color', e)
      setError('No se pudo eliminar el color.')
    }
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= colors.length) return
    const a = colors[index]
    const b = colors[targetIndex]
    setError(null)
    try {
      const supabase = createClient()
      const [r1, r2] = await Promise.all([
        supabase.from('colors').update({ sort_order: b.sort_order }).eq('id', a.id),
        supabase.from('colors').update({ sort_order: a.sort_order }).eq('id', b.id),
      ])
      if (r1.error || r2.error) throw r1.error ?? r2.error
      await loadColors()
    } catch (e) {
      console.error('Error reordenando colores', e)
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
          <h2>Colores</h2>
          <p>La paleta de lanas disponibles. Los colores que marques en cada producto se muestran como opciones en su ficha.</p>
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
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Nuevo color</h3>
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
                  style={{ width: '48px', height: '38px', padding: '0', border: '1px solid rgba(31,26,27,0.18)', borderRadius: '4px', cursor: 'pointer' }}
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
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Colores</h3>
          
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
                              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '10px', color: '#8C8285' }}
                              title="Subir"
                            >
                              ▲
                            </button>
                            <button 
                              onClick={() => moveOrder(i, 'down')} 
                              disabled={i === colors.length - 1}
                              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, fontSize: '10px', color: '#8C8285' }}
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
                              style={{ width: '32px', height: '24px', padding: 0, border: '1px solid rgba(31,26,27,0.18)', borderRadius: '4px', cursor: 'pointer' }}
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
                          <code style={{ fontSize: '0.85rem', background: '#EDE9EA', padding: '2px 6px', borderRadius: '4px' }}>{col.hex}</code>
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
                              aria-label={`Editar ${col.name}`}
                            >
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                            <button
                              className="admin-btn-icon danger"
                              onClick={() => handleDelete(col.id)}
                              title="Eliminar"
                              aria-label={`Eliminar ${col.name}`}
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
