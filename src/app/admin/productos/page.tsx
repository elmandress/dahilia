'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Product, Category, ProductSize } from '@/lib/types'
import { formatPrice, getPrimaryPhoto } from '@/lib/types'
import { notifyReindex } from '@/lib/seo-notify'
import { recommendPrice, formatUyu, applyBulkOp, type BulkOp, type PricingRecommendation, type PricingPeer } from '@/lib/pricing'
import { useUnsavedWarning } from '@/lib/use-unsaved-warning'

// ---- Edición de precios en lote (08/10/2026) ----
// Antes cada precio se cambiaba entrando a la prenda, una por una. Acá se
// editan todos desde la tabla: el borrador vive en memoria (solo los campos
// tocados) y nada llega a la tienda hasta "Guardar cambios".
type PriceDraft = { base?: string; sizes?: Record<string, string> }
type Drafts = Record<string, PriceDraft>

const origBase = (p: Product) => (p.base_price_uyu ? String(p.base_price_uyu) : '')
const origSize = (s: ProductSize) => (s.price_uyu ? String(s.price_uyu) : '')
const baseIn = (d: Drafts, p: Product) => d[p.id]?.base ?? origBase(p)
const sizeIn = (d: Drafts, p: Product, s: ProductSize) => d[p.id]?.sizes?.[s.id] ?? origSize(s)
const sortedSizes = (p: Product) => [...(p.sizes ?? [])].sort((a, b) => a.sort_order - b.sort_order)
const toInt = (v: string) => { const n = parseInt(v); return Number.isFinite(n) && n > 0 ? n : null }
const isDraftDirty = (d: Drafts, p: Product) =>
  baseIn(d, p) !== origBase(p) || (p.sizes ?? []).some((s) => sizeIn(d, p, s) !== origSize(s))

