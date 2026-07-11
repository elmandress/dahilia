'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Coupon, Product, Category } from '@/lib/types'

type Scope = 'all' | 'categories' | 'products'

interface Draft {
  id: string | null
  code: string
  label: string
  kind: Coupon['kind']
  value: string
  min_subtotal_uyu: string
  starts_at: string       // yyyy-mm-dd (input date)
  ends_at: string
  max_uses: string
  max_uses_per_customer: string
  scope: Scope
  product_ids: string[]
  category_ids: string[]
  active: boolean
}

const EMPTY_DRAFT: Draft = {
  id: null, code: '', label: '', kind: 'percent', value: '10',
  min_subtotal_uyu: '', starts_at: '', ends_at: '',
  max_uses: '', max_uses_per_customer: '1',
  scope: 'all', product_ids: [], category_ids: [], active: true,
}

const KIND_LABEL: Record<Coupon['kind'], string> = {
  percent: 'Porcentaje',
  fixed: 'Monto fijo',
  free_shipping: 'Envío gratis',
}

function randomCode(): string {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)]
  return `DAH-${s}`
}

function toDateInput(ts: string | null): string {
  return ts ? ts.slice(0, 10) : ''
}

function couponSummary(c: Coupon): string {
  if (c.kind === 'percent') return `−${c.value}%`
  if (c.kind === 'fixed') return `−$${(c.value ?? 0).toLocaleString('es-UY')}`
  return 'Envío gratis'
}

function couponWindow(c: Coupon): string {
  const fmt = (s: string) => new Date(s).toLocaleDateString('es-UY')
  if (c.starts_at && c.ends_at) return `${fmt(c.starts_at)} – ${fmt(c.ends_at)}`
  if (c.ends_at) return `hasta ${fmt(c.ends_at)}`
  if (c.starts_at) return `desde ${fmt(c.starts_at)}`
  return 'sin vencimiento'
}

