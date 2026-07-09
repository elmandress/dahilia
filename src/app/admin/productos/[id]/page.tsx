'use client'

import { useEffect, useState, useCallback, useRef, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category, Color, Collection, Product, ProductMedia, ProductSize, ProductColor } from '@/lib/types'

type LoadedProductColor = Partial<ProductColor> & { color_id?: string; color?: { id: string } }
type LoadedProduct = Omit<Partial<Product>, 'colors'> & {
  category?: { id: string } | null
  media?: ProductMedia[]
  sizes?: ProductSize[]
  colors?: LoadedProductColor[]
}

interface SizeEntry {
  tempId: string
  id?: string
  size: string
  price_uyu: string
  available: boolean
  sort_order: number
}

interface MediaEntry {
  tempId: string
  id?: string
  url: string
  type: 'image' | 'video'
  alt: string
  position: number
  is_primary: boolean
  uploading?: boolean
  progress?: number
  file?: File
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const productId = resolvedParams.id
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [collectionId, setCollectionId] = useState('')
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [dragOver, setDragOver] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(true) // editing is usually manual
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [badge, setBadge] = useState('')
  const [status, setStatus] = useState<'draft' | 'active' | 'soldout'>('draft')
  const [basePriceUyu, setBasePriceUyu] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [discountActive, setDiscountActive] = useState(false)
  const [leadTimeMin, setLeadTimeMin] = useState('2')
  const [leadTimeMax, setLeadTimeMax] = useState('3')
  const [material, setMaterial] = useState('')
  const [careInstructions, setCareInstructions] = useState('')
  const [isCustomOnly, setIsCustomOnly] = useState(false)