const BULK_OPS: Array<[BulkOp, string]> = [
  ['pct-up', 'Subir %'],
  ['pct-down', 'Bajar %'],
  ['add', 'Sumar $'],
  ['sub', 'Restar $'],
  ['set', 'Fijar en $ (todos los talles igual)'],
]

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)
  // Un error de lectura (RLS, red, base caída) devolvía data:null y la página
  // mostraba "No hay productos / Creá tu primer producto": para quien no es
  // técnico eso se lee como "se borró todo el catálogo".
  const [loadError, setLoadError] = useState<string | null>(null)
  // Horas y materiales por product_id (tabla interna product_costs). Vacío
  // mientras no se corra database/costos-produccion-2026-09.sql: el marcador
  // cae entonces a los datos de la tabla aprobada (ver lib/pricing.ts).
  const [costs, setCosts] = useState<Record<string, { hours: number | null; materials: number | null }>>({})
  // Productos activos, para que cada recomendación pueda mostrar si la misma
  // categoría ya vende a ese nivel de precio.
  const peers: PricingPeer[] = products
    .filter((p) => p.status === 'active')
    .map((p) => ({ slug: p.slug, name: p.name, price: p.base_price_uyu, categoryId: p.category?.id ?? null }))

  const [bulkMode, setBulkMode] = useState(false)
  const [drafts, setDrafts] = useState<Drafts>({})
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkOp, setBulkOp] = useState<BulkOp>('pct-up')
  const [bulkValue, setBulkValue] = useState('')
  const [savingBulk, setSavingBulk] = useState(false)
  const [bulkMsg, setBulkMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const dirtyProducts = products.filter((p) => isDraftDirty(drafts, p))
  useUnsavedWarning(dirtyProducts.length > 0)

  const loadData = useCallback(async () => {
    const supabase = createClient()

    const [productsRes, categoriesRes, costsRes] = await Promise.all([
      supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          media:product_media(*),
          sizes:product_sizes(*)
        `)
        .order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('product_costs').select('product_id, labor_hours, materials_cost_uyu'),
    ])

    setLoadError(productsRes.error ? 'No se pudieron cargar los productos (no es que no haya: no se pudo leer la base). Probá recargar la página.' : null)
    setProducts((productsRes.data ?? []) as Product[])
    setCategories((categoriesRes.data ?? []) as Category[])
    if (!costsRes.error) {
      const map: Record<string, { hours: number | null; materials: number | null }> = {}
      for (const c of (costsRes.data ?? []) as Array<{ product_id: string; labor_hours: number | string | null; materials_cost_uyu: number | null }>) {
        map[c.product_id] = {
          hours: c.labor_hours != null ? Number(c.labor_hours) : null,
          materials: c.materials_cost_uyu,
        }
      }
      setCosts(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const target = products.find((p) => p.id === id)

    // Se borra el producto primero: fotos, talles y colores caen solos por el
    // ON DELETE CASCADE del schema. Antes se borraban esos tres a mano ANTES
    // del producto, así que si el borrado final fallaba (RLS, red) la prenda
    // seguía publicada pero ya sin fotos ni talles, y el cartel decía
    // "no se pudo eliminar" — el peor de los dos mundos.
    let { error } = await supabase.from('products').delete().eq('id', id)

    // Base sin la cascada (esquema viejo): recién ahí se limpian las hijas.
    if (error && (error.code === '23503' || /foreign key/i.test(error.message || ''))) {
      await Promise.all([
        supabase.from('product_media').delete().eq('product_id', id),
        supabase.from('product_sizes').delete().eq('product_id', id),
        supabase.from('product_colors').delete().eq('product_id', id),
      ])
      ;({ error } = await supabase.from('products').delete().eq('id', id))
    }

    if (!error) {
      setProducts(products.filter(p => p.id !== id))
      // La URL deja de existir: sin esto la ficha vieja se sigue sirviendo
      // desde el caché hasta 1h (el editor ya lo hacía; el listado no).
      if (target?.slug) notifyReindex([`/tienda/${target.slug}`, '/tienda', '/'])
    } else {
      console.error('delete product failed', error)
      alert('No se pudo eliminar el producto. Probá de nuevo en un momento.')
    }
    setDeleteId(null)
  }

  // Duplicate a product (as a draft) with its sizes and media. The copy gets a
  // unique slug and "(copia)" in the name so the owner can tweak it from scratch.
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const handleDuplicate = async (id: string) => {
    setDuplicatingId(id)
    try {
      const supabase = createClient()
      const { data: orig, error: fetchErr } = await supabase
        .from('products')
        .select('*, sizes:product_sizes(*), media:product_media(*), colors:product_colors(*)')
        .eq('id', id)
        .single()
      if (fetchErr || !orig) throw fetchErr || new Error('No encontrado')

      // Strip keys we must not copy verbatim.
      const omit = (obj: Record<string, unknown>, keys: string[]) => {
        const out: Record<string, unknown> = {}
        for (const k of Object.keys(obj)) if (!keys.includes(k)) out[k] = obj[k]
        return out
      }

      const suffix = Math.random().toString(36).slice(2, 6)
      const productRow = orig as Record<string, unknown> & {
        name: string; slug: string
        sizes?: Array<Record<string, unknown>>
        media?: Array<Record<string, unknown>>
        colors?: Array<Record<string, unknown>>
      }
      const insertBody = {
        ...omit(productRow, ['id', 'created_at', 'updated_at', 'sizes', 'media', 'colors']),
        name: `${productRow.name} (copia)`,
        slug: `${productRow.slug}-copia-${suffix}`,
        status: 'draft' as const,
      }
      const { data: created, error: insErr } = await supabase
        .from('products')
        .insert(insertBody)
        .select()
        .single()
      if (insErr || !created) throw insErr || new Error('No se pudo duplicar')

      const newId = created.id
      if (productRow.sizes?.length) {
        await supabase.from('product_sizes').insert(
          productRow.sizes.map((s) => ({ ...omit(s, ['id', 'product_id']), product_id: newId }))
        )
      }
      if (productRow.media?.length) {
        await supabase.from('product_media').insert(
          productRow.media.map((m) => ({ ...omit(m, ['id', 'product_id', 'created_at']), product_id: newId }))
        )
      }
      if (productRow.colors?.length) {
        await supabase.from('product_colors').insert(
          productRow.colors.map((c) => ({ ...omit(c, ['product_id']), product_id: newId }))
        )
      }
      await loadData()
    } catch (e) {
      console.error('duplicate failed', e)
      alert('No se pudo duplicar el producto.')
    } finally {
      setDuplicatingId(null)
    }
  }

  // Quick publish/unpublish toggle straight from the list (active ⇄ draft).
  const toggleStatus = async (p: Product) => {
    const next = p.status === 'active' ? 'draft' : 'active'
    const supabase = createClient()
    // Optimistic update.
    setProducts((curr) => curr.map((x) => (x.id === p.id ? { ...x, status: next } : x)))
    const { error } = await supabase.from('products').update({ status: next }).eq('id', p.id)
    if (error) {
      // Revert on failure.
      setProducts((curr) => curr.map((x) => (x.id === p.id ? { ...x, status: p.status } : x)))
    } else {
      // Publicar o despublicar cambia si la URL debería estar indexada, y
      // el HTML cacheado tiene que dejar de mostrar el estado viejo ya.
      notifyReindex([`/tienda/${p.slug}`, '/tienda', '/'])
    }
  }

  const term = searchTerm.trim().toLowerCase()
  const filteredProducts = products.filter(p => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (filterCategory !== 'all' && p.category_id !== filterCategory) return false
    if (term && !p.name.toLowerCase().includes(term) && !p.slug.toLowerCase().includes(term)) return false
    return true
  })

  // Drag-to-reorder is only meaningful on the full, unfiltered list (sort_order
  // is a single global order). Disable it while any filter/search is active.
  const reorderEnabled = filterStatus === 'all' && filterCategory === 'all' && !term && !bulkMode

  // Mueve una prenda a la posición de otra y guarda el orden nuevo. Lo usan
  // el arrastre (computadora) y las flechas ▲▼ (el arrastre nativo no anda
  // con el dedo en el celular).
  const moveProduct = async (movedId: string, targetId: string) => {
    if (movedId === targetId) return
    const list = [...products]
    const from = list.findIndex((p) => p.id === movedId)
    const to = list.findIndex((p) => p.id === targetId)
    if (from === -1 || to === -1) return
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved)
    // Reassign sort_order sequentially and persist only the rows that changed.
    const reindexed = list.map((p, i) => ({ ...p, sort_order: i }))
    setProducts(reindexed)
    setSavingOrder(true)
    try {
      const supabase = createClient()
      const changed = reindexed.filter((p, i) => products[i]?.id !== p.id || products[i]?.sort_order !== p.sort_order)
      const results = await Promise.all(
        changed.map((p) => supabase.from('products').update({ sort_order: p.sort_order }).eq('id', p.id))
      )
      if (results.some((r) => r.error)) {
        alert('No se pudo guardar el orden nuevo. Probá de nuevo.')
        await loadData()
      } else {
        // La tienda y la home están cacheadas: sin esto el orden nuevo
        // tardaba hasta 1 h en verse.
        notifyReindex(['/tienda', '/', ...categories.map((c) => `/tienda/${c.slug}`)])
      }
    } finally {
      setSavingOrder(false)
    }
  }

  const handleDrop = (targetId: string) => {
    const id = dragId
    setDragId(null)
    if (id) moveProduct(id, targetId)
  }

  const editBase = (id: string, v: string) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], base: v } }))
  const editSize = (id: string, sizeId: string, v: string) =>
    setDrafts((d) => ({ ...d, [id]: { ...d[id], sizes: { ...d[id]?.sizes, [sizeId]: v } } }))

  const toggleBulkMode = () => {
    if (bulkMode && dirtyProducts.length > 0
      && !confirm(`Tenés ${dirtyProducts.length} producto(s) con precios sin guardar. ¿Salir y descartarlos?`)) return
    setBulkMode(!bulkMode)
    setDrafts({})
    setSelected(new Set())
    setBulkMsg(null)
  }

  const visibleIds = filteredProducts.map((p) => p.id)
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.has(id))
  const toggleSelectAll = () =>
    setSelected(allVisibleSelected ? new Set() : new Set(visibleIds))
  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Las prendas "a medida" no tienen precio de lista: quedan afuera del lote.
  const bulkTargets = filteredProducts.filter((p) => selected.has(p.id) && !p.is_custom_only)

  const applyBulk = () => {
    const v = parseFloat(bulkValue.replace(',', '.'))
    if (!Number.isFinite(v) || v <= 0) {
      setBulkMsg({ ok: false, text: 'Escribí un número mayor que 0.' })
      return
    }
    if (bulkTargets.length === 0) {
      setBulkMsg({ ok: false, text: 'Marcá al menos una prenda con precio (las "a medida" no cuentan).' })
      return
    }
    const value = Math.round(v)
    setDrafts((d) => {
      const next = { ...d }
      for (const p of bulkTargets) {
        const sizes: Record<string, string> = { ...next[p.id]?.sizes }
        const draft: PriceDraft = { ...next[p.id], sizes }
        if (bulkOp === 'set') {
          // Un solo precio: el base, y cada talle vacío (= usa el base).
          draft.base = String(value)
          for (const s of p.sizes ?? []) sizes[s.id] = ''
        } else {
          const b = toInt(baseIn(d, p))
          if (b != null) draft.base = String(applyBulkOp(b, bulkOp, value))
          for (const s of p.sizes ?? []) {
            const sp = toInt(sizeIn(d, p, s))
            if (sp != null) sizes[s.id] = String(applyBulkOp(sp, bulkOp, value))
          }
        }
        next[p.id] = draft
      }
      return next
    })
    setBulkMsg({ ok: true, text: `Listo en ${bulkTargets.length} prenda(s). Revisá los números y tocá "Guardar cambios".` })
  }

  // "Mismo precio para todos los talles": vacía el precio de cada talle para
  // que todos usen el precio base de la prenda.
  const equalizeSizes = () => {
    const withSizes = bulkTargets.filter((p) => (p.sizes?.length ?? 0) > 0)
    const ok = withSizes.filter((p) => toInt(baseIn(drafts, p)) != null)
    const skipped = withSizes.length - ok.length
    if (ok.length === 0) {
      setBulkMsg({ ok: false, text: 'Ninguna de las prendas marcadas tiene talles y precio base para igualar.' })
      return
    }
    setDrafts((d) => {
      const next = { ...d }
      for (const p of ok) {
        const sizes: Record<string, string> = { ...next[p.id]?.sizes }
        for (const s of p.sizes ?? []) sizes[s.id] = ''
        next[p.id] = { ...next[p.id], sizes }
      }
      return next
    })
    setBulkMsg({
      ok: true,
      text: `Todos los talles al precio base en ${ok.length} prenda(s).${skipped ? ` ${skipped} sin precio base quedaron igual.` : ''} Falta "Guardar cambios".`,
    })
  }

  const saveBulk = async () => {
    const list = dirtyProducts
    if (list.length === 0) return
    const noPrice = list.find((p) => !p.is_custom_only
      && toInt(baseIn(drafts, p)) == null
      && !(p.sizes ?? []).some((s) => toInt(sizeIn(drafts, p, s)) != null))
    if (noPrice) {
      setBulkMsg({ ok: false, text: `"${noPrice.name}" quedaría sin ningún precio. Poné un precio base o en algún talle.` })
      return
    }
    setSavingBulk(true)
    setBulkMsg(null)
    const supabase = createClient()
    const now = new Date().toISOString()
    const failed: string[] = []
    await Promise.all(list.map(async (p) => {
      // updated_at también cuando solo cambia un talle: es el lastmod del
      // sitemap, y Google tiene que ver que la ficha cambió.
      const { error } = await supabase
        .from('products')
        .update({ base_price_uyu: toInt(baseIn(drafts, p)), updated_at: now })
        .eq('id', p.id)
      if (error) { failed.push(p.id); return }
      const changed = (p.sizes ?? []).filter((s) => sizeIn(drafts, p, s) !== origSize(s))
      const results = await Promise.all(changed.map((s) =>
        supabase.from('product_sizes').update({ price_uyu: toInt(sizeIn(drafts, p, s)) }).eq('id', s.id)))
      if (results.some((r) => r.error)) failed.push(p.id)
    }))
    const saved = list.filter((p) => !failed.includes(p.id))
    if (saved.length > 0) notifyReindex([...saved.map((p) => `/tienda/${p.slug}`), '/tienda', '/'])
    await loadData()
    // Lo que falló queda en borrador para reintentar; lo guardado se limpia.
    setDrafts((d) => Object.fromEntries(Object.entries(d).filter(([id]) => failed.includes(id))))
    setSavingBulk(false)
    setBulkMsg(failed.length === 0
      ? { ok: true, text: `Guardado: ${saved.length} prenda(s) con precio nuevo en la tienda.` }
      : { ok: false, text: `Se guardaron ${saved.length}, pero fallaron: ${list.filter((p) => failed.includes(p.id)).map((p) => p.name).join(', ')}. Siguen marcadas: probá de nuevo.` })
  }

  if (loading) {
    return <div className="admin-loading"><div className="admin-spinner" /></div>
  }

  return (
    <>
      <div className="admin-page-header">
        <div>
          <h2>Productos</h2>
          <p>{products.length} productos en total</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="admin-btn admin-btn-secondary" onClick={toggleBulkMode} aria-pressed={bulkMode}>
          {bulkMode ? 'Terminar de editar precios' : 'Editar precios'}
        </button>
        <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-primary">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo producto
        </Link>
        </div>
      </div>

      {loadError && (
        <div role="alert" style={{
          background: 'rgba(182,49,74,0.06)', border: '1px solid rgba(182,49,74,0.24)',
          color: '#7a1e2f', padding: '12px 14px', borderRadius: 8, marginBottom: 18, fontSize: 13,
          display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap',
        }}>
          <span>{loadError}</span>
          <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setLoading(true); loadData() }}>
            Reintentar
          </button>
        </div>
      )}

      {/* Filters + search */}
      <div className="admin-filters" style={{ flexWrap: 'wrap', gap: 10 }}>
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o slug..."
          aria-label="Buscar productos"
          style={{ flex: '1 1 220px', minWidth: 0 }}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="draft">Borrador</option>
          <option value="soldout">Agotado</option>
        </select>

        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {bulkMode && (
        <div className="admin-card" style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <h3 style={{ margin: '0 0 4px', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Editar precios</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#8C8285' }}>
              Cambiá los números directo en la tabla, o marcá varias prendas y aplicales un ajuste.
              Un talle vacío usa el precio base. Nada cambia en la tienda hasta tocar Guardar.
            </p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#4A4143' }}>
              {selected.size} marcada(s)
            </span>
            <select
              value={bulkOp}
              onChange={(e) => setBulkOp(e.target.value as BulkOp)}
              aria-label="Tipo de ajuste"
              style={{ padding: '0.45rem 0.6rem', border: '1px solid rgba(31,26,27,0.18)', borderRadius: 6, fontSize: '0.85rem', background: '#fff' }}
            >
              {BULK_OPS.map(([op, label]) => <option key={op} value={op}>{label}</option>)}
            </select>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={bulkValue}
              onChange={(e) => setBulkValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applyBulk() }}
              placeholder={bulkOp.startsWith('pct') ? 'Ej. 10' : 'Ej. 3450'}
              aria-label="Valor del ajuste"
              style={{ width: 110, padding: '0.45rem 0.6rem', border: '1px solid rgba(31,26,27,0.18)', borderRadius: 6, fontSize: '0.85rem' }}
            />
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={applyBulk} disabled={selected.size === 0}>
              Aplicar a las marcadas
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={equalizeSizes}
              disabled={selected.size === 0}
              title="Borra el precio propio de cada talle: todos pasan a costar el precio base"
            >
              Mismo precio en todos los talles
            </button>
          </div>
          {bulkOp.startsWith('pct') && (
            <span style={{ fontSize: '0.78rem', color: '#8C8285', marginTop: -6 }}>Los porcentajes se redondean a la decena ($3.457 → $3.460).</span>
          )}
          {bulkMsg && (
            <p role="status" style={{ margin: 0, fontSize: '0.85rem', color: bulkMsg.ok ? '#2e7d32' : '#7a1e2f' }}>{bulkMsg.text}</p>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={saveBulk}
              disabled={savingBulk || dirtyProducts.length === 0}
            >
              {savingBulk ? 'Guardando…' : `Guardar cambios${dirtyProducts.length ? ` (${dirtyProducts.length})` : ''}`}
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => { setDrafts({}); setBulkMsg(null) }}
              disabled={savingBulk || dirtyProducts.length === 0}
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      <p style={{ fontSize: '0.8rem', color: '#8C8285', margin: '0 0 12px' }}>
        {bulkMode ? 'Editando precios: el orden se cambia saliendo de este modo.' : reorderEnabled
          ? `Este es el orden en que se ven en la tienda: arrastrá las filas o usá las flechas ▲▼.${savingOrder ? ' Guardando…' : ''}`
          : 'Quitá los filtros para poder reordenar.'}
        {' '}Mostrando {filteredProducts.length} de {products.length}.
      </p>

      {/* Table */}
      <div className="admin-card">
        {filteredProducts.length === 0 ? (
          <div className="admin-empty">
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            {/* Tres motivos distintos para una lista vacía: no se pudo leer,
                el filtro no deja pasar nada, o de verdad no hay nada. */}
            {loadError ? (
              <>
                <h3>No se pudo leer el catálogo</h3>
                <p>Los productos siguen ahí — es la conexión con la base la que falló.</p>
              </>
            ) : products.length > 0 ? (
              <>
                <h3>Ningún producto coincide</h3>
                <p>Tenés {products.length} productos, pero ninguno pasa el filtro o la búsqueda actual.</p>
                <button
                  className="admin-btn admin-btn-secondary"
                  onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterCategory('all') }}
                >
                  Quitar filtros
                </button>
              </>
            ) : (
              <>
                <h3>No hay productos</h3>
                <p>Creá tu primer producto para empezar</p>
                <Link href="/admin/productos/nuevo" className="admin-btn admin-btn-primary">
                  Crear producto
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  {bulkMode && (
                    <th style={{ width: 36 }}>
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAll}
                        aria-label="Marcar todas las prendas visibles"
                        style={{ width: 18, height: 18, accentColor: '#8F3B53' }}
                      />
                    </th>
                  )}
                  <th style={{ width: 60 }}></th>
                  <th>Nombre</th>
                  <th className="col-hide-mobile">Categoría</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, idx) => (
                  <tr
                    key={product.id}
                    draggable={reorderEnabled}
                    onDragStart={() => reorderEnabled && setDragId(product.id)}
                    onDragOver={(e) => { if (reorderEnabled) e.preventDefault() }}
                    onDrop={() => reorderEnabled && handleDrop(product.id)}
                    style={{
                      cursor: reorderEnabled ? 'grab' : 'default',
                      opacity: dragId === product.id ? 0.5 : 1,
                    }}
                  >
                    {bulkMode && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          aria-label={`Marcar ${product.name}`}
                          style={{ width: 18, height: 18, accentColor: '#8F3B53' }}
                        />
                      </td>
                    )}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {reorderEnabled && (
                          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <button
                              type="button"
                              className="admin-btn-icon"
                              onClick={() => idx > 0 && moveProduct(product.id, filteredProducts[idx - 1].id)}
                              disabled={idx === 0 || savingOrder}
                              aria-label={`Subir ${product.name}`}
                              title="Subir"
                              style={{ width: 28, height: 24, fontSize: 11 }}
                            >▲</button>
                            <button
                              type="button"
                              className="admin-btn-icon"
                              onClick={() => idx < filteredProducts.length - 1 && moveProduct(product.id, filteredProducts[idx + 1].id)}
                              disabled={idx === filteredProducts.length - 1 || savingOrder}
                              aria-label={`Bajar ${product.name}`}
                              title="Bajar"
                              style={{ width: 28, height: 24, fontSize: 11 }}
                            >▼</button>
                          </span>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getPrimaryPhoto(product)}
                          alt={product.name}
                          className="product-thumb"
                        />
                      </div>
                    </td>
                    <td>
                      <Link href={`/admin/productos/${product.id}`} style={{ color: '#1F1A1B', textDecoration: 'none', fontWeight: 500 }}>
                        {product.name}
                      </Link>
                      {product.badge && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#FAF1DF', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#8F3B53' }}>
                          {product.badge}
                        </span>
                      )}
                      {product.discount_active && (product.discount_percent ?? 0) > 0 && (
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: '#B6314A', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#fff', fontWeight: 600 }}>
                          −{product.discount_percent}%
                        </span>
                      )}
                      {product.status === 'active' && !(product.description ?? '').trim() && (
                        <span
                          title="Esta ficha no tiene descripción: es lo que más frena la venta y el SEO"
                          style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'rgba(182,49,74,0.08)', border: '1px solid rgba(182,49,74,0.25)', padding: '0.1rem 0.4rem', borderRadius: '4px', color: '#B6314A' }}
                        >
                          sin descripción
                        </span>
                      )}
                      <br />
                      <span style={{ fontSize: '0.8rem', color: '#8C8285' }}>/{product.slug}</span>
                    </td>
                    <td className="col-hide-mobile">{product.category?.name || '—'}</td>
                    <td>
                      {bulkMode ? (
                        <BulkPriceCell
                          product={product}
                          drafts={drafts}
                          onBase={(v) => editBase(product.id, v)}
                          onSize={(sid, v) => editSize(product.id, sid, v)}
                        />
                      ) : (
                        <>
                          {product.base_price_uyu ? formatPrice(product.base_price_uyu) : '—'}
                          <SizePriceSummary product={product} />
                        </>
                      )}
                      <PriceHint
                        rec={recommendPrice({
                          slug: product.slug,
                          price: bulkMode ? toInt(baseIn(drafts, product)) : product.base_price_uyu,
                          hours: costs[product.id]?.hours,
                          materials: costs[product.id]?.materials,
                          categoryId: product.category?.id ?? null,
                          peers,
                        })}
                      />
                    </td>
                    <td>
                      {product.status === 'soldout' ? (
                        <span className="admin-badge soldout">Agotado</span>
                      ) : (
                        <button
                          onClick={() => toggleStatus(product)}
                          title={product.status === 'active' ? 'Tocar para ocultar de la tienda' : 'Tocar para publicar'}
                          aria-label={product.status === 'active' ? 'Despublicar' : 'Publicar'}
                          style={{
                            cursor: 'pointer', border: 'none', borderRadius: 999,
                            padding: '0.25rem 0.7rem', fontSize: '0.75rem', fontWeight: 500,
                            background: product.status === 'active' ? '#e8f5e9' : '#f0f0f0',
                            color: product.status === 'active' ? '#2e7d32' : '#8C8285',
                          }}
                        >
                          {product.status === 'active' ? 'Activo' : 'Borrador'}
                        </button>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions">
                        <Link href={`/admin/productos/${product.id}`} className="admin-btn-icon" title="Editar">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button
                          className="admin-btn-icon"
                          title="Duplicar"
                          aria-label="Duplicar producto"
                          disabled={duplicatingId === product.id}
                          onClick={() => handleDuplicate(product.id)}
                        >
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                          </svg>
                        </button>
                        <button className="admin-btn-icon danger" title="Eliminar" onClick={() => setDeleteId(product.id)}>
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="admin-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            {/* El nombre va en el título: en el teléfono la fila que tocaste
                queda tapada por el modal y no había forma de verificar cuál
                de las 34 prendas estabas por borrar. */}
            <h3>¿Eliminar “{products.find((p) => p.id === deleteId)?.name ?? 'este producto'}”?</h3>
            <p>Esta acción no se puede deshacer. Se eliminarán también las fotos, tallas y colores asociados.</p>
            <div className="modal-actions">
              <button className="admin-btn admin-btn-secondary" onClick={() => setDeleteId(null)}>
                Cancelar
              </button>
              <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(deleteId)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Marcador de precio dinámico, debajo del precio de cada producto (ver
 * lib/pricing.ts). El detalle completo —el porqué, todas las etapas y un botón
 * para aplicar el próximo precio— está en el editor de cada producto; acá va
 * el resumen, con el porqué en el tooltip.
 */
function PriceHint({ rec }: { rec: PricingRecommendation }) {
  const tip = rec.reasons.join(' ')
  const base: React.CSSProperties = { display: 'block', marginTop: 3, fontSize: '0.72rem', lineHeight: 1.35 }
  if (rec.status === 'under' && rec.nextPrice != null) {
    return (
      <span title={tip} style={{ ...base, color: '#8F3B53', fontWeight: 500 }}>
        ▲ Subir a {formatUyu(rec.nextPrice)}
        <span style={{ fontWeight: 400, color: '#8C8285' }}> · etapa 1 de {rec.stages.length}</span>
      </span>
    )
  }
  if (rec.status === 'ok') return <span title={tip} style={{ ...base, color: '#1E8449' }}>✓ Paga el mínimo por hora</span>
  if (rec.status === 'hold') return <span title={tip} style={{ ...base, color: '#8C8285' }}>Pieza de entrada</span>
  return <span title={tip} style={{ ...base, color: '#8C8285' }}>Sin horas cargadas</span>
}

const cellInput: React.CSSProperties = {
  width: 92, padding: '5px 8px', borderRadius: 6,
  border: '1px solid rgba(31,26,27,0.18)', fontSize: '0.85rem',
}

/** Celda de precio en modo edición: el base y, debajo, un campo por talle. */
function BulkPriceCell({ product, drafts, onBase, onSize }: {
  product: Product
  drafts: Drafts
  onBase: (v: string) => void
  onSize: (sizeId: string, v: string) => void
}) {
  if (product.is_custom_only) {
    return <span style={{ fontSize: '0.8rem', color: '#8C8285' }}>A medida (se cotiza)</span>
  }
  const base = baseIn(drafts, product)
  const dirty = isDraftDirty(drafts, product)
  const sizes = sortedSizes(product)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 150 }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#8C8285' }}>
        Base
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={base}
          onChange={(e) => onBase(e.target.value)}
          aria-label={`Precio base de ${product.name}`}
          style={{ ...cellInput, borderColor: base !== origBase(product) ? '#8F3B53' : 'rgba(31,26,27,0.18)' }}
        />
      </label>
      {sizes.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {sizes.map((s) => {
            const v = sizeIn(drafts, product, s)
            return (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#8C8285' }}>
                {s.size}
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={v}
                  onChange={(e) => onSize(s.id, e.target.value)}
                  placeholder={base || '—'}
                  aria-label={`Precio del talle ${s.size} de ${product.name} (vacío = precio base)`}
                  style={{ ...cellInput, width: 80, borderColor: v !== origSize(s) ? '#8F3B53' : 'rgba(31,26,27,0.18)' }}
                />
              </label>
            )
          })}
        </div>
      )}
      {dirty && <span style={{ fontSize: '0.72rem', color: '#8F3B53', fontWeight: 500 }}>• sin guardar</span>}
    </div>
  )
}

/** Fuera del modo edición: si algún talle tiene precio propio, se avisa el rango. */
function SizePriceSummary({ product }: { product: Product }) {
  const own = (product.sizes ?? []).map((s) => s.price_uyu).filter((n): n is number => !!n)
  if (own.length === 0) return null
  const min = Math.min(...own)
  const max = Math.max(...own)
  return (
    <span style={{ display: 'block', fontSize: '0.72rem', color: '#8C8285', marginTop: 2 }}>
      Talles: {min === max ? formatUyu(min) : `${formatUyu(min)}–${formatUyu(max)}`}
    </span>
  )
}