export default function AdminCuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [uses, setUses] = useState<Record<string, number>>({})
  const [products, setProducts] = useState<Array<Pick<Product, 'id' | 'name'>>>([])
  const [categories, setCategories] = useState<Array<Pick<Category, 'id' | 'name'>>>([])
  // Timestamp fijado al cargar, para marcar vencidos sin llamar Date.now()
  // durante el render (regla react-hooks/purity).
  const [loadedAt, setLoadedAt] = useState(0)
  const [loading, setLoading] = useState(true)
  const [tableMissing, setTableMissing] = useState(false)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    const supabase = createClient()
    const [couponsRes, redemptionsRes, productsRes, categoriesRes] = await Promise.all([
      supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      supabase.from('coupon_redemptions').select('coupon_id'),
      supabase.from('products').select('id, name').order('name'),
      supabase.from('categories').select('id, name').order('sort_order'),
    ])
    if (couponsRes.error) {
      if (couponsRes.error.code === '42P01' || /coupons/.test(couponsRes.error.message || '')) {
        setTableMissing(true)
      }
      setCoupons([])
    } else {
      setCoupons((couponsRes.data ?? []) as Coupon[])
    }
    const counts: Record<string, number> = {}
    for (const r of (redemptionsRes.data ?? []) as Array<{ coupon_id: string }>) {
      counts[r.coupon_id] = (counts[r.coupon_id] ?? 0) + 1
    }
    setUses(counts)
    setProducts((productsRes.data ?? []) as Array<Pick<Product, 'id' | 'name'>>)
    setCategories((categoriesRes.data ?? []) as Array<Pick<Category, 'id' | 'name'>>)
    setLoadedAt(Date.now())
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }

  const startNew = () => setDraft({ ...EMPTY_DRAFT, code: randomCode() })

  const startEdit = (c: Coupon) => setDraft({
    id: c.id,
    code: c.code,
    label: c.label ?? '',
    kind: c.kind,
    value: c.value != null ? String(c.value) : '',
    min_subtotal_uyu: c.min_subtotal_uyu != null ? String(c.min_subtotal_uyu) : '',
    starts_at: toDateInput(c.starts_at),
    ends_at: toDateInput(c.ends_at),
    max_uses: c.max_uses != null ? String(c.max_uses) : '',
    max_uses_per_customer: c.max_uses_per_customer != null ? String(c.max_uses_per_customer) : '',
    scope: c.product_ids.length > 0 ? 'products' : c.category_ids.length > 0 ? 'categories' : 'all',
    product_ids: c.product_ids,
    category_ids: c.category_ids,
    active: c.active,
  })

  const save = async () => {
    if (!draft) return
    const code = draft.code.trim().toUpperCase()
    if (code.length < 3) { showToast('El código necesita al menos 3 caracteres.'); return }
    const value = draft.kind === 'free_shipping' ? null : parseInt(draft.value, 10)
    if (draft.kind === 'percent' && (value == null || isNaN(value) || value < 1 || value > 90)) {
      showToast('El porcentaje va de 1 a 90.'); return
    }
    if (draft.kind === 'fixed' && (value == null || isNaN(value) || value <= 0)) {
      showToast('Ingresá el monto del descuento.'); return
    }
    if (draft.scope === 'products' && draft.product_ids.length === 0) {
      showToast('Elegí al menos un producto (o cambiá el alcance a todo el catálogo).'); return
    }
    if (draft.scope === 'categories' && draft.category_ids.length === 0) {
      showToast('Elegí al menos una categoría (o cambiá el alcance a todo el catálogo).'); return
    }

    const num = (s: string) => {
      const n = parseInt(s, 10)
      return isNaN(n) || n <= 0 ? null : n
    }
    const row = {
      code,
      label: draft.label.trim() || null,
      kind: draft.kind,
      value,
      min_subtotal_uyu: num(draft.min_subtotal_uyu),
      starts_at: draft.starts_at ? new Date(`${draft.starts_at}T00:00:00`).toISOString() : null,
      ends_at: draft.ends_at ? new Date(`${draft.ends_at}T23:59:59`).toISOString() : null,
      max_uses: num(draft.max_uses),
      max_uses_per_customer: num(draft.max_uses_per_customer),
      product_ids: draft.scope === 'products' ? draft.product_ids : [],
      category_ids: draft.scope === 'categories' ? draft.category_ids : [],
      active: draft.active,
    }

    setSaving(true)
    const supabase = createClient()
    const res = draft.id
      ? await supabase.from('coupons').update(row).eq('id', draft.id)
      : await supabase.from('coupons').insert(row)
    setSaving(false)
    if (res.error) {
      if (res.error.code === '23505' || /duplicate|unique/i.test(res.error.message || '')) {
        showToast('Ya existe un cupón con ese código.')
      } else {
        showToast('No se pudo guardar el cupón. Probá de nuevo.')
      }
      return
    }
    setDraft(null)
    showToast(draft.id ? 'Cupón actualizado.' : `Cupón ${code} creado.`)
    load()
  }

  const toggleActive = async (c: Coupon) => {
    const supabase = createClient()
    const prev = coupons
    setCoupons((list) => list.map((x) => (x.id === c.id ? { ...x, active: !c.active } : x)))
    const { error } = await supabase.from('coupons').update({ active: !c.active }).eq('id', c.id)
    if (error) {
      setCoupons(prev)
      showToast('No se pudo cambiar el estado.')
    }
  }

  const remove = async (c: Coupon) => {
    if (!confirm(`¿Eliminar el cupón ${c.code}? Se pierde también su historial de usos.`)) return
    const supabase = createClient()
    const { error } = await supabase.from('coupons').delete().eq('id', c.id)
    if (error) {
      showToast('No se pudo eliminar.')
    } else {
      setCoupons((list) => list.filter((x) => x.id !== c.id))
    }
  }

  const toggleId = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id]

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
      </div>
    )
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Cupones</h2>
          <p>Códigos de descuento para drops, clientas VIP y campañas</p>
        </div>
        {!tableMissing && !draft && (
          <button className="admin-btn admin-btn-primary" onClick={startNew}>
            Nuevo cupón
          </button>
        )}
      </div>

      {toast && (
        <div role="status" style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 100,
          background: '#1F1A1B', color: '#fff', borderRadius: 10,
          padding: '12px 18px', fontSize: '0.85rem', boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        }}>{toast}</div>
      )}

      {tableMissing ? (
        <div className="admin-card">
          <h3 style={{ marginTop: 0, fontSize: '1rem' }}>Falta un paso de configuración</h3>
          <p style={{ color: '#4A4143', fontSize: '0.9rem', lineHeight: 1.6 }}>
            La tabla de cupones todavía no existe. Ejecutá <code>database/schema-cupones.sql</code> en el
            SQL Editor de Supabase (1 minuto) y recargá esta página.
          </p>
        </div>
      ) : (
        <>
          {draft && (
            <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>
                {draft.id ? `Editar ${draft.code}` : 'Nuevo cupón'}
              </h3>

              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor="cup-code">Código</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      id="cup-code"
                      value={draft.code}
                      onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase().replace(/\s/g, '') })}
                      placeholder="VERANO26"
                      maxLength={30}
                      style={{ textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}
                    />
                    <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm"
                      onClick={() => setDraft({ ...draft, code: randomCode() })}>
                      Generar
                    </button>
                  </div>
                </div>
                <div className="admin-field">
                  <label htmlFor="cup-label">Nota interna (opcional)</label>
                  <input
                    id="cup-label"
                    value={draft.label}
                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                    placeholder="Ej: lanzamiento drop Verano '26"
                    maxLength={80}
                  />
                </div>
              </div>

              <div className="admin-field" style={{ margin: '0.75rem 0' }}>
                <label>Tipo de descuento</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(Object.keys(KIND_LABEL) as Coupon['kind'][]).map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`admin-btn admin-btn-sm ${draft.kind === k ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                      onClick={() => setDraft({ ...draft, kind: k })}
                      aria-pressed={draft.kind === k}
                    >
                      {KIND_LABEL[k]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="admin-form-grid">
                {draft.kind !== 'free_shipping' && (
                  <div className="admin-field">
                    <label htmlFor="cup-value">{draft.kind === 'percent' ? 'Porcentaje (1–90)' : 'Monto (UYU)'}</label>
                    <input
                      id="cup-value"
                      type="number"
                      min={1}
                      max={draft.kind === 'percent' ? 90 : undefined}
                      value={draft.value}
                      onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                    />
                  </div>
                )}
                <div className="admin-field">
                  <label htmlFor="cup-min">Compra mínima UYU (opcional)</label>
                  <input
                    id="cup-min"
                    type="number"
                    min={0}
                    value={draft.min_subtotal_uyu}
                    onChange={(e) => setDraft({ ...draft, min_subtotal_uyu: e.target.value })}
                    placeholder="Sin mínimo"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="cup-start">Vigente desde (opcional)</label>
                  <input
                    id="cup-start"
                    type="date"
                    value={draft.starts_at}
                    onChange={(e) => setDraft({ ...draft, starts_at: e.target.value })}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="cup-end">Vence (opcional)</label>
                  <input
                    id="cup-end"
                    type="date"
                    value={draft.ends_at}
                    onChange={(e) => setDraft({ ...draft, ends_at: e.target.value })}
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="cup-max">Usos máximos totales (opcional)</label>
                  <input
                    id="cup-max"
                    type="number"
                    min={1}
                    value={draft.max_uses}
                    onChange={(e) => setDraft({ ...draft, max_uses: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>
                <div className="admin-field">
                  <label htmlFor="cup-maxc">Usos por cliente (opcional)</label>
                  <input
                    id="cup-maxc"
                    type="number"
                    min={1}
                    value={draft.max_uses_per_customer}
                    onChange={(e) => setDraft({ ...draft, max_uses_per_customer: e.target.value })}
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="admin-field" style={{ margin: '0.75rem 0' }}>
                <label>Aplica a</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {([['all', 'Todo el catálogo'], ['categories', 'Categorías'], ['products', 'Productos']] as Array<[Scope, string]>).map(([s, lbl]) => (
                    <button
                      key={s}
                      type="button"
                      className={`admin-btn admin-btn-sm ${draft.scope === s ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                      onClick={() => setDraft({ ...draft, scope: s })}
                      aria-pressed={draft.scope === s}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              {draft.scope === 'categories' && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {categories.map((c) => (
                    <label key={c.id} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem',
                      border: '1px solid rgba(31,26,27,0.18)', borderRadius: 999, padding: '6px 12px', cursor: 'pointer',
                      background: draft.category_ids.includes(c.id) ? '#FAF1DF' : '#fff',
                    }}>
                      <input
                        type="checkbox"
                        checked={draft.category_ids.includes(c.id)}
                        onChange={() => setDraft({ ...draft, category_ids: toggleId(draft.category_ids, c.id) })}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              )}

              {draft.scope === 'products' && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 6, marginBottom: '0.75rem', maxHeight: 260, overflowY: 'auto',
                  border: '1px solid rgba(31,26,27,0.10)', borderRadius: 8, padding: 10,
                }}>
                  {products.map((p) => (
                    <label key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={draft.product_ids.includes(p.id)}
                        onChange={() => setDraft({ ...draft, product_ids: toggleId(draft.product_ids, p.id) })}
                      />
                      {p.name}
                    </label>
                  ))}
                </div>
              )}

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', marginBottom: '1rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                />
                Activo
              </label>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving}>
                  {saving ? 'Guardando…' : draft.id ? 'Guardar cambios' : 'Crear cupón'}
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={() => setDraft(null)} disabled={saving}>
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {coupons.length === 0 && !draft ? (
            <div className="admin-empty">
              <p>
                Todavía no hay cupones. Creá el primero — por ejemplo, uno de bienvenida para la lista VIP
                o el de acceso anticipado del próximo drop.
              </p>
            </div>
          ) : coupons.length > 0 && (
            <div className="admin-card">
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Descuento</th>
                      <th>Alcance</th>
                      <th>Vigencia</th>
                      <th>Usos</th>
                      <th>Estado</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => {
                      const used = uses[c.id] ?? 0
                      const scopeLabel = c.product_ids.length > 0
                        ? `${c.product_ids.length} producto${c.product_ids.length === 1 ? '' : 's'}`
                        : c.category_ids.length > 0
                          ? `${c.category_ids.length} categoría${c.category_ids.length === 1 ? '' : 's'}`
                          : 'Todo'
                      const expired = c.ends_at ? new Date(c.ends_at).getTime() < loadedAt : false
                      return (
                        <tr key={c.id} style={!c.active || expired ? { opacity: 0.55 } : undefined}>
                          <td>
                            <strong style={{ letterSpacing: '0.04em' }}>{c.code}</strong>
                            {c.label && <><br /><span style={{ fontSize: '0.75rem', color: '#8C8285' }}>{c.label}</span></>}
                          </td>
                          <td>{couponSummary(c)}{c.min_subtotal_uyu ? <><br /><span style={{ fontSize: '0.75rem', color: '#8C8285' }}>mín. ${c.min_subtotal_uyu.toLocaleString('es-UY')}</span></> : null}</td>
                          <td>{scopeLabel}</td>
                          <td style={{ fontSize: '0.85rem' }}>{couponWindow(c)}</td>
                          <td>{used}{c.max_uses ? ` / ${c.max_uses}` : ''}</td>
                          <td>
                            <span className={`admin-badge ${c.active && !expired ? 'done' : 'cancelled'}`}>
                              {expired ? 'Vencido' : c.active ? 'Activo' : 'Pausado'}
                            </span>
                          </td>
                          <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => startEdit(c)} style={{ marginRight: 6 }}>
                              Editar
                            </button>
                            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => toggleActive(c)} style={{ marginRight: 6 }}>
                              {c.active ? 'Pausar' : 'Activar'}
                            </button>
                            <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => remove(c)}>
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#8C8285', marginTop: 10, marginBottom: 0 }}>
                “Usos” cuenta cada vez que alguien finalizó su pedido por WhatsApp con el cupón puesto.
                Confirmá el cupón al cobrar — el mensaje de WhatsApp lo trae detallado.
              </p>
            </div>
          )}
        </>
      )}
    </>
  )
}