  // Media
  const [mediaEntries, setMediaEntries] = useState<MediaEntry[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [storageFiles, setStorageFiles] = useState<string[]>([])
  const [showStoragePicker, setShowStoragePicker] = useState(false)

  // Sizes
  const [sizes, setSizes] = useState<SizeEntry[]>([])

  // Colors
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  // Drag reorder
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const fillProductForm = useCallback((p: LoadedProduct) => {
    setName(p.name || '')
    setSlug(p.slug || '')
    setDescription(p.description || '')
    setCategoryId(p.category_id || p.category?.id || '')
    setCollectionId(p.collection_id || '')
    setBadge(p.badge || '')
    setStatus((p.status as 'draft' | 'active' | 'soldout') || 'draft')
    setBasePriceUyu(p.base_price_uyu ? String(p.base_price_uyu) : '')
    setDiscountPercent(p.discount_percent ? String(p.discount_percent) : '')
    setDiscountActive(!!p.discount_active)
    setLeadTimeMin(p.lead_time_weeks_min ? String(p.lead_time_weeks_min) : '2')
    setLeadTimeMax(p.lead_time_weeks_max ? String(p.lead_time_weeks_max) : '3')
    setMaterial(p.material || '')
    setCareInstructions(p.care_instructions || '')
    setIsCustomOnly(p.is_custom_only || false)

    if (p.media && p.media.length > 0) {
      const mappedMedia: MediaEntry[] = [...p.media]
        .sort((a, b) => a.position - b.position)
        .map((m, idx) => ({
          tempId: `loaded_${m.id || idx}_${Date.now()}`,
          id: m.id,
          url: m.url,
          type: (m.type as 'image' | 'video') || 'image',
          alt: m.alt || '',
          position: m.position || idx,
          is_primary: m.is_primary || idx === 0,
        }))
      setMediaEntries(mappedMedia)
    }

    if (p.sizes && p.sizes.length > 0) {
      const mappedSizes: SizeEntry[] = [...p.sizes]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((s, idx) => ({
          tempId: `loaded_size_${s.id || idx}_${Date.now()}`,
          id: s.id,
          size: s.size,
          price_uyu: s.price_uyu ? String(s.price_uyu) : '',
          available: s.available ?? true,
          sort_order: s.sort_order ?? idx,
        }))
      setSizes(mappedSizes)
    }

    if (p.colors && p.colors.length > 0) {
      const colorIds = p.colors.map((c) => c.color_id || c.color?.id).filter((x): x is string => Boolean(x))
      setSelectedColors(colorIds)
    }
  }, [])

  // Load Categories, Colors and Product
  useEffect(() => {
    const initPage = async () => {
      const supabase = createClient()

      const [catRes, colRes, collRes] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('colors').select('*').order('sort_order'),
        supabase.from('collections').select('*').order('sort_order'),
      ])

      setCategories((catRes.data ?? []) as Category[])
      setColors((colRes.data ?? []) as Color[])
      // Collections are optional (table may not exist yet) — ignore errors.
      if (collRes.data) setCollections(collRes.data as Collection[])

      try {
        const { data: productData, error: productErr } = await supabase
          .from('products')
          .select('*, sizes:product_sizes(*), media:product_media(*), colors:product_colors(*)')
          .eq('id', productId)
          .single()

        if (productErr) throw productErr

        if (productData) {
          fillProductForm(productData as LoadedProduct)
        } else {
          setError('No se pudo encontrar el producto solicitado.')
        }
      } catch (e) {
        console.error('Could not fetch product from Supabase', e)
        setError('Error cargando el producto desde la base de datos.')
      } finally {
        setLoading(false)
      }
    }

    initPage()
  }, [productId, fillProductForm])

  // Auto-slug from name when not in manual mode.
  // setState-in-effect is acceptable here: we are deriving one state from another
  // (name → slug) and React's lint rule over-flags this common pattern.
  useEffect(() => {
    if (!slugManual) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSlug(slugify(name))
    }
  }, [name, slugManual])

  // ---- Media upload ----
  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const supabase = createClient()
    const fileArray = Array.from(files)

    for (const file of fileArray) {
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      if (!isVideo && !isImage) continue

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2)}`
      const ext = file.name.split('.').pop()
      const filePath = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

      const entry: MediaEntry = {
        tempId,
        url: URL.createObjectURL(file),
        type: isVideo ? 'video' : 'image',
        alt: '',
        position: mediaEntries.length,
        is_primary: mediaEntries.length === 0,
        uploading: true,
        progress: 0,
        file,
      }

      setMediaEntries(prev => [...prev, entry])

      const { data, error: uploadError } = await supabase.storage
        .from('media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setMediaEntries(prev => prev.filter(m => m.tempId !== tempId))
        setError(`Error subiendo ${file.name}: ${uploadError.message}`)
        continue
      }

      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(data.path)

      setMediaEntries(prev =>
        prev.map(m =>
          m.tempId === tempId
            ? { ...m, url: publicUrlData.publicUrl, uploading: false, progress: 100 }
            : m
        )
      )
    }
  }, [mediaEntries.length])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files)
    }
  }, [uploadFiles])

  const addByUrl = useCallback((url: string) => {
    const trimmed = url.trim()
    if (!trimmed) return
    const tempId = `url_${Date.now()}_${Math.random().toString(36).slice(2)}`
    setMediaEntries(prev => [...prev, {
      tempId,
      url: trimmed,
      type: 'image',
      alt: '',
      position: prev.length,
      is_primary: prev.length === 0,
    }])
    setUrlInput('')
  }, [])

  const loadStorageFiles = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.storage.from('media').list('products', { limit: 200, sortBy: { column: 'created_at', order: 'desc' } })
    if (data) {
      const urls = data.map(f => {
        const { data: pub } = supabase.storage.from('media').getPublicUrl(`products/${f.name}`)
        return pub.publicUrl
      })
      setStorageFiles(urls)
    }
    setShowStoragePicker(true)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const removeMedia = (tempId: string) => {
    setMediaEntries(prev => {
      const filtered = prev.filter(m => m.tempId !== tempId)
      if (filtered.length > 0 && !filtered.some(m => m.is_primary)) {
        filtered[0].is_primary = true
      }
      return filtered
    })
  }

  const setPrimary = (tempId: string) => {
    setMediaEntries(prev =>
      prev.map(m => ({ ...m, is_primary: m.tempId === tempId }))
    )
  }

  // Media drag reorder
  const handleMediaDragStart = (index: number) => {
    setDragIndex(index)
  }

  const handleMediaDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return

    setMediaEntries(prev => {
      const items = [...prev]
      const [dragged] = items.splice(dragIndex, 1)
      items.splice(index, 0, dragged)
      return items.map((m, i) => ({ ...m, position: i }))
    })
    setDragIndex(index)
  }

  const handleMediaDragEnd = () => {
    setDragIndex(null)
  }

  // ---- Sizes ----
  const addSize = () => {
    setSizes(prev => [
      ...prev,
      {
        tempId: `size_${Date.now()}`,
        size: '',
        price_uyu: '',
        available: true,
        sort_order: prev.length,
      },
    ])
  }

  const updateSize = (tempId: string, field: keyof SizeEntry, value: string | boolean | number) => {
    setSizes(prev => prev.map(s => s.tempId === tempId ? { ...s, [field]: value } : s))
  }

  const removeSize = (tempId: string) => {
    setSizes(prev => prev.filter(s => s.tempId !== tempId))
  }

  // ---- Color toggle ----
  const toggleColor = (colorId: string) => {
    setSelectedColors(prev =>
      prev.includes(colorId) ? prev.filter(c => c !== colorId) : [...prev, colorId]
    )
  }

  // ---- Save updates ----
  const handleSave = async () => {
    if (!name.trim()) {
      setError('El nombre es requerido')
      return
    }
    if (!slug.trim()) {
      setError('El slug es requerido')
      return
    }
    if (!isCustomOnly && !basePriceUyu && sizes.every((s) => !s.price_uyu)) {
      setError('Ingresá un precio base o un precio en al menos un talle.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const supabase = createClient()

      // Update product entry
      const { error: productError } = await supabase
        .from('products')
        .update({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          category_id: categoryId || null,
          collection_id: collectionId || null,
          badge: badge.trim() || null,
          status,
          base_price_uyu: basePriceUyu ? parseInt(basePriceUyu) : null,
          discount_percent: Math.max(0, Math.min(90, parseInt(discountPercent) || 0)),
          discount_active: discountActive,
          lead_time_weeks_min: parseInt(leadTimeMin) || 2,
          lead_time_weeks_max: parseInt(leadTimeMax) || 3,
          material: material.trim() || null,
          care_instructions: careInstructions.trim() || null,
          is_custom_only: isCustomOnly,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)

      if (productError) throw productError

      // Replace product media
      // Delete old media links first
      await supabase.from('product_media').delete().eq('product_id', productId)
      
      if (mediaEntries.length > 0) {
        const stillUploading = mediaEntries.filter((m) => m.uploading)
        if (stillUploading.length > 0) {
          throw new Error(`Esperá a que terminen de subirse ${stillUploading.length} foto(s).`)
        }

        const mediaInserts = mediaEntries
          .filter((m) => !m.uploading && m.url && !m.url.startsWith('blob:'))
          .map((m, i) => ({
            product_id: productId,
            url: m.url,
            type: m.type,
            alt: m.alt || null,
            position: i,
            is_primary: m.is_primary,
          }))

        if (mediaInserts.length > 0) {
          const { error: mediaError } = await supabase.from('product_media').insert(mediaInserts)
          if (mediaError) {
            throw new Error(`No se guardaron las fotos: ${mediaError.message}. Ejecutá database/schema-extra.sql en Supabase.`)
          }
        }
      }

      // Replace sizes
      // Delete old sizes first
      await supabase.from('product_sizes').delete().eq('product_id', productId)

      if (sizes.length > 0) {
        const sizeInserts = sizes
          .filter(s => s.size.trim())
          .map((s, i) => ({
            product_id: productId,
            size: s.size.trim(),
            price_uyu: s.price_uyu ? parseInt(s.price_uyu) : null,
            available: s.available,
            sort_order: i,
          }))

        if (sizeInserts.length > 0) {
          const { error: sizeError } = await supabase.from('product_sizes').insert(sizeInserts)
          if (sizeError) throw new Error(`No se guardaron los talles: ${sizeError.message}`)
        }
      }

      // Replace colors
      await supabase.from('product_colors').delete().eq('product_id', productId)

      if (selectedColors.length > 0) {
        const colorInserts = selectedColors.map((colorId) => ({
          product_id: productId,
          color_id: colorId,
        }))
        const { error: colorError } = await supabase.from('product_colors').insert(colorInserts)
        if (colorError) throw new Error(`No se guardaron los colores: ${colorError.message}`)
      }

      setToast('Producto actualizado exitosamente')
      setTimeout(() => {
        router.push('/admin/productos')
      }, 1000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al guardar cambios'
      console.error('Supabase update failed', err)
      setError(message)
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar permanentemente a "${name}"?`)) return

    try {
      const supabase = createClient()
      const { error: deleteError } = await supabase.from('products').delete().eq('id', productId)
      if (deleteError) throw deleteError
      
      setToast('Producto eliminado exitosamente')
      setTimeout(() => {
        router.push('/admin/productos')
      }, 1000)
    } catch (err) {
      console.error('Supabase deletion failed', err)
      // Si falla, el producto sigue existiendo: quedarse en la página y avisar
      // (redirigir acá haría creer que se borró).
      setError('No se pudo eliminar el producto. Probá de nuevo.')
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
    <>
      <div className="admin-page-header">
        <div>
          <h2>Editar producto</h2>
          <p>
            Modificá los datos del producto o eliminalo
            {status === 'active' && slug && (
              <>
                {' · '}
                <a href={`/tienda/${slug}`} target="_blank" rel="noopener noreferrer" style={{ color: '#8F3B53' }}>
                  Ver en la tienda ↗
                </a>
              </>
            )}
          </p>
        </div>
        <div className="admin-actions admin-actions-desktop" style={{ display: 'flex', gap: '8px' }}>
          <button
            className="admin-btn admin-btn-danger"
            onClick={handleDelete}
          >
            Eliminar
          </button>
          <button
            className="admin-btn admin-btn-secondary"
            onClick={() => router.push('/admin/productos')}
          >
            Cancelar
          </button>
          <button
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {toast && (
        <div style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {toast}
        </div>
      )}

      <div className="admin-form-grid">
        {/* Left Side: Main Details */}
        <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Información general</h3>
          
          <div className="admin-field">
            <label>Nombre del producto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Top Lourdes"
            />
          </div>

          <div className="admin-field">
            <label>Slug (URL)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                disabled={!slugManual}
                style={{ flex: 1 }}
              />
              <button
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => setSlugManual(!slugManual)}
              >
                {slugManual ? 'Auto' : 'Manual'}
              </button>
            </div>
          </div>

          <div className="admin-field">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribí los detalles de la prenda..."
            />
            <span className="field-hint">
              La receta que vende: qué lana es, medidas reales, cómo calza, horas de tejido y con qué combina.
              Sin este texto la ficha no convence, no aparece en Google y no la citan las IA.
            </span>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Categoría</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sin categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {collections.length > 0 && (
              <div className="admin-field">
                <label>Colección</label>
                <select value={collectionId} onChange={(e) => setCollectionId(e.target.value)}>
                  <option value="">Sin colección</option>
                  {collections.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="admin-field">
              <label>Etiqueta / Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ej. Nuevo, Recomiendo"
              />
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Precio base (UYU)</label>
              <input
                type="number"
                value={basePriceUyu}
                onChange={(e) => setBasePriceUyu(e.target.value)}
                placeholder="Ej. 3450"
                disabled={isCustomOnly}
              />
              <span className="field-hint">Se usa si el talle no tiene precio específico</span>
            </div>

            <div className="admin-field">
              <label>Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'soldout')}>
                <option value="draft">Borrador</option>
                <option value="active">Activo / Visible</option>
                <option value="soldout">Agotado</option>
              </select>
            </div>
          </div>

          <div className="admin-form-grid">
            <div className="admin-field">
              <label>Descuento (%)</label>
              <input
                type="number"
                min={0}
                max={90}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="0"
              />
              <span className="field-hint">Entre 0 y 90.</span>
            </div>
            <div className="admin-field">
              <label>Descuento activo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  checked={discountActive}
                  onChange={(e) => setDiscountActive(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#555' }}>Mostrar precio rebajado en la tienda</span>
              </div>
            </div>
          </div>

          <div className="admin-field">
            <label>Prenda a Medida únicamente</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <input
                type="checkbox"
                checked={isCustomOnly}
                onChange={(e) => setIsCustomOnly(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#555' }}>
                Habilitar solo para cotizar (oculta el flujo estándar de carrito)
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Media, Sizes, Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Media Manager */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Fotos y Videos</h3>
            
            <div
              className={`admin-dropzone ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                ref={fileInputRef}
                onChange={(e) => e.target.files && uploadFiles(e.target.files)}
                style={{ display: 'none' }}
              />
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
              <p>Arrastrá varias fotos aquí o hacé clic para elegirlas</p>
              <div className="dropzone-hint">Podés subir varias a la vez · Arrastralas para ordenarlas · La primera es la principal</div>
            </div>

            {/* Agregar por URL de Storage */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                type="url"
                placeholder="Pegar URL de foto ya subida..."
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addByUrl(urlInput))}
                style={{ flex: 1, padding: '7px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.85rem', fontFamily: 'var(--font-sans)' }}
              />
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => addByUrl(urlInput)}
              >
                + URL
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={loadStorageFiles}
              >
                📂 Storage
              </button>
            </div>

            {/* Storage picker modal */}
            {showStoragePicker && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 780, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontWeight: 400, fontFamily: 'var(--font-display)' }}>Fotos en Storage ({storageFiles.length})</h3>
                    <button type="button" onClick={() => setShowStoragePicker(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 20, color: '#555' }}>✕</button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: '#888' }}>Hacé clic en una foto para agregarla a este producto.</p>
                  <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
                    {storageFiles.map(url => {
                      const already = mediaEntries.some(m => m.url === url)
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() => { if (!already) addByUrl(url) }}
                          style={{
                            position: 'relative', aspectRatio: '1', border: already ? '2px solid #4ade80' : '2px solid transparent',
                            borderRadius: 8, overflow: 'hidden', padding: 0, cursor: already ? 'default' : 'pointer',
                            background: '#f5f5f5', opacity: already ? 0.6 : 1,
                          }}
                          title={url.split('/').pop()}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {already && <span style={{ position: 'absolute', top: 4, right: 4, background: '#4ade80', color: '#fff', borderRadius: 999, width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
                        </button>
                      )
                    })}
                  </div>
                  <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowStoragePicker(false)}>Cerrar</button>
                </div>
              </div>
            )}

            {mediaEntries.length > 0 && (
              <div className="admin-media-grid">
                {mediaEntries.map((m, index) => (
                  <div
                    key={m.tempId}
                    className={`admin-media-item ${m.is_primary ? 'primary' : ''} ${dragIndex === index ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleMediaDragStart(index)}
                    onDragOver={(e) => handleMediaDragOver(e, index)}
                    onDragEnd={handleMediaDragEnd}
                  >
                    {m.type === 'video' ? (
                      <>
                        <video src={m.url} />
                        <div className="video-icon">
                          <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                        </div>
                      </>
                    ) : (
                      // Admin preview thumbnail; next/image adds complexity for a CMS-only view.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt="" />
                    )}

                    {m.uploading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem' }}>
                        Subiendo...
                      </div>
                    )}

                    {m.is_primary && <span className="primary-badge">Principal</span>}

                    <div className="media-overlay">
                      {!m.is_primary && (
                        <button onClick={() => setPrimary(m.tempId)}>
                          Principal
                        </button>
                      )}
                      <button className="danger" onClick={() => removeMedia(m.tempId)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sizes and pricing */}
          {!isCustomOnly && (
            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontWeight: 400, fontFamily: 'var(--font-display)' }}>Talles y precios</h3>
                <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={addSize}>
                  + Agregar Talle
                </button>
              </div>

              {sizes.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: '#888', textAlign: 'center', padding: '1rem' }}>
                  Usará precio base único para todos los talles
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {sizes.map((s) => (
                    <div key={s.tempId} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={s.size}
                        onChange={(e) => updateSize(s.tempId, 'size', e.target.value)}
                        placeholder="Ej. M"
                        style={{ width: '80px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                      <input
                        type="number"
                        value={s.price_uyu}
                        onChange={(e) => updateSize(s.tempId, 'price_uyu', e.target.value)}
                        placeholder="Precio (opcional)"
                        style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid #ddd' }}
                      />
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={s.available}
                          onChange={(e) => updateSize(s.tempId, 'available', e.target.checked)}
                        />
                        Stock
                      </label>
                      <button className="admin-btn-icon danger" onClick={() => removeSize(s.tempId)} aria-label={`Quitar talle ${s.size || ''}`} title="Quitar talle">
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Color pickers */}
          <div className="admin-card">
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 400, fontFamily: 'var(--font-display)' }}>Colores Disponibles</h3>
            {colors.length === 0 ? (
              <div style={{ fontSize: '0.85rem', color: '#888' }}>
                No hay colores creados. Configuralos en la sección de Colores.
              </div>
            ) : (
              <div className="admin-color-list">
                {colors.map(col => {
                  const isSelected = selectedColors.includes(col.id)
                  return (
                    <div
                      key={col.id}
                      className={`admin-color-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleColor(col.id)}
                    >
                      <div className="chip-swatch" style={{ background: col.hex }} />
                      <span>{col.name}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Details (Lead times / Care) */}
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, fontWeight: 400, fontFamily: 'var(--font-display)' }}>Especificaciones</h3>
            
            <div className="admin-form-grid">
              <div className="admin-field">
                <label>Tiempo mínimo (semanas)</label>
                <input
                  type="number"
                  value={leadTimeMin}
                  onChange={(e) => setLeadTimeMin(e.target.value)}
                />
              </div>
              <div className="admin-field">
                <label>Tiempo máximo (semanas)</label>
                <input
                  type="number"
                  value={leadTimeMax}
                  onChange={(e) => setLeadTimeMax(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-field">
              <label>Materiales</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Ej. 100% Algodón Pima"
              />
            </div>

            <div className="admin-field">
              <label>Cuidado y lavado</label>
              <input
                type="text"
                value={careInstructions}
                onChange={(e) => setCareInstructions(e.target.value)}
                placeholder="Ej. Lavar a mano, secar en horizontal"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar — mobile-only */}
      <div className="admin-mobile-save-bar">
        <button
          className="admin-btn admin-btn-danger admin-btn-sm"
          onClick={handleDelete}
          aria-label="Eliminar producto"
          style={{ minWidth: 44 }}
        >
          ×
        </button>
        <button
          className="admin-btn admin-btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ flex: 1 }}
        >
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </>
  )
}
