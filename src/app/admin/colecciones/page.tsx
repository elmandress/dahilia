'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Collection } from '@/lib/types'

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function uploadCover(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `collections/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('media').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}

export default function ColeccionesAdminPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Create form
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [published, setPublished] = useState(true)

  const load = useCallback(async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: err } = await supabase.from('collections').select('*').order('sort_order', { ascending: true })
      if (err) throw err
      setCollections((data ?? []) as Collection[])
    } catch (e) {
      console.error(e)
      setError('No se pudieron cargar las colecciones. ¿Ejecutaste database/schema-collections.sql?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const handleCover = async (file: File, onDone: (url: string) => void) => {
    setError(null)
    setUploading(true)
    try {
      onDone(await uploadCover(file))
    } catch (e) {
      console.error(e)
      setError('No se pudo subir la portada.')
    } finally {
      setUploading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalSlug = slug || slugify(name)
    if (!name || !finalSlug) return
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('collections').insert([{
        name, slug: finalSlug, description: description || null, cover_url: coverUrl || null,
        published, sort_order: collections.length + 1,
      }])
      if (err) throw err
      await load()
      setName(''); setSlug(''); setDescription(''); setCoverUrl(''); setPublished(true)
    } catch (e) {
      console.error(e)
      setError('No se pudo crear. Verificá que el slug no esté repetido.')
    }
  }

  const patch = async (id: string, fields: Partial<Collection>) => {
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('collections').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id)
      if (err) throw err
      await load()
    } catch (e) {
      console.error(e)
      setError('No se pudieron guardar los cambios.')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta colección? Las piezas quedan en la tienda, solo dejan de pertenecer a la colección.')) return
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('collections').delete().eq('id', id)
      if (err) throw err
      await load()
    } catch (e) {
      console.error(e)
      setError('No se pudo eliminar.')
    }
  }

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Colecciones</h2>
          <p>Agrupá piezas en colecciones (ej. “Invierno 2026”). Cada una tiene su portada, relato y página propia. Las piezas se asignan desde el editor de cada producto.</p>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)', color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div className="admin-form-grid" style={{ alignItems: 'start' }}>
        <div className="admin-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Nueva colección</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="admin-field">
              <label>Nombre</label>
              <input type="text" value={name} onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)) }} placeholder="Ej. Invierno 2026" required />
            </div>
            <div className="admin-field">
              <label>Slug (automático)</label>
              <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="invierno-2026" required />
            </div>
            <div className="admin-field">
              <label>Relato (opcional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Una o dos frases sobre la colección…" />
            </div>
            <div className="admin-field">
              <label>Portada (foto horizontal)</label>
              {coverUrl && (
                <div style={{ position: 'relative', width: '100%', maxWidth: 320, aspectRatio: '16/9', borderRadius: 8, overflow: 'hidden', background: '#FAF1DF', marginBottom: 8 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCover(f, setCoverUrl); e.target.value = '' }} />
            </div>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} style={{ width: 18, height: 18 }} />
              Publicada (visible en el sitio)
            </label>
            <button type="submit" className="admin-btn admin-btn-primary" disabled={uploading} style={{ marginTop: '0.5rem' }}>
              {uploading ? 'Subiendo…' : 'Crear colección'}
            </button>
          </form>
        </div>

        <div className="admin-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Colecciones</h3>
          {collections.length === 0 ? (
            <div className="admin-empty"><h3>Sin colecciones</h3><p>Creá la primera para empezar tu lookbook.</p></div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Portada</th><th>Colección</th><th>Estado</th><th style={{ textAlign: 'right' }}>Acciones</th></tr>
                </thead>
                <tbody>
                  {collections.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ width: 64, height: 40, borderRadius: 6, overflow: 'hidden', background: '#FAF1DF' }}>
                          {c.cover_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={c.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}
                        </div>
                      </td>
                      <td><strong>{c.name}</strong><br /><span style={{ fontSize: '0.75rem', color: '#888' }}>/colecciones/{c.slug}</span></td>
                      <td>
                        <button
                          className={`admin-btn admin-btn-sm ${c.published ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                          onClick={() => patch(c.id, { published: !c.published })}
                          title="Cambiar visibilidad"
                        >
                          {c.published ? 'Publicada' : 'Oculta'}
                        </button>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="admin-btn-icon danger" onClick={() => handleDelete(c.id)} title="Eliminar">🗑️</button>
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
