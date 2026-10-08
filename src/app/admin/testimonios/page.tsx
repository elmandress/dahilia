'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Testimonial } from '@/components/TestimonialsStrip'
import { uploadAdminImage } from '@/lib/upload-image'

export default function TestimoniosPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Testimonial> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([])
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
    if (err) setError(err.message)
    else setItems((data ?? []) as Testimonial[])
    const { data: prods } = await supabase.from('products').select('id, name').order('name')
    if (prods) setProducts(prods as Array<{ id: string; name: string }>)
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
    // Foto y prenda solo viajan si hay algo que guardar (o si la fila ya las
    // tenía): así el formulario sigue andando en una base donde todavía no
    // se corrió fotos-clientas-y-lanas-2026-10.sql.
    const extra: Record<string, string | null> = {}
    const original = editing.id ? items.find((i) => i.id === editing.id) : undefined
    if (editing.photo_url || (original && 'photo_url' in original)) extra.photo_url = editing.photo_url || null
    if (editing.product_id || (original && 'product_id' in original)) extra.product_id = editing.product_id || null
    const friendly = (msg: string) => /photo_url|product_id/.test(msg)
      ? 'Para guardar fotos de clientas falta correr database/fotos-clientas-y-lanas-2026-10.sql en Supabase.'
      : msg
    if (editing.id) {
      const { error: err } = await supabase
        .from('testimonials')
        .update({ author: editing.author, location: editing.location || null, text: editing.text, sort_order: editing.sort_order ?? 0, ...extra })
        .eq('id', editing.id)
      if (err) { setError(friendly(err.message)); setSaving(false); return }
    } else {
      const { error: err } = await supabase
        .from('testimonials')
        .insert({ author: editing.author, location: editing.location || null, text: editing.text, sort_order: editing.sort_order ?? items.length, ...extra })
      if (err) { setError(friendly(err.message)); setSaving(false); return }
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
          <p>Lo que dicen las clientas — se muestra en el inicio y en las fichas. Con foto, aparece en la galería &quot;Clientas con su Dahila&quot;.</p>
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
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#4A4143' }}>
              Testimonio *
              <textarea
                rows={3}
                maxLength={400}
                value={editing.text || ''}
                onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                placeholder='Ej: "El cardigan quedó hermoso, exactamente lo que pedí."'
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(31,26,27,0.18)', fontSize: 13, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#4A4143' }}>
                Nombre *
                <input
                  type="text"
                  value={editing.author || ''}
                  onChange={(e) => setEditing({ ...editing, author: e.target.value })}
                  placeholder="Valentina"
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(31,26,27,0.18)', fontSize: 13 }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#4A4143' }}>
                Ubicación (opcional)
                <input
                  type="text"
                  value={editing.location || ''}
                  onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  placeholder="Montevideo"
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(31,26,27,0.18)', fontSize: 13 }}
                />
              </label>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#4A4143' }}>
                Foto de la clienta con la prenda (opcional)
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {editing.photo_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={editing.photo_url} alt="" style={{ width: 56, height: 70, objectFit: 'cover', borderRadius: 8 }} />
                  )}
                  <label className="admin-btn admin-btn-secondary admin-btn-sm" style={{ cursor: 'pointer' }}>
                    {uploading ? 'Subiendo…' : editing.photo_url ? 'Cambiar foto' : 'Subir foto'}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (!file) return
                        setUploading(true)
                        try {
                          const url = await uploadAdminImage(file, 'clientas', editing.author || 'clienta')
                          setEditing((cur) => (cur ? { ...cur, photo_url: url } : cur))
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'No se pudo subir la foto.')
                        } finally {
                          setUploading(false)
                        }
                      }}
                    />
                  </label>
                  {editing.photo_url && (
                    <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => setEditing({ ...editing, photo_url: null })}>
                      Quitar
                    </button>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#8C8285' }}>Solo con permiso de la clienta. Mejor vertical y con luz natural.</span>
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#4A4143' }}>
                Prenda que compró (opcional)
                <select
                  value={editing.product_id || ''}
                  onChange={(e) => setEditing({ ...editing, product_id: e.target.value || null })}
                  style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(31,26,27,0.18)', fontSize: 13, background: '#fff' }}
                >
                  <option value="">— Ninguna en particular —</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <span style={{ fontSize: 12, color: '#8C8285' }}>Con prenda elegida, la foto y el testimonio salen en esa ficha.</span>
              </label>
            </div>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#4A4143', maxWidth: 160 }}>
              Orden
              <input
                type="number"
                min={0}
                value={editing.sort_order ?? 0}
                onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(31,26,27,0.18)', fontSize: 13 }}
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
              {item.photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.photo_url} alt="" style={{ width: 48, height: 60, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: '#1F1A1B', margin: '0 0 8px', lineHeight: 1.55 }}>
                  &quot;{item.text}&quot;
                </p>
                <div style={{ fontSize: 12, color: '#8C8285' }}>
                  <strong style={{ color: '#4A4143' }}>{item.author}</strong>
                  {item.location && <> — {item.location}</>}
                  {item.product_id && (
                    <span style={{ marginLeft: 12 }}>· {products.find((p) => p.id === item.product_id)?.name ?? 'prenda'}</span>
                  )}
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
