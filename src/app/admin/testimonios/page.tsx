'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Testimonial } from '@/components/TestimonialsStrip'

export default function TestimoniosPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
    if (err) setError(err.message)
    else setItems((data ?? []) as Testimonial[])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const save = async () => {
    if (!editing) return
    if (!editing.text?.trim() || !editing.author?.trim()) {
      setError('El texto y el nombre son requeridos.')
      return
    }
    setSaving(true)
    setError(null)
    const supabase = createClient()
    if (editing.id) {
      const { error: err } = await supabase
        .from('testimonials')
        .update({ author: editing.author, location: editing.location || null, text: editing.text, sort_order: editing.sort_order ?? 0 })
        .eq('id', editing.id)
      if (err) { setError(err.message); setSaving(false); return }
    } else {
      const { error: err } = await supabase
        .from('testimonials')
        .insert({ author: editing.author, location: editing.location || null, text: editing.text, sort_order: editing.sort_order ?? items.length })
      if (err) { setError(err.message); setSaving(false); return }
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este testimonio?')) return
    const supabase = createClient()
    await supabase.from('testimonials').delete().eq('id', id)
    load()
  }

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Testimonios</h2>
          <p>Lo que dicen las clientas — se muestra en el inicio del sitio.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={() => setEditing({ sort_order: items.length })}>
          + Nuevo
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(182,49,74,0.08)', border: '1px solid rgba(182,49,74,0.24)', color: '#7a1e2f', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}

      {editing && (
        <div className="admin-card" style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1rem', fontWeight: 500 }}>
            {editing.id ? 'Editar' : 'Nuevo testimonio'}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#444' }}>
              Testimonio *
              <textarea
                rows={3}
                maxLength={400}
                value={editing.text || ''}
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                placeholder='Ej: "El cardigan quedó hermoso, exactamente lo que pedí."'
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#444' }}>
                Nombre *
                <input
                  type="text"
                  value={editing.author || ''}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                  placeholder="Valentina"
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#444' }}>
                Ubicación (opcional)
                <input
                  type="text"
                  value={editing.location || ''}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  placeholder="Montevideo"
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
                />
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#444', maxWidth: 160 }}>
              Orden
              <input
                type="number"
                min={0}
                value={editing.sort_order ?? 0}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button className="admin-btn admin-btn-secondary" onClick={() => { setEditing(null); setError(null) }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !editing ? (
        <div className="admin-card admin-empty">
          <p>No hay testimonios todavía. Agregá el primero.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item) => (
            <div key={item.id} className="admin-card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: '#333', margin: '0 0 8px', lineHeight: 1.55 }}>
                  &quot;{item.text}&quot;
                </p>
                <div style={{ fontSize: 12, color: '#888' }}>
                  <strong style={{ color: '#555' }}>{item.author}</strong>
                  {item.location && <> — {item.location}</>}
                  <span style={{ marginLeft: 12, opacity: 0.6 }}>orden: {item.sort_order}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setEditing(item)}>
                  Editar
                </button>
                <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => remove(item.id)} style={{ color: '#c0392b' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
