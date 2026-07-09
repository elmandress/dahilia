'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Discount, Category } from '@/lib/types'

export default function DescuentosAdminPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New discount form
  const [label, setLabel] = useState('')
  const [scope, setScope] = useState<'all' | 'category'>('all')
  const [categoryId, setCategoryId] = useState('')
  const [percent, setPercent] = useState('10')

  const load = useCallback(async () => {
    setError(null)
    try {
      const supabase = createClient()
      const [dRes, cRes] = await Promise.all([
        supabase.from('discounts').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('sort_order'),
      ])
      if (dRes.error) throw dRes.error
      setDiscounts((dRes.data ?? []) as Discount[])
      setCategories((cRes.data ?? []) as Category[])
    } catch (e) {
      console.error('Error cargando descuentos', e)
      setError('No se pudieron cargar los descuentos. Ejecutá database/schema-discounts.sql en Supabase.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) { setError('Poné un nombre al descuento.'); return }
    if (scope === 'category' && !categoryId) { setError('Elegí una categoría.'); return }
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('discounts').insert({
        label: label.trim(),
        scope,
        category_id: scope === 'category' ? categoryId : null,
        percent: Math.max(0, Math.min(90, parseInt(percent) || 0)),
        active: true,
      })
      if (err) throw err
      setLabel('')
      setPercent('10')
      setScope('all')
      setCategoryId('')
      await load()
    } catch (e) {
      console.error('Error creando descuento', e)
      setError('No se pudo crear el descuento.')
    }
  }

  const toggleActive = async (d: Discount) => {
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('discounts').update({ active: !d.active }).eq('id', d.id)
      if (err) throw err
      setDiscounts((curr) => curr.map((x) => (x.id === d.id ? { ...x, active: !x.active } : x)))
    } catch (e) {
      console.error('Error actualizando descuento', e)
      setError('No se pudo actualizar.')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('¿Eliminar este descuento?')) return
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.from('discounts').delete().eq('id', id)
      if (err) throw err
      setDiscounts((curr) => curr.filter((x) => x.id !== id))
    } catch (e) {
      console.error('Error eliminando descuento', e)
      setError('No se pudo eliminar.')
    }
  }

  const scopeLabel = (d: Discount) => {
    if (d.scope === 'all') return 'Toda la tienda'
    const cat = categories.find((c) => c.id === d.category_id)
    return cat ? `Categoría: ${cat.name}` : 'Categoría'
  }

  if (loading) return <div className="admin-loading"><div className="admin-spinner" /></div>

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h2>Descuentos</h2>
          <p>
            Aplicá rebajas a toda la tienda o por categoría. Para rebajar un solo producto, usá el campo
            &quot;Descuento&quot; dentro de <Link href="/admin/productos" style={{ color: '#8F3B53' }}>ese producto</Link>.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
        }}>{error}</div>
      )}

      <div className="admin-form-grid" style={{ alignItems: 'start' }}>
        {/* Create */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Nuevo descuento</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="admin-field">
              <label>Nombre</label>
              <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ej. Liquidación invierno" required />
            </div>
            <div className="admin-field">
              <label>Alcance</label>
              <select value={scope} onChange={(e) => setScope(e.target.value as 'all' | 'category')}>
                <option value="all">Toda la tienda</option>
                <option value="category">Una categoría</option>
              </select>
            </div>
            {scope === 'category' && (
              <div className="admin-field">
                <label>Categoría</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                  <option value="">Elegí una categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="admin-field">
              <label>Porcentaje (%)</label>
              <input type="number" min={0} max={90} value={percent} onChange={(e) => setPercent(e.target.value)} required />
            </div>
            <button type="submit" className="admin-btn admin-btn-primary" style={{ marginTop: '0.5rem' }}>
              Crear descuento
            </button>
          </form>
        </div>

        {/* List */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 1.25rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Descuentos activos</h3>
          {discounts.length === 0 ? (
            <div className="admin-empty"><p>Todavía no hay descuentos.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {discounts.map((d) => (
                <div key={d.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  padding: '12px 14px', border: '1px solid #eee', borderRadius: 10,
                  background: d.active ? '#fff' : '#fafafa',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 400,
                    color: d.active ? '#B6314A' : '#bbb', minWidth: 56,
                  }}>−{d.percent}%</span>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <strong style={{ display: 'block', fontSize: '0.95rem' }}>{d.label}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>{scopeLabel(d)}</span>
                  </div>
                  <button
                    onClick={() => toggleActive(d)}
                    className={`admin-btn admin-btn-sm ${d.active ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                  >
                    {d.active ? 'Activo' : 'Inactivo'}
                  </button>
                  <button onClick={() => remove(d.id)} className="admin-btn-icon danger" title="Eliminar" aria-label={`Eliminar descuento ${d.label}`}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
